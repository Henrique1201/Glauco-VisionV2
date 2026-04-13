from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import AIModel
from schemas import ModelResponse
from auth import get_current_user

router = APIRouter(prefix="/api/models", tags=["Modelos de IA"])


@router.get("", response_model=List[ModelResponse])
def list_models(db: Session = Depends(get_db), _=Depends(get_current_user)):
    models = db.query(AIModel).all()
    return [ModelResponse.model_validate(m) for m in models]
