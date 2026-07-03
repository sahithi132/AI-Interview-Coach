import React, { useState } from "react";
import { StyleSheet, View, StatusBar, SafeAreaView } from "react-native";
import { COLORS } from "./src/theme/colors";
import CoachSelectionScreen from "./src/screens/CoachSelectionScreen";
import RoleSelectionScreen from "./src/screens/RoleSelectionScreen";
import InterviewScreen from "./src/screens/InterviewScreen";
import FeedbackScreen from "./src/screens/FeedbackScreen";
import DashboardScreen from "./src/screens/DashboardScreen";

// API Base URL config (replace with your local IP when testing on physical phone)
const API_BASE_URL = "http://localhost:8000";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("COACH_SELECTION");
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [feedbackData, setFeedbackData] = useState(null);

  // Helper: API calls with automatic high-fidelity mock fallback
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`Backend network error on ${endpoint}. Using simulation mock database. Details:`, err.message);
      return mockFallback(endpoint, options.body ? JSON.parse(options.body) : null);
    }
  };

  // High-fidelity fallback database simulator
  const mockFallback = (endpoint, body) => {
    if (endpoint === "/api/users") {
      return {
        id: 999,
        name: body.name || "Candidate",
        target_role: body.target_role || "AI Engineer",
        experience_level: body.experience_level || "Mid-Level"
      };
    }
    
    if (endpoint === "/api/sessions/start") {
      const mockQs = {
        "Ava": [
          "Tell me about a time you led a team through a difficult challenge.",
          "Describe a situation where you had a conflict with a colleague and how you resolved it.",
          "How do you prioritize your tasks when managing multiple tight deadlines?",
          "Can you share an instance where you failed to meet a goal and what you learned from it?",
          "Tell me about a time when you had to persuade others to adopt your perspective."
        ],
        "Marcus": [
          "Explain the difference between supervised, unsupervised, and reinforcement learning.",
          "What is the difference between a process and a thread, and how does asynchronous programming solve concurrency?",
          "Explain how the Transformer architecture works, specifically the attention mechanism.",
          "How would you design a database schema for a high-traffic e-commerce ordering system?",
          "What is time and space complexity, and how do you optimize an algorithm from O(N^2) to O(N log N)?"
        ],
        "Sophia": [
          "Our client wants to launch a food delivery app in a highly saturated market. How would you evaluate the opportunity?",
          "How would you design a scalable system to track global real-time Uber driver locations?",
          "If your product's user engagement dropped by 15% week-over-week, how would you investigate the root cause?",
          "How would you launch a new subscription-based API service for developer workflows?",
          "Estimate the number of smart devices currently active in New York City."
        ]
      };
      
      const coachQs = mockQs[body.coach_name] || mockQs["Ava"];
      
      return {
        session_id: "mock-session-1234",
        questions: coachQs.map((q, idx) => ({
          question_number: idx + 1,
          question_text: q
        }))
      };
    }
    
    if (endpoint === "/api/sessions/submit") {
      return {
        question_number: body.question_number,
        score: 8,
        feedback_text: "Good structure. You answered with technical clarity, highlighting key architecture choices.",
        grammar_feedback: "Fluent delivery. No significant grammar issues; minimal filler words.",
        confidence_score: 8,
        star_feedback: "Followed the context logic perfectly. Next time, add quantitative figures to show the business outcome."
      };
    }
    
    if (endpoint.startsWith("/api/sessions/") && endpoint.endsWith("/feedback")) {
      return {
        session_id: "mock-session-1234",
        coach_name: selectedCoach?.name || "Ava",
        role: "AI Engineer",
        timestamp: new Date().toLocaleDateString(),
        overall_score: 82,
        transcripts: questions.map((q) => ({
          question_number: q.question_number,
          question_text: q.question_text,
          user_answer: "Sample simulated spoken response context.",
          feedback_text: "Clear, professional answer structure with good technical terminology.",
          score: 8,
          grammar_feedback: "Keep checking filler words.",
          confidence_score: 7,
          star_feedback: "STAR structure was followed."
        }))
      };
    }
    
    if (endpoint === "/api/dashboard") {
      return {
        total_interviews: 12,
        completed_interviews: 12,
        average_score: 82,
        strongest_skill: "Communication Clarity",
        needs_improvement: "STAR Method",
        weekly_progress: [
          { day: "Mon", score: 70 },
          { day: "Tue", score: 75 },
          { day: "Wed", score: 82 },
          { day: "Thu", score: 88 }
        ]
      };
    }
    
    return {};
  };

  const handleSelectCoach = (coach) => {
    setSelectedCoach(coach);
    setCurrentScreen("ROLE_SELECTION");
  };

  const handleStartInterview = async (profile) => {
    // 1. Create or fetch User
    const user = await apiCall("/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: profile.name,
        target_role: profile.role,
        experience_level: profile.experienceLevel
      })
    });

    // 2. Start mock session
    const startRes = await apiCall("/api/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        user_id: user.id,
        coach_name: profile.coachName,
        role: profile.role
      })
    });

    setSession({
      sessionId: startRes.session_id,
      coachName: profile.coachName,
      role: profile.role
    });
    setQuestions(startRes.questions);
    setCurrentScreen("INTERVIEW");
  };

  const handleSubmitAnswer = async (qNum, answerText) => {
    // Submit answer to api
    await apiCall("/api/sessions/submit", {
      method: "POST",
      body: JSON.stringify({
        session_id: session.sessionId,
        question_number: qNum,
        user_answer: answerText
      })
    });

    // If last question, get final aggregate feedback and route to feedback screen
    if (qNum === questions.length) {
      const summary = await apiCall(`/api/sessions/${session.sessionId}/feedback`);
      setFeedbackData(summary);
      setCurrentScreen("FEEDBACK");
    }
  };

  const fetchDashboardData = async () => {
    return await apiCall("/api/dashboard");
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {currentScreen === "COACH_SELECTION" && (
        <CoachSelectionScreen
          onSelectCoach={handleSelectCoach}
          onGoToDashboard={() => setCurrentScreen("DASHBOARD")}
        />
      )}
      {currentScreen === "ROLE_SELECTION" && (
        <RoleSelectionScreen
          coach={selectedCoach}
          onBack={() => setCurrentScreen("COACH_SELECTION")}
          onStartInterview={handleStartInterview}
        />
      )}
      {currentScreen === "INTERVIEW" && (
        <InterviewScreen
          session={session}
          questions={questions}
          onSubmitAnswer={handleSubmitAnswer}
          onExit={() => setCurrentScreen("COACH_SELECTION")}
        />
      )}
      {currentScreen === "FEEDBACK" && (
        <FeedbackScreen
          feedbackData={feedbackData}
          onRetry={() => setCurrentScreen("ROLE_SELECTION")}
          onGoHome={() => setCurrentScreen("COACH_SELECTION")}
        />
      )}
      {currentScreen === "DASHBOARD" && (
        <DashboardScreen
          onBack={() => setCurrentScreen("COACH_SELECTION")}
          fetchDashboardData={fetchDashboardData}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
