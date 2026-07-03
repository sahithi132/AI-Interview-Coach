from pydantic import BaseModel
from typing import List, Optional, Dict

class UserCreate(BaseModel):
    name: str
    target_role: str
    experience_level: str

class UserResponse(BaseModel):
    id: int
    name: str
    target_role: str
    experience_level: str

class SessionStart(BaseModel):
    user_id: int
    coach_name: str
    role: str

class QuestionInfo(BaseModel):
    question_number: int
    question_text: str

class SessionResponse(BaseModel):
    session_id: str
    questions: List[QuestionInfo]

class AnswerSubmit(BaseModel):
    session_id: str
    question_number: int
    user_answer: str

class AnswerFeedbackResponse(BaseModel):
    question_number: int
    score: int
    feedback_text: str
    grammar_feedback: str
    confidence_score: int
    star_feedback: str

class TranscriptItem(BaseModel):
    question_number: int
    question_text: str
    user_answer: Optional[str] = None
    feedback_text: Optional[str] = None
    score: Optional[int] = None
    grammar_feedback: Optional[str] = None
    confidence_score: Optional[int] = None
    star_feedback: Optional[str] = None

class SessionSummaryResponse(BaseModel):
    session_id: str
    coach_name: str
    role: str
    timestamp: str
    overall_score: Optional[int] = None
    transcripts: List[TranscriptItem]

class WeeklyProgressItem(BaseModel):
    day: str
    score: int

class DashboardSummary(BaseModel):
    total_interviews: int
    completed_interviews: int
    average_score: int
    strongest_skill: str
    needs_improvement: str
    weekly_progress: List[WeeklyProgressItem]
