import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";

const STATUS_CONFIG = {
  ONLINE: { color: COLORS.online, label: "ONLINE" },
  OFFLINE: { color: COLORS.offline, label: "OFFLINE" },
  STREAMING: { color: COLORS.streaming, label: "STREAMING" },
  UNREAD: { color: COLORS.alert, label: "MỚI" },
  READ: { color: COLORS.offlineText, label: "ĐÃ ĐỌC" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OFFLINE;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.color + "22", borderColor: config.color },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.8,
  },
});
