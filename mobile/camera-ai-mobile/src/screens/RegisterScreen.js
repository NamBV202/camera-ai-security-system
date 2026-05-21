import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import { register } from "../api/authApi";

function InputRow({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  hint,
}) {
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <View style={styles.inputWrap}>
        <Ionicons
          name={icon}
          size={18}
          color={COLORS.textSub}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSub}
          keyboardType={keyboardType || "default"}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
      </View>
      {!!hint && (
        <View style={styles.hintRow}>
          <Ionicons
            name="information-circle-outline"
            size={13}
            color={COLORS.textSub}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Mật khẩu tối thiểu 8 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      await register(username.trim(), password, email.trim());
      Alert.alert("Đăng ký thành công", "Vui lòng đăng nhập để tiếp tục.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Đăng ký thất bại. Thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Camera AI Security</Text>
            </View>

            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

            {/* Error */}
            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={COLORS.alert}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Inputs */}
            <InputRow
              icon="person-outline"
              placeholder="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
            />
            <InputRow
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <InputRow
              icon="key-outline"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              hint="TỐI THIỂU 8 KÝ TỰ"
            />
            <InputRow
              icon="ellipsis-horizontal-outline"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* CTA */}
            <TouchableOpacity
              style={[styles.ctaBtn, loading && styles.ctaDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Ionicons
                name="person-add-outline"
                size={18}
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaText}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Login")}
            >
              Đăng nhập
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  logoImg: {
    width: 96,
    height: 96,
    marginRight: SPACING.md,
  },
  appName: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  title: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.body,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(147,0,10,0.3)",
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.alert,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: { color: COLORS.textMain, fontSize: FONTS.sizes.sm, flex: 1 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, color: COLORS.textMain, fontSize: FONTS.sizes.body },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: SPACING.xs,
  },
  hintText: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    letterSpacing: 0.5,
  },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xxl,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: COLORS.textSub, fontSize: FONTS.sizes.md },
  link: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    textDecorationLine: "underline",
  },
});
