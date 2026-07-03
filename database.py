import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "interview_coach.db")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_role TEXT NOT NULL,
        experience_level TEXT NOT NULL
    )
    """)
    
    # Create sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        coach_name TEXT NOT NULL,
        role TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        overall_score INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    # Create transcripts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        user_answer TEXT,
        feedback_text TEXT,
        score INTEGER,
        grammar_feedback TEXT,
        confidence_score INTEGER,
        star_feedback TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DATABASE_PATH)
