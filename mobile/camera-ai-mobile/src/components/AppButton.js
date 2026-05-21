import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";

/**
 * AppButton - nút bấm chung
 * variant: 'primary' | 'secondary' | 'danger'
 */
export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? COLORS.background : COLORS.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  primary: {
    backgroundColor: COLORS.primaryCTA,
  },
  secondary: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  danger: {
    backgroundColor: COLORS.alert,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
  },
  primaryText: {
    color: COLORS.background,
  },
  secondaryText: {
    color: COLORS.textMain,
  },
  dangerText: {
    color: COLORS.white,
  },
});
