import uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import database
import schemas
import gemini_service

app = FastAPI(title="AI Interview Coach API", version="1.0.0")

# Enable CORS for local cross-origin mobile/web development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    database.init_db()

@app.post("/api/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE name = ? LIMIT 1", (user.name,))
        existing_user = cursor.fetchone()
        if existing_user:
            return dict(existing_user)
            
        cursor.execute(
            "INSERT INTO users (name, target_role, experience_level) VALUES (?, ?, ?)",
            (user.name, user.target_role, user.experience_level)
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()
        return dict(new_user)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/sessions/start", response_model=schemas.SessionResponse)
def start_session(session_data: schemas.SessionStart):
    session_id = str(uuid.uuid4())
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Generate questions
        questions = gemini_service.generate_questions(
            coach_name=session_data.coach_name,
            role=session_data.role,
            experience_level="Mid-Level" # Default to Mid-Level for questions
        )
        
        # 2. Insert session
        cursor.execute(
            "INSERT INTO sessions (id, user_id, coach_name, role) VALUES (?, ?, ?, ?)",
            (session_id, session_data.user_id, session_data.coach_name, session_data.role)
        )
        
        # 3. Create transcripts rows for holding answers later
        questions_response = []
        for i, q_text in enumerate(questions):
            q_num = i + 1
            cursor.execute(
                """
                INSERT INTO transcripts (session_id, question_number, question_text) 
                VALUES (?, ?, ?)
                """,
                (session_id, q_num, q_text)
            )
            questions_response.append(schemas.QuestionInfo(question_number=q_num, question_text=q_text))
            
        conn.commit()
        return schemas.SessionResponse(session_id=session_id, questions=questions_response)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")
    finally:
        conn.close()

@app.post("/api/sessions/submit", response_model=schemas.AnswerFeedbackResponse)
def submit_answer(payload: schemas.AnswerSubmit):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get the question and session info
        cursor.execute(
            "SELECT question_text, sessions.role FROM transcripts JOIN sessions ON transcripts.session_id = sessions.id WHERE session_id = ? AND question_number = ?",
            (payload.session_id, payload.question_number)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Question or Session not found.")
            
        question_text = row["question_text"]
        role = row["role"]
        
        # Evaluate answer using Gemini
        evaluation = gemini_service.evaluate_answer(
            question=question_text,
            answer=payload.user_answer,
            role=role
        )
        
        # Update transcript
        cursor.execute(
            """
            UPDATE transcripts 
            SET user_answer = ?, feedback_text = ?, score = ?, grammar_feedback = ?, confidence_score = ?, star_feedback = ?
            WHERE session_id = ? AND question_number = ?
            """,
            (
                payload.user_answer,
                evaluation["feedback_text"],
                evaluation["score"],
                evaluation["grammar_feedback"],
                evaluation["confidence_score"],
                evaluation["star_feedback"],
                payload.session_id,
                payload.question_number
            )
        )
        conn.commit()
        
        return schemas.AnswerFeedbackResponse(
            question_number=payload.question_number,
            score=evaluation["score"],
            feedback_text=evaluation["feedback_text"],
            grammar_feedback=evaluation["grammar_feedback"],
            confidence_score=evaluation["confidence_score"],
            star_feedback=evaluation["star_feedback"]
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")
    finally:
        conn.close()

@app.get("/api/sessions/{session_id}/feedback", response_model=schemas.SessionSummaryResponse)
def get_session_feedback(session_id: str):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Fetch session metadata
        cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        session_row = cursor.fetchone()
        if not session_row:
            raise HTTPException(status_code=404, detail="Session not found.")
            
        # Fetch transcripts list
        cursor.execute("SELECT * FROM transcripts WHERE session_id = ? ORDER BY question_number ASC", (session_id,))
        transcripts_rows = cursor.fetchall()
        
        transcripts_list = []
        scores = []
        for row in transcripts_rows:
            item = dict(row)
            transcripts_list.append(schemas.TranscriptItem(**item))
            if row["score"] is not None:
                scores.append(row["score"])
                
        # Calculate overall score (scale up out of 100)
        overall_score = 0
        if scores:
            avg_score = sum(scores) / len(scores)
            overall_score = int(avg_score * 10)  # scale 1-10 to 10-100%
            
            # Save final score to session
            cursor.execute("UPDATE sessions SET overall_score = ? WHERE id = ?", (overall_score, session_id))
            conn.commit()
            
        return schemas.SessionSummaryResponse(
            session_id=session_id,
            coach_name=session_row["coach_name"],
            role=session_row["role"],
            timestamp=session_row["timestamp"],
            overall_score=overall_score if scores else session_row["overall_score"],
            transcripts=transcripts_list
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to retrieve feedback: {str(e)}")
    finally:
        conn.close()

@app.get("/api/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard_summary():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Sessions counts
        cursor.execute("SELECT COUNT(*) as total FROM sessions")
        total = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as completed FROM sessions WHERE overall_score IS NOT NULL")
        completed = cursor.fetchone()["completed"]
        
        # Average score
        cursor.execute("SELECT AVG(overall_score) as avg_score FROM sessions WHERE overall_score IS NOT NULL")
        avg_score_row = cursor.fetchone()["avg_score"]
        avg_score = int(avg_score_row) if avg_score_row is not None else 0
        
        # Generate structured analytics based on scores
        # We can look up high/low scores in metrics to determine strongest/weakest area
        cursor.execute("SELECT AVG(score) as avg, AVG(confidence_score) as conf FROM transcripts WHERE score IS NOT NULL")
        avg_rows = cursor.fetchone()
        
        strongest = "Communication Clarity"
        needs_improvement = "Technical Depth"
        
        if avg_rows and avg_rows["conf"] is not None:
            if avg_rows["conf"] > (avg_rows["avg"] or 0):
                strongest = "Confidence & Tone"
                needs_improvement = "STAR Structure & Details"
            else:
                strongest = "Technical Accuracy"
                needs_improvement = "Confidence & Filler Words"
                
        # Generate weekly progress mock items mapped to real past scores
        cursor.execute("SELECT timestamp, overall_score FROM sessions WHERE overall_score IS NOT NULL ORDER BY timestamp DESC LIMIT 7")
        recent_sessions = cursor.fetchall()
        
        # Standard default progress mapping
        days_mapping = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_progress = []
        
        if recent_sessions:
            # Map database scores
            recent_sessions.reverse()
            for i, session in enumerate(recent_sessions):
                day_name = days_mapping[i % len(days_mapping)]
                weekly_progress.append(schemas.WeeklyProgressItem(day=day_name, score=session["overall_score"]))
        else:
            # High-quality initial mock progress for visual dashboard empty state
            weekly_progress = [
                schemas.WeeklyProgressItem(day="Mon", score=70),
                schemas.WeeklyProgressItem(day="Tue", score=75),
                schemas.WeeklyProgressItem(day="Wed", score=82),
                schemas.WeeklyProgressItem(day="Thu", score=88),
            ]
            
        return schemas.DashboardSummary(
            total_interviews=total,
            completed_interviews=completed,
            average_score=avg_score if completed > 0 else 82, # default mock score if zero tests
            strongest_skill=strongest,
            needs_improvement=needs_improvement,
            weekly_progress=weekly_progress
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dashboard: {str(e)}")
    finally:
        conn.close()
