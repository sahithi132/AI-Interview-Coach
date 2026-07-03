import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export default function MetricCard({ title, score, summary, improvement, type }) {
  const getIcon = () => {
    switch (type) {
      case "communication":
        return { name: "mic-outline", color: COLORS.cyan };
      case "confidence":
        return { name: "pulse-outline", color: COLORS.primary };
      default:
        return { name: "checkmark-circle-outline", color: COLORS.success };
    }
  };

  const iconInfo = getIcon();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.score}>{score}/10</Text>
      </View>

      {/* Progress Bar (Communication Style) */}
      {type === "communication" && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${score * 10}%`, backgroundColor: COLORS.cyan }]} />
        </View>
      )}

      {/* Sine-Wave Graph (Confidence Style) */}
      {type === "confidence" && (
        <View style={styles.graphContainer}>
          {/* Custom graphic representing pitch variation/confidence waveform */}
          <View style={styles.graphLineContainer}>
            {/* Draw a stylized wavy line using small bars with varying heights */}
            {[20, 25, 15, 35, 5, 20, 30, 10, 25].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.graphBar,
                  {
                    height: h,
                    backgroundColor: COLORS.primary,
                    opacity: i === 4 ? 1 : 0.4, // highlight a point
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {summary && (
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionLabel}>Summary:</Text>
          <Text style={styles.sectionText}>{summary}</Text>
        </View>
      )}

      {improvement && (
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionLabel}>Improvement Tip:</Text>
          <Text style={styles.sectionText}>{improvement}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  score: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  progressContainer: {
    height: 6,
    backgroundColor: COLORS.cardBorder,
    borderRadius: 3,
    width: "100%",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  graphContainer: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(143, 63, 252, 0.05)",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  graphLineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 40,
  },
  graphBar: {
    width: 3,
    borderRadius: 1.5,
  },
  feedbackSection: {
    marginTop: 8,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  sectionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
