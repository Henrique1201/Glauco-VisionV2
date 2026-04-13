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
        "id": "glaucovision",
        "name": "Glauco-Vision",
        "category": "Oftalmologia",
        "description": "Análise avançada para detecção de Glaucoma baseada na estrutura do disco óptico e escavação papilar.",
        "accuracy": "99%",
        "color_gradient": "from-teal-500 to-emerald-500",
        "icon_name": "Eye",
    }
]


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Forçamos a deleção dos modelos atuais e adicionamos apenas o Glauco-Vision, para ter certeza que é o único model
        db.query(AIModel).delete()
        for m in SEED_MODELS:
            db.add(AIModel(**m))
        db.commit()
        print("✅ Modelo Glauco-Vision inserido no banco de dados com sucesso")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Avicena API está rodando", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
