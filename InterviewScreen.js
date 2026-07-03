import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { COLORS } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import Waveform from "../components/Waveform";

export default function InterviewScreen({ session, questions, onSubmitAnswer, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per question
  const [isPaused, setIsPaused] = useState(false);
  const typingTimerRef = useRef(null);

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;

  // Question countdown timer
  useEffect(() => {
    if (isPaused || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNext(); // Auto advance if timeout
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, isPaused, isSubmitting]);

  // Format timer output: e.g. 02:34
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Simulating Voice-to-Text Speech Dictation
  const startSimulatedDictation = () => {
    setIsRecording(true);
    let phrases = [
      "In my previous role as an Integration Lead, ",
      "we faced a critical bottleneck during the migration. ",
      "I organized a cross-functional team, designed a parallel data pipeline, ",
      "and executed the deployment with zero downtime, reducing latency by 45%."
    ];
    let wordIndex = 0;
    let fullPhrase = "";
    
    typingTimerRef.current = setInterval(() => {
      if (wordIndex < phrases.length) {
        fullPhrase += phrases[wordIndex];
        setAnswerText(fullPhrase);
        wordIndex++;
      } else {
        clearInterval(typingTimerRef.current);
        setIsRecording(false);
      }
    }, 1500);
  };

  const stopSimulatedDictation = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSimulatedDictation();
    } else {
      startSimulatedDictation();
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    stopSimulatedDictation();

    try {
      // Send answer to backend
      await onSubmitAnswer(currentQuestion.question_number, answerText);
      
      // Clear input and load next question
      setAnswerText("");
      setTimeLeft(180);
      
      if (currentIdx < totalQuestions - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Handled by parent to redirect to feedback
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select Coach specific tip
  const getCoachTip = () => {
    if (session.coachName === "Ava") return "AI TIP: USE THE STAR METHOD (SITUATION, TASK, ACTION, RESULT)";
    if (session.coachName === "Marcus") return "AI TIP: MENTION TIME COMPLEXITY AND CORNER CASES";
    return "AI TIP: DEFINE STRUCTURED HYPOTHESES AND ESTIMATIONS";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header row: Exit, Title, Timer */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Ionicons name="close" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Question {currentQuestion?.question_number} of {totalQuestions}</Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color={COLORS.cyan} />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.statusBarBg}>
          <View style={[styles.statusBarFill, { width: `${((currentIdx + 1) / totalQuestions) * 100}%` }]} />
        </View>

        {/* Question Panel */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>MEDIUM</Text>
            </View>
            <Text style={styles.coachNameTag}>{session.coachName}</Text>
          </View>
          <Text style={styles.questionText}>
            {currentQuestion?.question_text || "Loading question..."}
          </Text>
          <View style={styles.tipBadge}>
            <Text style={styles.tipText}>{getCoachTip()}</Text>
          </View>
        </View>

        {/* Answer Input Section */}
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Your Answer</Text>
          <TextInput
            style={[styles.answerInput, isRecording && styles.answerInputRecording]}
            multiline
            numberOfLines={6}
            placeholder={isRecording ? "Listening to your voice answer..." : "Type your answer here or tap the microphone to speak..."}
            placeholderTextColor={COLORS.textMuted}
            value={answerText}
            onChangeText={(txt) => setAnswerText(txt)}
          />
        </View>

        {/* Waveform indicator */}
        <View style={styles.waveformWrapper}>
          <Waveform isRecording={isRecording} />
        </View>

        {/* Recording & Progress Controls */}
        <View style={styles.controlsRow}>
          {/* Pause timer button */}
          <TouchableOpacity
            style={[styles.circleControl, isPaused && styles.controlActive]}
            onPress={() => setIsPaused(!isPaused)}
          >
            <Ionicons name={isPaused ? "play-outline" : "pause-outline"} size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Central microphone trigger button */}
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={toggleRecording}
            activeOpacity={0.8}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={32} color="#fff" />
          </TouchableOpacity>

          {/* Submit/Next button */}
          <TouchableOpacity
            style={styles.circleControl}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.textPrimary} size="small" />
            ) : (
              <Ionicons name="arrow-forward" size={22} color={COLORS.textPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {isRecording && (
          <Text style={styles.recordingAlert}>
            Recording active. Speaking simulation in progress...
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  exitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
  },
  timerText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  statusBarBg: {
    height: 4,
    backgroundColor: COLORS.cardBorder,
    borderRadius: 2,
    width: "100%",
    marginBottom: 20,
  },
  statusBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  difficultyBadge: {
    backgroundColor: COLORS.success + "20",
    borderColor: COLORS.success + "80",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  difficultyText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: "bold",
  },
  coachNameTag: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: 16,
  },
  tipBadge: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
  },
  tipText: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  answerSection: {
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  answerInput: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 15,
    textAlignVertical: "top",
  },
  answerInputRecording: {
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  waveformWrapper: {
    marginVertical: 10,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  circleControl: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controlActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(143,63,252,0.1)",
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
  },
  recordingAlert: {
    color: COLORS.accent,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
});
