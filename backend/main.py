import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Garantir que o diretório do backend esteja no path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import AIModel

from routes.auth_routes import router as auth_router
from routes.model_routes import router as model_router
from routes.analysis_routes import router as analysis_router
from routes.dashboard_routes import router as dashboard_router
from routes.patient_routes import router as patient_router

app = FastAPI(
    title="Avicena API",
    description="API do Sistema Avicena — Diagnóstico assistido por IA",
    version="1.0.0",
)

# ── CORS ────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rotas ───────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(model_router)
app.include_router(analysis_router)
app.include_router(dashboard_router)
app.include_router(patient_router)

# ── Servir uploads ──────────────────────────────────────────────

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Seed de modelos de IA ───────────────────────────────────────

SEED_MODELS = [
    {
        "id": "skinnet",
        "name": "SkinNet v2",
        "category": "Dermatologia",
        "description": "Análise de lesões de pele, melanoma e condições dermatológicas",
        "accuracy": "96%",
        "color_gradient": "from-orange-500 to-red-500",
        "icon_name": "Scan",
    },
    {
        "id": "chestxray",
        "name": "ChestX-Ray AI",
        "category": "Pneumologia",
        "description": "Detecção de pneumonia, tuberculose e outras condições pulmonares",
        "accuracy": "94%",
        "color_gradient": "from-blue-500 to-cyan-500",
        "icon_name": "Stethoscope",
    },
    {
        "id": "retinalscan",
        "name": "RetinalScan",
        "category": "Oftalmologia",
        "description": "Diagnóstico de retinopatia diabética e degeneração macular",
        "accuracy": "93%",
        "color_gradient": "from-purple-500 to-pink-500",
        "icon_name": "Eye",
    },
    {
        "id": "cardioai",
        "name": "CardioAI",
        "category": "Cardiologia",
        "description": "Análise de ECG e detecção de arritmias cardíacas",
        "accuracy": "92%",
        "color_gradient": "from-red-500 to-rose-500",
        "icon_name": "Heart",
    },
    {
        "id": "bonefracture",
        "name": "BoneFracture AI",
        "category": "Ortopedia",
        "description": "Detecção de fraturas e anomalias ósseas em raio-X",
        "accuracy": "95%",
        "color_gradient": "from-gray-600 to-gray-800",
        "icon_name": "Bone",
    },
    {
        "id": "neuralscan",
        "name": "NeuralScan",
        "category": "Neurologia",
        "description": "Análise de ressonância magnética cerebral e detecção de anomalias",
        "accuracy": "91%",
        "color_gradient": "from-indigo-500 to-purple-600",
        "icon_name": "Brain",
    },
]


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(AIModel).count()
        if existing == 0:
            for m in SEED_MODELS:
                db.add(AIModel(**m))
            db.commit()
            print("✅ Modelos de IA inseridos no banco de dados")
        else:
            print(f"ℹ️  {existing} modelos já existem no banco")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Avicena API está rodando", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
