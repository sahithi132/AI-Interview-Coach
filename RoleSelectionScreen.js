import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { COLORS } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

const ROLES = [
  { id: "ai_eng", name: "AI Engineer", icon: "brain-outline" },
  { id: "fullstack", name: "Fullstack Developer", icon: "code-working-outline" },
  { id: "pm", name: "Product Manager", icon: "briefcase-outline" },
  { id: "data_scientist", name: "Data Scientist", icon: "analytics-outline" }
];

const EXPERIENCE_LEVELS = ["Entry-Level", "Mid-Level", "Senior-Level"];

export default function RoleSelectionScreen({ coach, onBack, onStartInterview }) {
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("AI Engineer");
  const [experience, setExperience] = useState("Mid-Level");
  const [errorMsg, setErrorMsg] = useState("");

  const handleStart = () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your name to personalize the interview.");
      return;
    }
    setErrorMsg("");
    onStartInterview({
      name: name.trim(),
      role: selectedRole,
      experienceLevel: experience,
      coachName: coach.name
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Back Button and Screen Title */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Setup</Text>
          <View style={{ width: 24 }} /> {/* alignment balance */}
        </View>

        {/* Selected Coach Banner */}
        <View style={styles.coachBanner}>
          <Ionicons name="ribbon-outline" size={22} color={COLORS.cyan} />
          <Text style={styles.coachBannerText}>
            Session Coach: <Text style={{ color: COLORS.cyan, fontWeight: "bold" }}>{coach.name}</Text>
          </Text>
        </View>

        {/* Input: Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (val.trim()) setErrorMsg("");
            }}
          />
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>

        {/* Option Select: Choose Role */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose Role</Text>
          <View style={styles.rolesGrid}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.name;
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    isSelected && styles.roleCardActive
                  ]}
                  onPress={() => setSelectedRole(role.name)}
                >
                  <Ionicons
                    name={role.icon}
                    size={22}
                    color={isSelected ? COLORS.textPrimary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      isSelected && styles.roleTextActive
                    ]}
                  >
                    {role.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Option Select: Experience Level */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Experience Level</Text>
          <View style={styles.expRow}>
            {EXPERIENCE_LEVELS.map((level) => {
              const isSelected = experience === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.expChip,
                    isSelected && styles.expChipActive
                  ]}
                  onPress={() => setExperience(level)}
                >
                  <Text
                    style={[
                      styles.expText,
                      isSelected && styles.expTextActive
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Mock Interview</Text>
          <Ionicons name="play" size={18} color="#fff" style={styles.buttonIcon} />
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
  coachBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 240, 255, 0.05)",
    borderColor: "rgba(0, 240, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  coachBannerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 6,
  },
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  roleCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: "rgba(143, 63, 252, 0.05)",
  },
  roleText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  roleTextActive: {
    color: COLORS.textPrimary,
  },
  expRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expChip: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  expChipActive: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
    backgroundColor: "rgba(15, 98, 254, 0.05)",
  },
  expText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  expTextActive: {
    color: COLORS.textPrimary,
  },
  startButton: {
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
    marginBottom: 30,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 10,
  },
});
