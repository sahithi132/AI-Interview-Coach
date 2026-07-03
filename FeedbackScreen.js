import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import MetricCard from "../components/MetricCard";

export default function FeedbackScreen({ feedbackData, onRetry, onGoHome }) {
  // Aggregate averages for presentation if detailed transcript exists
  const transcripts = feedbackData.transcripts || [];
  const totalScore = feedbackData.overall_score || 0;
  
  // Calculate average confidence and STAR method scores
  let totalScore10 = 0;
  let totalConf = 0;
  let totalQuestionsEvaluated = 0;
  
  transcripts.forEach((t) => {
    if (t.score !== null) {
      totalScore10 += t.score;
      totalConf += t.confidence_score || 7;
      totalQuestionsEvaluated++;
    }
  });

  const avgTechnical = totalQuestionsEvaluated > 0 ? Math.round(totalScore10 / totalQuestionsEvaluated) : 8;
  const avgConfidence = totalQuestionsEvaluated > 0 ? Math.round(totalConf / totalQuestionsEvaluated) : 7;
  
  // Get summary notes from transcripts
  const lastFeedback = transcripts[transcripts.length - 1] || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onGoHome}>
            <Ionicons name="close" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Insights</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Readiness Circular Highlight */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{totalScore}%</Text>
            <Text style={styles.scoreLabel}>Readiness</Text>
          </View>
          <Text style={styles.scoreStatement}>
            Interview Readiness based on {totalQuestionsEvaluated || 5} questions with coach {feedbackData.coach_name}.
          </Text>
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={16} color={COLORS.textPrimary} />
            <Text style={styles.shareButtonText}>Share Score</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown Header */}
        <Text style={styles.breakdownTitle}>Skill Breakdown</Text>

        {/* Metrics List */}
        <MetricCard
          title="Technical Accuracy"
          score={avgTechnical}
          summary={lastFeedback.feedback_text || "You demonstrated solid knowledge on core queries. Your explanations of technical terms were correct."}
          improvement={lastFeedback.star_feedback || "Elaborate more on hardware or system bottlenecks."}
          type="technical"
        />

        <MetricCard
          title="Communication Clarity"
          score={8}
          summary="Your speech was articulate and clear. You avoided complex jargon while maintaining a professional, easy-to-understand tone."
          improvement="Vary your sentence structures to hold attention in longer explanations."
          type="communication"
        />

        <MetricCard
          title="Confidence & Tone"
          score={avgConfidence}
          summary="You spoke with steady pace and rhythm, showing a strong grasp of subject material."
          improvement={lastFeedback.grammar_feedback || "Reduce usage of filler words like 'um', 'like', and 'actually'."}
          type="confidence"
        />

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.retryButtonText}>Retry Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={onGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 24,
    padding: 30,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  scoreNumber: {
    fontSize: 38,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scoreStatement: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  shareButtonText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  breakdownTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 18,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
  homeButton: {
    paddingVertical: 16,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  homeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "bold",
  },
});
