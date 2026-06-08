from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import List
import models, database, schemas
# --- CONFIG ---
SECRET_KEY = "your_super_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
# FIXED LINE: Use database.Base instead of models.Base
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()


# Allow Next.js frontend to talk to backend
# UPDATE THIS SECTION
app.add_middleware(
    CORSMiddleware,
    # Allow specifically your frontend origin
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # <--- ADD THIS
        "http://127.0.0.1:3001",  # <--- ADD THIS
    ],
    # Allow cookies and credentials (CRITICAL for login)
    allow_credentials=True,
    # Allow all HTTP methods (POST, GET, OPTIONS, etc.)
    allow_methods=["*"],
    # Allow all headers (Content-Type, Authorization, etc.)
    allow_headers=["*"],
)
# --- AUTH UTILS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/api/users/me", response_model=schemas.UserShow) # Ensure schema exists or use UserCreate/User
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/api/users/me", response_model=schemas.UserShow)
def update_user(user_update: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if user_update.name:
        current_user.name = user_update.name
    if user_update.email:
        # Check if email is taken by another user
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

# --- AUTH ROUTES ---
@app.post("/auth/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if email exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Account already exists")

    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(email=user.email, name=user.name, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}


@app.post("/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Account not exist")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid Password")

    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# --- DUMMY DATA LOADER (Video Content) ---
@app.on_event("startup")
def populate_dummy_data():
    db = database.SessionLocal()
    if db.query(models.Equipment).count() == 0:
        # Create Teams
        t1 = models.Team(name="Mechanical Team")
        t2 = models.Team(name="Electrical Team")
        t3 = models.Team(name="IT Support")
        db.add_all([t1, t2, t3])
        db.commit()

        # Create Technicians (for Teams Page)
        tech1 = models.Technician(name="Mike Johnson", team_id=t1.id)
        tech2 = models.Technician(name="Tom Rodriguez", team_id=t1.id)
        tech3 = models.Technician(name="Steve Wilson", team_id=t1.id)
        
        tech4 = models.Technician(name="Lisa Park", team_id=t2.id)
        tech5 = models.Technician(name="Jennifer Wu", team_id=t2.id)
        tech6 = models.Technician(name="Carlos Martinez", team_id=t2.id)
        
        tech7 = models.Technician(name="Alex Chen", team_id=t3.id)
        tech8 = models.Technician(name="Kevin Zhang", team_id=t3.id)
        tech9 = models.Technician(name="Rachel Green", team_id=t3.id)
        
        db.add_all([tech1, tech2, tech3, tech4, tech5, tech6, tech7, tech8, tech9])
        db.commit()

        # Create Equipment (from Screenshots)
        e1 = models.Equipment(
            name="CNC Machine Alpha-200",
            serial_no="CNC-2024-001",
            category="Manufacturing",
            department="Factory Floor A - Station 3",
            image_url="/equipment/cnc.jpg"
        )
        e2 = models.Equipment(
            name="Dell Laptop Pro-15",
            serial_no="DLP-2024-045",
            category="Sales",
            department="Office Building B - Desk 24",
             image_url="/equipment/laptop.jpg"
        )
        e3 = models.Equipment(
            name="Forklift Hyster H50",
            serial_no="FLT-2024-012",
            category="Warehouse",
            department="Warehouse Section C",
             image_url="/equipment/forklift.jpg",
             is_scrapped=True
        )
        e4 = models.Equipment(
            name="Air Compressor AC-500",
            serial_no="AC-2024-008",
            category="Maintenance",
            department="Utility Room 2",
             image_url="/equipment/compressor.jpg"
        )
        e5 = models.Equipment(
            name="3D Printer Ultimaker S5",
            serial_no="3DP-2024-003",
            category="R&D",
            department="Lab Room 15",
             image_url="/equipment/printer.jpg"
        )
        e6 = models.Equipment(
            name="HVAC Unit Central-A",
            serial_no="HVAC-2024-001",
            category="Facilities",
            department="Rooftop - Building A",
             image_url="/equipment/hvac.jpg"
        )
        db.add_all([e1, e2, e3, e4, e5, e6])
        db.commit()

        # Create Requests (from Screenshots)
        r1 = models.Request(
            subject="CNC Machine Oil Leak",
            description="Machine is leaking hydraulic oil from the main cylinder. Production has been stopped.",
            request_type="corrective",
            priority="high",
            stage="new",
            schedule_date=datetime.now().date() + timedelta(days=1),
            equipment_id=e1.id,
            team_id=t1.id,
        )
        r2 = models.Request(
            subject="Laptop Screen Flickering",
            description="Screen intermittently flickers and shows distorted colors. User reports it started yesterday.",
            request_type="corrective",
            priority="medium",
            stage="in_progress",
            schedule_date=datetime.now().date() - timedelta(days=1),
            equipment_id=e2.id,
            team_id=t3.id,
            technician_id=tech7.id
        )
        r3 = models.Request(
            subject="Forklift Battery Replacement",
            description="Battery showing signs of degradation. Charge time increased and runtime decreased.",
            request_type="preventive",
            priority="medium",
            stage="repaired",
            schedule_date=datetime.now().date() - timedelta(days=5),
            equipment_id=e3.id,
            team_id=t1.id,
            technician_id=tech2.id
        )
        r4 = models.Request(
            subject="Air Compressor Pressure Drop",
            description="Compressor not maintaining proper pressure. Drops from 120 PSI to 80 PSI.",
            request_type="corrective",
            priority="high",
            stage="in_progress", # Overdue example
            schedule_date=datetime.now().date() - timedelta(days=2),
            equipment_id=e4.id,
            team_id=t2.id,
            technician_id=tech4.id
        )
        r5 = models.Request(
            subject="3D Printer Nozzle Clog",
            description="Printer unable to extrude filament properly. Print quality severely degraded.",
            request_type="corrective",
            priority="medium",
            stage="in_progress",
            schedule_date=datetime.now().date(),
            equipment_id=e5.id,
            team_id=t3.id,
            technician_id=tech8.id
        )
        r6 = models.Request(
            subject="Monthly HVAC Filter Replacement",
            description="Scheduled monthly maintenance for HVAC system including filter replacement and system check.",
            request_type="preventive",
            priority="low",
            stage="new",
            schedule_date=datetime.now().date() + timedelta(days=10),
            equipment_id=e6.id,
            team_id=t2.id
        )
        r7 = models.Request(
             subject="CNC Machine Calibration Check",
             description="Quarterly precision calibration and accuracy verification for CNC machine.",
             request_type="preventive",
             priority="medium",
             stage="scrap",
             schedule_date=datetime.now().date() - timedelta(days=10),
             equipment_id=e1.id,
             team_id=t1.id,
             technician_id=tech1.id
        )
        r8 = models.Request(
             subject="HVAC Temperature Control Issue",
             description="Building temperature inconsistent. Some areas too hot, others too cold.",
             request_type="corrective",
             priority="high",
             stage="new",
             schedule_date=datetime.now().date() + timedelta(days=2),
             equipment_id=e6.id
        )

        db.add_all([r1, r2, r3, r4, r5, r6, r7, r8])
        db.commit()
    db.close()


# --- DASHBOARD STATS ---
@app.get("/api/stats")
def get_stats(db: Session = Depends(database.get_db)):
    return {
        "total_equipment": db.query(models.Equipment).count(),
        # Count requests that are NOT 'repaired'
        "active_requests": db.query(models.Request)
        .filter(models.Request.stage != "repaired")
        .count(),
        "overdue_tasks": 1,
        "teams_available": db.query(models.Team).count(),
    }


# --- EQUIPMENT ---
@app.get("/api/equipment")
def get_equipment(db: Session = Depends(database.get_db)):
    equipment = db.query(models.Equipment).all()
    # Add "open_requests" count manually for the UI cards
    data = []
    for eq in equipment:
        open_reqs = (
            db.query(models.Request)
            .filter(
                models.Request.equipment_id == eq.id, models.Request.stage != "repaired"
            )
            .count()
        )
        # Convert SQLAlchemy object to dict and add the count
        eq_dict = eq.__dict__
        eq_dict["open_requests"] = open_reqs
        data.append(eq_dict)
    return data


@app.post("/api/equipment")
def create_equipment(
    eq: schemas.EquipmentCreate, db: Session = Depends(database.get_db)
):
    new_eq = models.Equipment(**eq.dict())
    db.add(new_eq)
    db.commit()
    db.refresh(new_eq)
    return new_eq


# --- REQUESTS (KANBAN & CALENDAR) ---
@app.get("/api/requests", response_model=List[schemas.Request])
def get_requests(db: Session = Depends(database.get_db)):
    return db.query(models.Request).all()


@app.post("/api/requests", response_model=schemas.Request)
def create_request(req: schemas.RequestCreate, db: Session = Depends(database.get_db)):
    new_req = models.Request(**req.dict())
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req


@app.put("/api/requests/{req_id}/move")
def move_request(req_id: int, new_stage: str, db: Session = Depends(database.get_db)):
    req = db.query(models.Request).filter(models.Request.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req.stage = new_stage

    # Logic: If Scrap, mark equipment as scrapped
    if new_stage == "scrap" and req.equipment:
        req.equipment.is_scrapped = True

    db.commit()
    return {"status": "success"}


# --- TEAMS ---
@app.get("/api/teams", response_model=List[schemas.Team])
def get_teams(db: Session = Depends(database.get_db)):
    return db.query(models.Team).all()


@app.post("/api/technicians", response_model=schemas.Technician)
def create_technician(tech: schemas.TechnicianCreate, db: Session = Depends(database.get_db)):
    # Check if team exists
    team = db.query(models.Team).filter(models.Team.id == tech.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    new_tech = models.Technician(name=tech.name, team_id=tech.team_id)
    db.add(new_tech)
    db.commit()
    db.refresh(new_tech)
    return new_tech

