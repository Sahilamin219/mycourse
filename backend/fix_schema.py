"""
Script to fix database schema mismatch.
Drops existing tables and recreates them with correct types.
WARNING: This will delete all existing data!
"""
from sqlalchemy import text
from database import engine, Base
from models import User, DebateSession, DebateTranscript, Payment, Notification, Resource

def fix_schema():
    print("Fixing database schema...")
    print("WARNING: This will drop all existing tables and data!")
    
    with engine.connect() as conn:
        # Drop all tables in the correct order (respecting foreign key constraints)
        print("\nDropping existing tables...")
        conn.execute(text("DROP TABLE IF EXISTS debate_transcripts CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS debate_sessions CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS payments CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS notifications CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS improve_yourself_resources CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        conn.commit()
        print("Tables dropped successfully!")
    
    # Recreate all tables with correct schema
    print("\nCreating tables with correct schema...")
    Base.metadata.create_all(bind=engine)
    print("\nDatabase schema fixed successfully!")
    print("\nTables created:")
    print("- users (id: VARCHAR/UUID)")
    print("- debate_sessions (id: VARCHAR/UUID, user_id: VARCHAR)")
    print("- debate_transcripts (id: VARCHAR/UUID, session_id: VARCHAR)")
    print("- payments (id: VARCHAR/UUID, user_id: VARCHAR)")
    print("- notifications (id: VARCHAR/UUID, user_id: VARCHAR)")
    print("- improve_yourself_resources (id: VARCHAR/UUID)")

if __name__ == "__main__":
    fix_schema()
