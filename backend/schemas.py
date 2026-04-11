from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Auth ────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str
    type: str  # 'patient' ou 'doctor'


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    type: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    type: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# ── AI Models ───────────────────────────────────────────────────

class ModelResponse(BaseModel):
    id: str
    name: str
    category: str
    description: str
    accuracy: str
    color_gradient: str
    icon_name: str

    class Config:
        from_attributes = True


# ── Analysis ────────────────────────────────────────────────────

class FindingSchema(BaseModel):
    severity: str
    text: str
    confidence: str


class AnalysisResponse(BaseModel):
    id: int
    user_id: int
    patient_name: str
    patient_cpf: Optional[str] = None
    patient_age: Optional[str] = None
    model_id: str
    model_name: Optional[str] = None
    model_category: Optional[str] = None
    image_path: Optional[str] = None
    confidence: float
    findings: Optional[List[FindingSchema]] = None
    recommendation: Optional[str] = None
    processing_time: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard ───────────────────────────────────────────────────

class DashboardStats(BaseModel):
    active_patients: int
    analyses_today: int
    average_accuracy: str
    active_models: int
