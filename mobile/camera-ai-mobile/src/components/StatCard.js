import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";

export default function StatCard({ icon, label, value, color }) {
  return (
    <View
      style={[styles.card, { borderColor: (color || COLORS.primary) + "44" }]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color: color || COLORS.primary }]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.base,
    alignItems: "center",
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: 2,
  },
  label: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    textAlign: "center",
  },
});
