import os
import json
import logging
from google import genai
from google.genai import types

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to initialize the Gemini client
api_key = os.environ.get("GEMINI_API_KEY")
client = None
if api_key:
    try:
        client = genai.Client(api_key=api_key)
        logger.info("Gemini API Client initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing Gemini client: {e}")
else:
    logger.warning("GEMINI_API_KEY environment variable not found. Using high-quality mock mode.")

# Mock data generators for seamless testing without api_key
MOCK_QUESTIONS = {
    "Ava": {
        "Behavioral": [
            "Tell me about a time you led a team through a difficult challenge.",
            "Describe a situation where you had a conflict with a colleague and how you resolved it.",
            "How do you prioritize your tasks when managing multiple tight deadlines?",
            "Can you share an instance where you failed to meet a goal and what you learned from it?",
            "Tell me about a time when you had to persuade others to adopt your perspective."
        ],
        "default": [
            "Tell me about yourself and why you're interested in this role.",
            "What is your greatest professional achievement and why?",
            "Describe a time you had to adapt to a major change at work.",
            "How do you handle constructive criticism or negative feedback?",
            "Where do you see yourself in five years, and how does this role fit that vision?"
        ]
    },
    "Marcus": {
        "Technical": [
            "Explain the difference between supervised, unsupervised, and reinforcement learning.",
            "What is the difference between a process and a thread, and how does asynchronous programming solve concurrency?",
            "Explain how the Transformer architecture works, specifically the attention mechanism.",
            "How would you design a database schema for a high-traffic e-commerce ordering system?",
            "What is time and space complexity, and how do you optimize an algorithm from O(N^2) to O(N log N)?"
        ],
        "default": [
            "What is the difference between REST and GraphQL, and when would you use each?",
            "How do you ensure security and prevent SQL injection or XSS in web applications?",
            "Explain the concept of virtualization versus containerization (Docker).",
            "What is a memory leak, and how would you debug one in your language of choice?",
            "Explain what happens from the moment you type a URL in the browser and press Enter."
        ]
    },
    "Sophia": {
        "Case": [
            "Our client wants to launch a food delivery app in a highly saturated market. How would you evaluate the opportunity?",
            "How would you design a scalable system to track global real-time Uber driver locations?",
            "If your product's user engagement dropped by 15% week-over-week, how would you investigate the root cause?",
            "How would you launch a new subscription-based API service for developer workflows?",
            "Estimate the number of smart devices currently active in New York City."
        ],
        "default": [
            "Walk me through how you would design a URL shortener system like Bitly.",
            "A client wants to reduce their operational costs by 20%. Where would you start your analysis?",
            "How would you define metrics of success for a new video sharing feature in a social media app?",
            "How do you resolve trade-offs between feature rich design and system latency?",
            "Explain how you would approach pricing a new SaaS B2B tool."
        ]
    }
}

def generate_questions(coach_name: str, role: str, experience_level: str, count: int = 5):
    """
    Generates interview questions using Gemini based on the coach, role, and experience level.
    Falls back to high-quality mock data if API key is not configured.
    """
    prompt = f"""
    You are {coach_name}, an expert AI Interview Coach.
    Generate a list of exactly {count} interview questions for a candidate interviewing for the role of '{role}' with '{experience_level}' experience level.
    
    Keep in mind your specific persona:
    - Ava: Senior Behavioral Specialist. Focus on leadership, conflict resolution, resilience, communication, and situational problems.
    - Marcus: Technical/Coding Specialist. Focus on deep engineering concepts, algorithms, machine learning, system architecture, or core language concepts.
    - Sophia: Executive/Case Specialist. Focus on strategic system design, product management scenarios, root-cause metrics analysis, and estimation.
    
    Output the result as a raw JSON object containing an array of strings under the key "questions". Example:
    {{
      "questions": [
        "Question 1",
        "Question 2",
        "Question 3",
        "Question 4",
        "Question 5"
      ]
    }}
    Do not add any markdown framing, formatting, or extra text. Output ONLY the raw JSON.
    """
    
    if client:
        try:
            logger.info(f"Requesting question generation from Gemini for {coach_name} (Role: {role})")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7
                )
            )
            # Parse the JSON response
            data = json.loads(response.text)
            if "questions" in data and isinstance(data["questions"], list):
                return data["questions"][:count]
        except Exception as e:
            logger.error(f"Gemini question generation failed: {e}. Falling back to mocks.")
            
    # Mock fallback
    category = "Behavioral" if coach_name == "Ava" else ("Technical" if coach_name == "Marcus" else "Case")
    coach_data = MOCK_QUESTIONS.get(coach_name, MOCK_QUESTIONS["Ava"])
    questions = coach_data.get(category, coach_data["default"])
    
    # Customize mock questions to mention the user's role/experience slightly
    customized_questions = []
    for q in questions[:count]:
        if "role" in q.lower() or "job" in q.lower():
            q = q.replace("this role", f"the {role} ({experience_level}) role")
        customized_questions.append(q)
        
    return customized_questions

