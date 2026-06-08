from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from datetime import date
from enum import Enum
import re


# --- Enums ---
class RequestType(str, Enum):
    corrective = "corrective"
    preventive = "preventive"


class RequestPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class RequestStage(str, Enum):
    new = "new"
    in_progress = "in_progress"
    repaired = "repaired"
    scrap = "scrap"


# --- AUTH SCHEMAS (NEW) ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    re_password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        # Regex: At least one lowercase, one uppercase, one special char, min 8 chars
        regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
        if not re.match(regex, v):
            raise ValueError(
                "Password must be 8+ chars with upper, lower & special char"
            )
        return v

    @field_validator("re_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        # Pydantic V2 uses 'info.data' to access other fields
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserShow(BaseModel):
    name: str
    email: EmailStr
    is_active: bool
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class Token(BaseModel):
    access_token: str
    token_type: str


# --- TECHNICIAN SCHEMAS ---
class TechnicianBase(BaseModel):
    name: str


class TechnicianCreate(TechnicianBase):
    team_id: Optional[int] = None


class Technician(TechnicianBase):
    id: int
    team_id: Optional[int] = None

    class Config:
        from_attributes = True


# --- TEAM SCHEMAS ---
class TeamBase(BaseModel):
    name: str


class TeamCreate(TeamBase):
    pass


class Team(TeamBase):
    id: int
    members: List[Technician] = []

    class Config:
        from_attributes = True


# --- EQUIPMENT SCHEMAS ---
class EquipmentBase(BaseModel):
    name: str
    serial_no: Optional[str] = None
    category: Optional[str] = "General"
    department: Optional[str] = "Unassigned"
    image_url: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class Equipment(EquipmentBase):
    id: int
    is_scrapped: bool
    open_requests: Optional[int] = 0

    class Config:
        from_attributes = True


# --- REQUEST SCHEMAS ---
class RequestBase(BaseModel):
    subject: str
    description: Optional[str] = None
    request_type: RequestType = RequestType.corrective
    priority: RequestPriority = RequestPriority.low
    schedule_date: Optional[date] = None
    equipment_id: int
    team_id: Optional[int] = None
    technician_id: Optional[int] = None


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    stage: RequestStage


class Request(RequestBase):
    id: int
    stage: RequestStage

    equipment: Optional[Equipment] = None
    team: Optional[Team] = None
    technician: Optional[Technician] = None

    class Config:
        from_attributes = True
