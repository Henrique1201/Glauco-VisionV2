import os
import random
import time
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Analysis, AIModel, Patient, User
from schemas import AnalysisResponse, FindingSchema, AnalysisUpdate
from auth import get_current_user
from ai.glaucoma_classifier import GlaucomaClassifier
from ai.segmentation import segmentar_disco_optico
import cv2

router = APIRouter(prefix="/api/analyses", tags=["Análises"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Inicializar classificador de IA ─────────────────────────────
classifier = GlaucomaClassifier()

# ── Dados para geração simulada de resultados ───────────────────

FINDINGS_BY_CATEGORY = {
    "Oftalmologia": [
        {"severity": "high", "text": "Aumento suspeito da escavação do disco óptico (Relação E/D > 0.6)"},
        {"severity": "high", "text": "Afinamento peripapilar da camada de fibras nervosas da retina"},
        {"severity": "medium", "text": "Hemorragia de disco óptico (menor)"},
        {"severity": "low", "text": "Pequena assimetria de escavação entre os olhos"},
        {"severity": "high", "text": "Notching (entalhe) na rima neural localizado inferiormente"},
    ],
}

RECOMMENDATIONS_BY_CATEGORY = {
    "Oftalmologia": "Achados fortemente indicativos de neuropatia óptica glaucomatosa. Recomenda-se aferição da pressão intraocular (PIO), campimetria visual computadorizada e possível início de terapia hipotensora ocular imediatamente.",
}


def _generate_findings(category: str) -> list[dict]:
    pool = FINDINGS_BY_CATEGORY.get("Oftalmologia", [])
    count = random.randint(2, min(4, len(pool)))
    selected = random.sample(pool, count)
    for f in selected:
        f["confidence"] = f"{random.randint(70, 98)}%"
    return selected


def _build_analysis_response(analysis: Analysis, db: Session) -> dict:
    model = db.query(AIModel).filter(AIModel.id == analysis.model_id).first()
    patient = db.query(Patient).filter(Patient.id == analysis.patient_id).first() if analysis.patient_id else None
    data = {
        "id": analysis.id,
        "user_id": analysis.user_id,
        "patient_id": analysis.patient_id,
        "patient_name": patient.name if patient else "Paciente",
        "patient_cpf": patient.cpf if patient else None,
        "patient_age": patient.age if patient else None,
        "model_id": analysis.model_id,
        "model_name": model.name if model else None,
        "model_category": model.category if model else None,
        "image_path": analysis.image_path,
        "segmented_image_path": analysis.segmented_image_path,
        "confidence": analysis.confidence,
        "findings": analysis.findings,
        "recommendation": analysis.recommendation,
        "processing_time": analysis.processing_time,
        "status": analysis.status,
        "created_at": analysis.created_at,
    }
    return data


# ── Endpoints ───────────────────────────────────────────────────

@router.post("", response_model=AnalysisResponse)
async def create_analysis(
    model_id: str = Form(...),
    patient_name: str = Form(...),
    patient_cpf: Optional[str] = Form(None),
    patient_age: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verificar modelo
    ai_model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not ai_model:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")

    # Buscar ou criar paciente
    patient = None
    if patient_cpf:
        patient = db.query(Patient).filter(Patient.cpf == patient_cpf).first()
        if not patient:
            patient = Patient(
                name=patient_name,
                cpf=patient_cpf,
                age=patient_age,
                doctor_id=current_user.id,
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)

    # Salvar imagem
    ext = os.path.splitext(image.filename or "img.png")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    content = await image.read()
    with open(filepath, "wb") as f:
        f.write(content)

    # ── Segmentação da Imagem ──
    segmented_filename = f"{uuid.uuid4().hex}_seg.png"
    segmented_filepath = os.path.join(UPLOAD_DIR, segmented_filename)
    try:
        seg_bgr = segmentar_disco_optico(filepath)
        cv2.imwrite(segmented_filepath, seg_bgr)
        # ── Inferência de IA na imagem segmentada ──
        ai_result = classifier.predict(segmented_filepath)
    except Exception as e:
        print(f"Erro na segmentação: {e}")
        segmented_filename = None
        # Fallback caso dê erro na segmentação
        ai_result = classifier.predict(filepath)

    confidence = ai_result["confidence"]
    findings = ai_result["findings"]
    recommendation = ai_result["recommendation"]
    elapsed = ai_result["processing_time"]

    analysis = Analysis(
        user_id=current_user.id,
        patient_id=patient.id if patient else None,
        model_id=model_id,
        image_path=f"/uploads/{filename}",
        segmented_image_path=f"/uploads/{segmented_filename}" if segmented_filename else None,
        confidence=confidence,
        findings=findings,
        recommendation=recommendation,
        processing_time=elapsed,
        status="completed",
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return _build_analysis_response(analysis, db)


@router.get("", response_model=list[AnalysisResponse])
def list_analyses(
    search: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Analysis)

    # Médicos veem todas; pacientes só as próprias
    if current_user.type == "patient":
        query = query.filter(Analysis.user_id == current_user.id)

    # Filtro de busca por nome ou CPF do paciente
    if search:
        patient_ids = (
            db.query(Patient.id)
            .filter(
                (Patient.name.ilike(f"%{search}%"))
                | (Patient.cpf.ilike(f"%{search}%"))
            )
            .all()
        )
        patient_id_list = [pid[0] for pid in patient_ids]
        query = query.filter(Analysis.patient_id.in_(patient_id_list))

    # Filtro por especialidade (via join com AIModel)
    if condition and condition != "all":
        query = query.join(AIModel).filter(AIModel.category == condition)

    query = query.order_by(Analysis.created_at.desc())

    if limit:
        query = query.limit(limit)

    analyses = query.all()
    return [_build_analysis_response(a, db) for a in analyses]


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")

    # Paciente só vê as próprias
    if current_user.type == "patient" and analysis.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    return _build_analysis_response(analysis, db)


@router.put("/{analysis_id}", response_model=AnalysisResponse)
def update_analysis(
    analysis_id: int,
    req: AnalysisUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")

    # Apenas o médico ou o dono podem editar
    if current_user.type == "patient" and analysis.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    if req.recommendation is not None:
        analysis.recommendation = req.recommendation
    if req.status is not None:
        analysis.status = req.status

    db.commit()
    db.refresh(analysis)
    return _build_analysis_response(analysis, db)


@router.delete("/{analysis_id}", status_code=204)
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")

    if current_user.type == "patient" and analysis.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    # Excluir a imagem associada, se existir
    if analysis.image_path:
        filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", analysis.image_path.lstrip("/"))
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Erro ao deletar imagem: {e}")

    db.delete(analysis)
    db.commit()

