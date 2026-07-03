import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { COLORS } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardScreen({ onBack, fetchDashboardData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const res = await fetchDashboardData();
        if (active) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const dashboardData = data || {
    total_interviews: 0,
    completed_interviews: 0,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dashboardData.total_interviews}</Text>
            <Text style={styles.statLabel}>Interviews</Text>
            <Text style={styles.statSub}>Completed sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dashboardData.average_score}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
            <Text style={styles.statSub}>Overall performance</Text>
          </View>
        </View>

        {/* Skill insights */}
        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.success + "20" }]}>
              <Ionicons name="trending-up" size={20} color={COLORS.success} />
            </View>
            <View style={styles.insightTexts}>
              <Text style={styles.insightTitle}>Best Area</Text>
              <Text style={styles.insightValue}>{dashboardData.strongest_skill}</Text>
              <Text style={styles.insightDesc}>Strongest skill across interviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.danger + "20" }]}>
              <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
            </View>
            <View style={styles.insightTexts}>
              <Text style={styles.insightTitle}>Focus Area</Text>
              <Text style={styles.insightValue}>{dashboardData.needs_improvement}</Text>
              <Text style={styles.insightDesc}>Needs targeted practice sessions</Text>
            </View>
          </View>
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          
          <View style={styles.chartContent}>
            {dashboardData.weekly_progress.map((item, idx) => (
              <View key={idx} style={styles.chartCol}>
                <View style={styles.barContainer}>
                  <View style={[styles.chartBar, { height: `${item.score}%` }]}>
                    <Text style={styles.barLabel}>{item.score}%</Text>
                  </View>
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    width: "48%",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  insightCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: "100%",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  insightTexts: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
  chartContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingHorizontal: 10,
  },
  chartCol: {
    alignItems: "center",
    width: "20%",
  },
  barContainer: {
    height: 120,
    justifyContent: "flex-end",
    width: "100%",
  },
  chartBar: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600",
  },
});
