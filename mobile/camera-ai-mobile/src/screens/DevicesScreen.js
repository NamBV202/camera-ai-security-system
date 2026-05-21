import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
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

export default function DevicesScreen({ navigation }) {
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
      setError("Không thể tải danh sách thiết bị.");
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

  const renderDevice = ({ item }) => {
    const isOnline = item.status === "ONLINE" || item.status === "STREAMING";
    const latestAlert = alerts
      .filter((a) => a.deviceId === item.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const alertText = latestAlert
      ? `Cảnh báo lúc ${new Date(latestAlert.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
      : "Chưa có cảnh báo mới";
    return (
      <View style={styles.deviceCard}>
        {/* Thumbnail */}
        <View style={styles.thumbBox}>
          {latestAlert?.mediaUrl ? (
            <Image
              source={{ uri: resolveMediaUrl(latestAlert.mediaUrl) }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
          ) : isOnline ? (
            <View style={styles.thumbOffline}>
              <Ionicons
                name="videocam-outline"
                size={36}
                color={COLORS.primary}
              />
            </View>
          ) : (
            <View style={styles.thumbOffline}>
              <Ionicons
                name="videocam-off-outline"
                size={36}
                color={COLORS.border}
              />
            </View>
          )}
          {/* Status badge */}
          <View
            style={[
              styles.statusBadge,
              isOnline ? styles.statusOnline : styles.statusOffline,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? COLORS.online : COLORS.border },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isOnline ? COLORS.online : COLORS.textSub },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <Text style={styles.deviceName}>{item.deviceName}</Text>
          <View style={styles.alertRow}>
            <Ionicons
              name={isOnline ? "notifications-outline" : "time-outline"}
              size={14}
              color={isOnline ? COLORS.online : COLORS.textSub}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.alertRowText}>{alertText}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate("Alerts")}
            >
              <Ionicons
                name="warning-outline"
                size={15}
                color={COLORS.textMain}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.btnOutlineText}>Xem cảnh báo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnFilled, !isOnline && styles.btnDisabled]}
              onPress={() =>
                isOnline && navigation.navigate("LiveStream", { device: item })
              }
            >
              <Ionicons
                name="play-circle-outline"
                size={15}
                color={isOnline ? COLORS.background : COLORS.textSub}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.btnFilledText,
                  !isOnline && { color: COLORS.textSub },
                ]}
              >
                Xem trực tiếp
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="shield" size={22} color={COLORS.primary} />
        <Text style={styles.headerTitle}>SENTINEL AI</Text>
        <TouchableOpacity>
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={COLORS.textMain}
          />
        </TouchableOpacity>
      </View>

      {/* Error banner */}
      {error !== "" && (
        <TouchableOpacity
          style={{
            margin: SPACING.base,
            backgroundColor: COLORS.alert + "22",
            borderRadius: RADIUS.md,
            padding: SPACING.sm,
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

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Camera của tôi</Text>
        <Text style={styles.pageSubtitle}>
          Quản lý và giám sát các luồng video của bạn.
        </Text>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons
              name="videocam-off-outline"
              size={48}
              color={COLORS.border}
            />
            <Text style={styles.emptyTitle}>Chưa có thiết bị nào</Text>
            <Text style={styles.emptySubtitle}>
              Thêm camera để bắt đầu giám sát
            </Text>
          </View>
        )}
      />

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.primary,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
    textAlign: "center",
    letterSpacing: 1,
    marginLeft: -22,
  },
  titleRow: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  pageTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: 2,
  },
  pageSubtitle: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  list: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 100,
  },
  deviceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: SPACING.base,
  },
  thumbBox: { position: "relative", height: 180 },
  thumbImage: { width: "100%", height: "100%" },
  thumbOffline: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  statusOnline: { backgroundColor: "rgba(0,0,0,0.6)" },
  statusOffline: { backgroundColor: "rgba(0,0,0,0.4)" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  cardBody: { padding: SPACING.md },
  deviceName: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.xs,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  alertRowText: { color: COLORS.textSub, fontSize: FONTS.sizes.sm, flex: 1 },
  actionRow: { flexDirection: "row", gap: SPACING.sm },
  btnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    height: 40,
  },
  btnOutlineText: { color: COLORS.textMain, fontSize: FONTS.sizes.sm },
  btnFilled: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    height: 40,
  },
  btnDisabled: { backgroundColor: COLORS.surfaceHigh },
  btnFilledText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.xs,
  },
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
