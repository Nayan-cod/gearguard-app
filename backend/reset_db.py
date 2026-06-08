# backend/reset_db.py
from database import engine, Base
from models import User, Equipment, Request, Team, Technician

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Recreating all tables...")
Base.metadata.create_all(bind=engine)
print("Done! Database has been reset.")
