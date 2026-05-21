import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { removeToken } from "../storage/tokenStorage";
import { getProfile } from "../api/userApi";
import { navigateToAuth } from "../navigation/navigationRef";

export default function SettingsScreen({ navigation }) {
  const [notifAlert, setNotifAlert] = useState(true);
  const [notifMotion, setNotifMotion] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res.data?.data || null))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          navigateToAuth();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 4 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CÀI ĐẶT</Text>
        <TouchableOpacity style={{ padding: 4 }}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.textMain}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Tài khoản section */}
        <Text style={styles.sectionLabel}>TÀI KHOẢN</Text>
        <View style={styles.section}>
          {/* Profile row */}
          <View style={styles.profileRow}>
            <View style={styles.avatarBox}>
              <Ionicons name="person" size={28} color={COLORS.primary} />
            </View>
            {profileLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>
                  {profile?.username || "Người dùng"}
                </Text>
                <Text style={styles.profileEmail}>{profile?.email || ""}</Text>
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <MenuRow
            icon="create-outline"
            label="Chỉnh sửa thông tin"
            onPress={() =>
              Alert.alert(
                "Đang phát triển",
                "Tính năng này sẽ có trong phiên bản tiếp theo.",
              )
            }
          />
          <View style={styles.divider} />
          <MenuRow
            icon="lock-closed-outline"
            label="Đổi mật khẩu"
            onPress={() =>
              Alert.alert(
                "Đang phát triển",
                "Tính năng này sẽ có trong phiên bản tiếp theo.",
              )
            }
          />
        </View>

        {/* Thông báo section */}
        <Text style={styles.sectionLabel}>THÔNG BÁO</Text>
        <View style={styles.section}>
          <ToggleRow
            icon="alarm-outline"
            label="Nhận cảnh báo"
            value={notifAlert}
            onToggle={setNotifAlert}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon="volume-medium-outline"
            label="Âm thanh thông báo"
            value={notifMotion}
            onToggle={setNotifMotion}
          />
        </View>

        {/* Ứng dụng section */}
        <Text style={styles.sectionLabel}>ỨNG DỤNG</Text>
        <View style={styles.section}>
          <ToggleRow
            icon="moon-outline"
            label="Giao diện tối"
            value={darkMode}
            onToggle={setDarkMode}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="globe-outline"
            label="Ngôn ngữ"
            value="Tiếng Việt"
            onPress={() =>
              Alert.alert(
                "Đang phát triển",
                "Hỗ trợ đa ngôn ngữ sẽ có trong phiên bản tiếp theo.",
              )
            }
          />
        </View>

        {/* Giới thiệu section */}
        <Text style={styles.sectionLabel}>GIỚI THIỆU</Text>
        <View style={styles.section}>
          <View style={styles.appInfoRow}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.appLogoImg}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.appName}>Camera AI Security</Text>
              <Text style={styles.appSub}>Ứng dụng giám sát camera AI</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FF6B35"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {value ? (
        <Text style={styles.menuValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSub} />
      )}
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onToggle }) {
  return (
    <View style={styles.menuRow}>
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={[styles.menuLabel, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary + "88" }}
        thumbColor={value ? COLORS.primary : COLORS.textSub}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
  },
  container: {
    padding: SPACING.base,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 56 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.base,
  },
  avatarBox: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  profileName: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  profileEmail: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.base,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  menuLabel: { color: COLORS.textMain, fontSize: FONTS.sizes.md, flex: 1 },
  menuValue: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  appInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.base,
  },
  appLogoImg: {
    width: 44,
    height: 44,
    marginRight: SPACING.md,
  },
  appName: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  appSub: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xl,
    backgroundColor: "#FF6B35" + "22",
    borderWidth: 1,
    borderColor: "#FF6B35" + "66",
    borderRadius: RADIUS.xl,
    height: 52,
  },
  logoutText: {
    color: "#FF6B35",
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
});