def evaluate_answer(question: str, answer: str, role: str):
    """
    Evaluates the candidate's answer using Gemini, checking content, grammar, confidence, and structure.
    Falls back to high-quality mock data if API key is not configured.
    """
    if not answer or len(answer.strip()) < 5:
        return {
            "score": 2,
            "feedback_text": "Your answer was extremely brief or empty. Please provide a more detailed response to get useful feedback.",
            "grammar_feedback": "Not enough content to analyze grammar.",
            "confidence_score": 3,
            "star_feedback": "The STAR structure (Situation, Task, Action, Result) was not utilized."
        }

    prompt = f"""
    Analyze the following response to the interview question for the role of '{role}'.
    Question: "{question}"
    Answer: "{answer}"
    
    Perform a complete evaluation and return a JSON object with the following fields:
    - "score": An integer from 1 to 10 evaluating the overall technical accuracy and depth.
    - "feedback_text": Detailed, constructive feedback explaining what was good, what crucial details were missing, and how to improve.
    - "grammar_feedback": Highlighting any grammatical issues, repetitive phrasing, use of filler words (like "um", "like", "actually"), or tips for a more professional tone.
    - "confidence_score": An integer from 1 to 10 estimating confidence, pace, and clarity based on syntax and text structure.
    - "star_feedback": Evaluation of the answer structure. For behavioral questions, check if they followed the STAR method (Situation, Task, Action, Result). For technical questions, check if they structured their response logically with concepts, trade-offs, and examples.
    
    Output ONLY the raw JSON object. Do not wrap in markdown or any other tags. Example:
    {{
      "score": 8,
      "feedback_text": "Good technical depth...",
      "grammar_feedback": "Watch out for filler words...",
      "confidence_score": 7,
      "star_feedback": "Good structure, but missing clear quantitative results..."
    }}
    """

    if client:
        try:
            logger.info("Requesting answer evaluation from Gemini")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini answer evaluation failed: {e}. Falling back to mocks.")
            
    # Mock fallback based on word counts and typical answer quality
    word_count = len(answer.split())
    if word_count < 15:
        score = 4
        confidence = 4
        feedback = "Your answer is too short. Try to elaborate on your reasoning, mention technical components, or give a specific example from your past experience."
        grammar = "Sentence fragment detected. Add more structured sentences."
        star = "Missing Situation, Task, Action, and Result. Start by introducing the context."
    elif word_count < 40:
        score = 6
        confidence = 6
        feedback = "Decent overview, but lacks depth. Elaborate on the implementation detail or trade-offs (e.g. time vs space complexity or alternative approaches)."
        grammar = "Phasing is correct but could use stronger action verbs (e.g., 'executed', 'implemented' instead of 'did')."
        star = "Identified the Situation and Task, but needs a more explicit Action section detailing exactly what you did."
    else:
        score = 8
        confidence = 8
        feedback = "Great job explaining the concept clearly. You demonstrated a solid theoretical understanding of the topic with structured arguments."
        grammar = "Grammar is clean. You maintained a highly professional tone throughout the explanation."
        star = "Strong structure! You set the context, explained your actions, and mentioned a positive final outcome."
        
    return {
        "score": score,
        "feedback_text": feedback,
        "grammar_feedback": grammar,
        "confidence_score": confidence,
        "star_feedback": star
    }
