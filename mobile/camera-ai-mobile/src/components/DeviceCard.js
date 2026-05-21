import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import StatusBadge from "./StatusBadge";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";

export default function DeviceCard({ device, onPress }) {
  const lastActive = new Date(device.last_active).toLocaleString("vi-VN");

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Icon camera placeholder */}
      <View style={styles.iconBox}>
        <Text style={styles.icon}>📷</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {device.device_name}
        </Text>
        <Text style={styles.mac}>{device.mac_address}</Text>
        <Text style={styles.lastActive}>Lần cuối: {lastActive}</Text>
      </View>

      <View style={styles.right}>
        <StatusBadge status={device.status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
    marginBottom: 2,
  },
  mac: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    marginBottom: 2,
  },
  lastActive: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
  },
  right: {
    marginLeft: SPACING.sm,
  },
});
