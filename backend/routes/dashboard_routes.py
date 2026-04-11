from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Analysis, AIModel, User
from schemas import DashboardStats
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total de pacientes únicos com análises
    active_patients = (
        db.query(func.count(func.distinct(Analysis.patient_cpf)))
        .filter(Analysis.patient_cpf.isnot(None))
        .scalar()
    ) or 0

    # Análises realizadas hoje
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    analyses_today = (
        db.query(func.count(Analysis.id))
        .filter(Analysis.created_at >= today_start)
        .scalar()
    ) or 0

    # Precisão média das análises
    avg_confidence = (
        db.query(func.avg(Analysis.confidence)).scalar()
    )
    average_accuracy = f"{round(avg_confidence, 0):.0f}%" if avg_confidence else "0%"

    # Modelos ativos (que possuem ao menos 1 análise)
    active_models = db.query(AIModel).count()

    return DashboardStats(
        active_patients=active_patients,
        analyses_today=analyses_today,
        average_accuracy=average_accuracy,
        active_models=active_models,
    )
