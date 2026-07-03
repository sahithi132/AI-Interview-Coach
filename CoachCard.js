import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export default function CoachCard({ coach, isSelected, onPress }) {
  const getWireframeColor = () => {
    if (coach.name === "Ava") return COLORS.primary;
    if (coach.name === "Marcus") return COLORS.secondary;
    return COLORS.accent;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && { borderColor: getWireframeColor(), borderWidth: 2 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Glow representation in background */}
      <View style={[styles.glowSphere, { shadowColor: getWireframeColor() }]} />

      {/* Wireframe Mock Sphere */}
      <View style={styles.sphereContainer}>
        <View style={[styles.outerOrb, { borderColor: getWireframeColor() }]}>
          <View style={[styles.innerOrb, { borderColor: getWireframeColor() + "80" }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={getWireframeColor()} />
          </View>
        </View>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{coach.difficulty || "MEDIUM"}</Text>
        </View>
      </View>

      {/* Coach Info */}
      <Text style={styles.coachName}>{coach.name}</Text>
      <Text style={styles.coachTitle}>{coach.title}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>EXP</Text>
          <Text style={styles.statValue}>{coach.exp}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SESSIONS</Text>
          <Text style={styles.statValue}>{coach.sessions}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>RATING</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.statValue}> {coach.rating}</Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {coach.tags.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
    marginVertical: 10,
  },
  glowSphere: {
    position: "absolute",
    top: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    backgroundColor: "transparent",
  },
  sphereContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    position: "relative",
  },
  outerOrb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  innerOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  difficultyBadge: {
    position: "absolute",
    top: 0,
    right: -10,
    backgroundColor: COLORS.danger + "20",
    borderColor: COLORS.danger + "80",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  difficultyText: {
    color: COLORS.danger,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  coachName: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  coachTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.cardBorder,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
});
