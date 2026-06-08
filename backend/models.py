from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Float, Enum,Text
from sqlalchemy.orm import relationship
from database import Base
import enum


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)





class RequestStage(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    REPAIRED = "repaired"
    SCRAP = "scrap"


class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    members = relationship("Technician", back_populates="team")
    requests = relationship("Request", back_populates="team")


class Technician(Base):
    __tablename__ = "technicians"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    team_id = Column(Integer, ForeignKey("teams.id"))
    team = relationship("Team", back_populates="members")


class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    serial_no = Column(String)
    category = Column(String)
    department = Column(String)
    is_scrapped = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)  # For the card images
    requests = relationship("Request", back_populates="equipment")


class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    description = Column(String)
    request_type = Column(String)  # 'corrective' or 'preventive'
    priority = Column(String)  # 'low', 'medium', 'high'
    stage = Column(String, default="new")  # 'new', 'in_progress', 'repaired', 'scrap'
    schedule_date = Column(Date, nullable=True)

    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    technician_id = Column(Integer, ForeignKey("technicians.id"), nullable=True)

    equipment = relationship("Equipment", back_populates="requests")
    team = relationship("Team", back_populates="requests")
