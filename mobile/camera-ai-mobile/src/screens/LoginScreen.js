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
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import { login } from "../api/authApi";
import { saveToken } from "../storage/tokenStorage";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMsg("Tên đăng nhập hoặc mật khẩu không đúng");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      const token = res.data?.data?.token;
      if (token) {
        await saveToken(token);
        navigation.replace("MainTabs");
      } else {
        setErrorMsg("Không nhận được token từ server");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng",
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
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <Text style={styles.appName}>CAMERA AI SECURITY</Text>
            <Text style={styles.subtitle}>Đăng nhập</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {/* Error banner */}
            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={COLORS.alert}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Username input */}
            <View style={styles.inputWrap}>
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.textSub}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Tên đăng nhập"
                placeholderTextColor={COLORS.textSub}
                autoCapitalize="none"
              />
            </View>

            {/* Password input */}
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.textSub}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                placeholderTextColor={COLORS.textSub}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={COLORS.textSub}
                />
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.ctaBtn, loading && styles.ctaDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.ctaText}>
                {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Register")}
            >
              Đăng ký
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
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    justifyContent: "center",
  },
  // Logo
  logoWrap: { alignItems: "center", marginBottom: 40 },
  logoImg: {
    width: 160,
    height: 160,
    marginBottom: SPACING.lg,
  },
  appName: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
  },
  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(147,0,10,0.35)",
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.alert,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.sm,
    flex: 1,
  },
  // Input
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
  },
  eyeBtn: { padding: 4 },
  // CTA
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xxl,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
  },
  // DEV
  devBtn: { alignItems: "center", marginTop: SPACING.md },
  devText: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  // Footer
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: COLORS.textSub, fontSize: FONTS.sizes.md },
  link: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
});
