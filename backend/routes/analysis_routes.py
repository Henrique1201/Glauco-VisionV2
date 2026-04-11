import os
import random
import time
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Analysis, AIModel, Patient, User
from schemas import AnalysisResponse, FindingSchema
from auth import get_current_user

router = APIRouter(prefix="/api/analyses", tags=["Análises"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Dados para geração simulada de resultados ───────────────────

FINDINGS_BY_CATEGORY = {
    "Dermatologia": [
        {"severity": "high", "text": "Lesão pigmentada assimétrica detectada"},
        {"severity": "medium", "text": "Bordas irregulares presentes"},
        {"severity": "low", "text": "Variação de cor observada"},
        {"severity": "medium", "text": "Diâmetro acima de 6mm identificado"},
    ],
    "Pneumologia": [
        {"severity": "high", "text": "Opacidade pulmonar detectada"},
        {"severity": "medium", "text": "Infiltrado intersticial presente"},
        {"severity": "low", "text": "Leve aumento da área cardíaca"},
        {"severity": "medium", "text": "Consolidação no lobo inferior"},
    ],
    "Oftalmologia": [
        {"severity": "high", "text": "Microaneurismas retinianos detectados"},
        {"severity": "medium", "text": "Exsudatos duros presentes"},
        {"severity": "low", "text": "Alteração no disco óptico observada"},
        {"severity": "medium", "text": "Hemorragias retinianas identificadas"},
    ],
    "Cardiologia": [
        {"severity": "high", "text": "Arritmia ventricular detectada"},
        {"severity": "medium", "text": "Intervalo QT prolongado"},
        {"severity": "low", "text": "Desvio do eixo cardíaco"},
        {"severity": "medium", "text": "Alteração no segmento ST"},
    ],
    "Ortopedia": [
        {"severity": "high", "text": "Fratura transversal detectada"},
        {"severity": "medium", "text": "Linha de fratura visível no córtex"},
        {"severity": "low", "text": "Edema de partes moles adjacente"},
        {"severity": "medium", "text": "Desalinhamento ósseo identificado"},
    ],
    "Neurologia": [
        {"severity": "high", "text": "Lesão expansiva detectada"},
        {"severity": "medium", "text": "Alteração de sinal na substância branca"},
        {"severity": "low", "text": "Atrofia cortical discreta observada"},
        {"severity": "medium", "text": "Realce anômalo pós-contraste"},
    ],
}

RECOMMENDATIONS_BY_CATEGORY = {
    "Dermatologia": "Esta análise sugere a necessidade de avaliação dermatológica presencial. Recomenda-se biópsia para confirmação diagnóstica.",
    "Pneumologia": "Os achados sugerem possível processo infeccioso pulmonar. Recomenda-se correlação clínico-laboratorial e acompanhamento com pneumologista.",
    "Oftalmologia": "Achados compatíveis com retinopatia. Recomenda-se avaliação com oftalmologista especialista em retina para conduta terapêutica.",
    "Cardiologia": "Alterações eletrocardiográficas identificadas. Recomenda-se avaliação cardiológica completa com ecocardiograma.",
    "Ortopedia": "Achados compatíveis com fratura. Recomenda-se imobilização imediata e avaliação ortopédica para planejamento terapêutico.",
    "Neurologia": "Achados que necessitam investigação adicional. Recomenda-se avaliação neurológica com exames complementares.",
}


def _generate_findings(category: str) -> list[dict]:
    pool = FINDINGS_BY_CATEGORY.get(category, FINDINGS_BY_CATEGORY["Dermatologia"])
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

    # Simular processamento
    start = time.time()
    findings = _generate_findings(ai_model.category)
    confidence = round(random.uniform(82, 98), 1)
    elapsed = round(time.time() - start + random.uniform(0.5, 2.0), 1)

    recommendation = RECOMMENDATIONS_BY_CATEGORY.get(
        ai_model.category,
        "Recomenda-se consulta com especialista para avaliação clínica completa.",
    )

    analysis = Analysis(
        user_id=current_user.id,
        patient_id=patient.id if patient else None,
        model_id=model_id,
        image_path=f"/uploads/{filename}",
        confidence=confidence,
        findings=findings,
        recommendation=recommendation,
        processing_time=f"{elapsed}s",
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
