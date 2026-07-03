import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export default function Waveform({ isRecording }) {
  const [heights, setHeights] = useState([10, 15, 20, 25, 30, 25, 20, 15, 10]);

  useEffect(() => {
    if (!isRecording) {
      // Set to idle heights
      setHeights([10, 10, 10, 10, 10, 10, 10, 10, 10]);
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: 9 }, () => Math.floor(Math.random() * 45) + 8)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: h,
              backgroundColor: isRecording ? COLORS.accent : COLORS.primary + "70",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    width: "100%",
  },
  bar: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 3,
    transition: "height 0.1s ease-in-out", // works natively on web, fails gracefully on native mobile
  },
});
