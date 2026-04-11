from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)  # CRM ou CPF
    password_hash = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)  # 'patient' ou 'doctor'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analyses = relationship("Analysis", back_populates="user")


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    accuracy = Column(String(10), nullable=False)
    color_gradient = Column(String(100), nullable=False)
    icon_name = Column(String(50), nullable=False)

    analyses = relationship("Analysis", back_populates="model")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String(255), nullable=False)
    patient_cpf = Column(String(20), nullable=True)
    patient_age = Column(String(20), nullable=True)
    model_id = Column(String(50), ForeignKey("ai_models.id"), nullable=False)
    image_path = Column(String(500), nullable=True)
    confidence = Column(Float, nullable=False)
    findings = Column(JSON, nullable=True)
    recommendation = Column(Text, nullable=True)
    processing_time = Column(String(20), nullable=True)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="analyses")
    model = relationship("AIModel", back_populates="analyses")
