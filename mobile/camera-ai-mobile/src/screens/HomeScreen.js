import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { getDevices } from "../api/deviceApi";
import { getAlerts } from "../api/alertApi";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function HomeScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [devRes, alertRes] = await Promise.all([getDevices(), getAlerts()]);
      setDevices(devRes.data?.data || []);
      setAlerts(alertRes.data?.data || []);
    } catch (err) {
      setError("Không thể tải dữ liệu. Kéo xuống để thử lại.");
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const today = new Date().toDateString();
  const onlineCount = devices.filter(
    (d) => d.status === "ONLINE" || d.status === "STREAMING",
  ).length;
  const alertsToday = alerts.filter(
    (a) => new Date(a.createdAt).toDateString() === today,
  );
  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const latestAlert = alerts[0] || null;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Error banner */}
        {error !== "" && (
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.alert + "22",
              borderRadius: RADIUS.md,
              padding: SPACING.sm,
              marginBottom: SPACING.sm,
              borderWidth: 1,
              borderColor: COLORS.alert,
            }}
            onPress={onRefresh}
          >
            <Text
              style={{
                color: COLORS.alert,
                fontSize: FONTS.sizes.sm,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="menu" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Camera AI Security</Text>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate("Alerts")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.textMain}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* System status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconBox}>
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.statusTitle}>Hệ thống đang hoạt động</Text>
          <View style={styles.aiPill}>
            <View style={styles.aiDot} />
            <Text style={styles.aiText}>AI Detection: Bật</Text>
          </View>
        </View>

        {/* Stat row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{onlineCount}</Text>
            <Text style={styles.statLabel}>Thiết bị online</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{alertsToday.length}</Text>
            <Text style={styles.statLabel}>Cảnh báo hôm nay</Text>
          </View>
          <View
            style={[styles.statCard, unreadCount > 0 && styles.statCardAlert]}
          >
            <Text
              style={[
                styles.statValue,
                unreadCount > 0 && styles.statValueAlert,
              ]}
            >
              {unreadCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                unreadCount > 0 && styles.statLabelAlert,
              ]}
            >
              Chưa đọc
            </Text>
          </View>
        </View>

        {/* Latest alert */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CẢNH BÁO MỚI NHẤT</Text>
          {latestAlert && (
            <Text style={styles.sectionTime}>
              {new Date(latestAlert.createdAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>

        {latestAlert ? (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() =>
              navigation.navigate("AlertDetail", { alert: latestAlert })
            }
            activeOpacity={0.9}
          >
            <View style={styles.alertImageBox}>
              <Image
                source={{ uri: resolveMediaUrl(latestAlert.mediaUrl) }}
                style={styles.alertImage}
                resizeMode="cover"
              />
              {/* Overlay label */}
              <View style={styles.alertLabel}>
                <Ionicons
                  name="walk"
                  size={14}
                  color={COLORS.background}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.alertLabelText}>{"Phát hiện người"}</Text>
              </View>
            </View>
            {/* Device row */}
            <View style={styles.alertDeviceRow}>
              <Ionicons
                name="videocam-outline"
                size={16}
                color={COLORS.textSub}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.alertDeviceName}>
                {latestAlert.deviceName || "Camera Cửa trước"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.textSub}
                style={{ marginLeft: "auto" }}
              />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={32}
              color={COLORS.online}
            />
            <Text style={styles.emptyText}>Không có cảnh báo mới</Text>
          </View>
        )}

        {/* Device status */}
        <Text style={styles.sectionTitle2}>TRẠNG THÁI THIẾT BỊ</Text>
        {devices.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={styles.deviceRow}
            onPress={() => navigation.navigate("LiveStream", { device: d })}
            activeOpacity={0.8}
          >
            <View style={styles.deviceIconBox}>
              <Ionicons
                name="shield-outline"
                size={20}
                color={
                  d.status === "ONLINE" || d.status === "STREAMING"
                    ? COLORS.primary
                    : COLORS.textSub
                }
              />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{d.deviceName}</Text>
              {d.status === "OFFLINE" && (
                <Text style={styles.deviceSub}>
                  {`Thấy lần cuối ${new Date(d.lastActive).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
                </Text>
              )}
            </View>
            <View style={styles.onlineDot(d.status)} />
            {d.status !== "OFFLINE" && (
              <Text style={styles.onlineText}>Online</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddDevice")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: 100,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.base,
  },
  menuBtn: { padding: 4 },
  headerTitle: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  bellBtn: { padding: 4, position: "relative" },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.alert,
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: FONTS.weights.bold,
  },
  // Status card
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    padding: SPACING.xl,
    marginBottom: SPACING.base,
  },
  statusIconBox: {
    width: 72,
    height: 72,
    backgroundColor: "rgba(76,215,246,0.12)",
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  statusTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.sm,
  },
  aiPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  aiText: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  // Stats
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: "center",
  },
  statCardAlert: {
    borderColor: COLORS.alert + "55",
    backgroundColor: COLORS.alert + "11",
  },
  statValue: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
  },
  statValueAlert: { color: COLORS.alert },
  statLabel: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    textAlign: "center",
    marginTop: 2,
  },
  statLabelAlert: { color: COLORS.alert },
  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
  },
  sectionTitle2: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  sectionTime: { color: COLORS.textSub, fontSize: FONTS.sizes.xs },
  // Latest alert card
  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: SPACING.base,
  },
  alertImageBox: { position: "relative", height: 200 },
  alertImage: { width: "100%", height: "100%" },
  alertLabel: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.alert,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  alertLabelText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
  },
  confidenceBadge: {
    position: "absolute",
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  confidenceText: { color: COLORS.textMain, fontSize: FONTS.sizes.xs },
  alertDeviceRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  alertDeviceName: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.md,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.base,
  },
  emptyText: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.md,
    marginTop: SPACING.sm,
  },
  // Device rows
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  deviceIconBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  deviceInfo: { flex: 1 },
  deviceName: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
  },
  deviceSub: { color: COLORS.textSub, fontSize: FONTS.sizes.xs, marginTop: 2 },
  onlineDot: (status) => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor:
      status === "ONLINE" || status === "STREAMING"
        ? COLORS.online
        : COLORS.border,
    marginRight: 4,
  }),
  onlineText: { color: COLORS.online, fontSize: FONTS.sizes.sm },
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
