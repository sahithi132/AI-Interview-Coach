import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../theme/colors";
import CoachCard from "../components/CoachCard";
import { Ionicons } from "@expo/vector-icons";

const COACHES_DATA = [
  {
    name: "Ava",
    title: "Senior AI Coach - Behavioral Specialist",
    difficulty: "HARD",
    exp: "8Y",
    sessions: "1.2k",
    rating: "4.9",
    tags: ["Behavioral", "Leadership", "Situational"],
    category: "Behavioral"
  },
  {
    name: "Marcus",
    title: "Technical Lead Coach - Coding & Tech Specialist",
    difficulty: "EXPERT",
    exp: "10Y",
    sessions: "2.5k",
    rating: "4.8",
    tags: ["Algorithms", "Machine Learning", "System Design"],
    category: "Technical"
  },
  {
    name: "Sophia",
    title: "Executive Director - Management & Case Specialist",
    difficulty: "MEDIUM",
    exp: "6Y",
    sessions: "900",
    rating: "4.9",
    tags: ["Product Strategy", "Market Sizing", "Analytics"],
    category: "Case"
  }
];

const CATEGORIES = ["All Types", "Behavioral", "Technical", "Case"];

export default function CoachSelectionScreen({ onSelectCoach, onGoToDashboard }) {
  const [selectedCategory, setSelectedCategory] = useState("All Types");
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredCoaches = COACHES_DATA.filter(
    (coach) => selectedCategory === "All Types" || coach.category === selectedCategory
  );

  const currentCoach = filteredCoaches[currentIndex] || filteredCoaches[0];

  const handleNextCoach = () => {
    if (currentIndex < filteredCoaches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevCoach = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCoaches.length - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appSubtitle}>AI INTERVIEW PREP</Text>
            <Text style={styles.appTitle}>Choose</Text>
            <Text style={styles.appTitle}>Your <Text style={styles.highlightText}>AI Coach</Text></Text>
          </View>
          <TouchableOpacity style={styles.dashboardButton} onPress={onGoToDashboard}>
            <Ionicons name="stats-chart" size={20} color={COLORS.primary} />
            <Text style={styles.dashboardButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Coach Card Slider Area */}
        {filteredCoaches.length > 0 ? (
          <View style={styles.sliderContainer}>
            <CoachCard
              coach={currentCoach}
              isSelected={true}
              onPress={() => {}}
            />

            {/* Slider Navigation Row */}
            <View style={styles.navigationRow}>
              <TouchableOpacity style={styles.navArrow} onPress={handlePrevCoach}>
                <Ionicons name="arrow-back" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              
              {/* Pagination Dots */}
              <View style={styles.dotsRow}>
                {filteredCoaches.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === currentIndex ? styles.dotActive : null
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.navArrow} onPress={handleNextCoach}>
                <Ionicons name="arrow-forward" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.noCoachText}>No coaches available in this category.</Text>
        )}

        {/* Action Button */}
        {currentCoach && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => onSelectCoach(currentCoach)}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Session with {currentCoach.name}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>Trusted by Stanford, MIT & 700+ universities</Text>
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
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 34,
  },
  highlightText: {
    color: COLORS.cyan,
  },
  dashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dashboardButtonText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  categoriesScroll: {
    maxHeight: 45,
    marginVertical: 10,
    width: "100%",
  },
  categoriesContent: {
    paddingHorizontal: 5,
    alignItems: "center",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  sliderContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  navigationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "50%",
    marginVertical: 15,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.textPrimary,
    width: 14,
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 10,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  noCoachText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    marginVertical: 40,
  },
});
