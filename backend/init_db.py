from database import Base, engine
from models import User, DebateSession, DebateTranscript, Payment, Notification, Resource

def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    print("\nTables created:")
    print("- users")
    print("- debate_sessions")
    print("- debate_transcripts")
    print("- payments")
    print("- notifications")
    print("- improve_yourself_resources")

if __name__ == "__main__":
    init_database()
