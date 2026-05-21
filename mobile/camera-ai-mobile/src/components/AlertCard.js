import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import StatusBadge from "./StatusBadge";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";

export default function AlertCard({ alert, onPress }) {
  const time = new Date(alert.created_at).toLocaleString("vi-VN");
  const confidence = Math.round(alert.confidence_score * 100);

  return (
    <TouchableOpacity
      style={[styles.card, !alert.is_read && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Ảnh thumbnail */}
      <Image
        source={{ uri: alert.media_url }}
        style={styles.thumb}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {alert.device_name}
          </Text>
          <StatusBadge status={alert.is_read ? "READ" : "UNREAD"} />
        </View>
        <Text style={styles.confidence}>
          🤖 AI: <Text style={styles.confidenceValue}>{confidence}%</Text> tin
          cậy
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  cardUnread: {
    borderColor: COLORS.alert + "66",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.alert,
  },
  thumb: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.surfaceHigh,
  },
  info: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  deviceName: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    flex: 1,
    marginRight: SPACING.xs,
  },
  confidence: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.sm,
    marginBottom: 2,
  },
  confidenceValue: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  time: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
  },
});
