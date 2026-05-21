import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { getAlerts } from "../api/alertApi";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { useFocusEffect } from "@react-navigation/native";

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | unread | read
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const res = await getAlerts();
      setAlerts(res.data?.data || []);
    } catch (err) {
      setError("Không thể tải danh sách cảnh báo.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData().finally(() => setLoading(false));
    }, [fetchData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (filter === "unread") return alerts.filter((a) => !a.isRead);
    if (filter === "read") return alerts.filter((a) => a.isRead);
    return alerts;
  }, [alerts, filter]);

  const FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "unread", label: "Chưa đọc" },
    { key: "read", label: "Đã đọc" },
  ];

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return "Vừa xong";
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return d.toLocaleDateString("vi-VN");
  };

  const renderAlert = ({ item }) => (
    <TouchableOpacity
      style={[styles.alertCard, !item.isRead && styles.alertCardUnread]}
      onPress={() => navigation.navigate("AlertDetail", { alert: item })}
      activeOpacity={0.85}
    >
      {!item.isRead && <View style={styles.unreadBar} />}

      {/* Thumbnail with REC badge */}
      <View style={styles.alertThumbBox}>
        <Image
          source={{ uri: resolveMediaUrl(item.mediaUrl) }}
          style={styles.alertThumb}
          resizeMode="cover"
        />
        {!item.isRead && (
          <View style={styles.recBadge}>
            <Text style={styles.recText}>REC</Text>
          </View>
        )}
      </View>

      <View style={styles.alertInfo}>
        <View style={styles.alertTopRow}>
          <Text style={styles.alertTitle} numberOfLines={2}>
            {"Phát hiện người"}
          </Text>
          <View style={styles.timeCol}>
            <Text style={styles.alertTime}>{formatTime(item.createdAt)}</Text>
            <View
              style={[
                styles.statusDot,
                item.isRead ? styles.dotRead : styles.dotUnread,
              ]}
            />
          </View>
        </View>
        <View style={styles.alertDevRow}>
          <Ionicons
            name="videocam-outline"
            size={13}
            color={COLORS.textSub}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.alertDev} numberOfLines={1}>
            {item.deviceName || "Camera Cửa trước"}
          </Text>
        </View>
        <View style={styles.alertBadgeRow}>
          <View
            style={[
              styles.readBadge,
              item.isRead ? styles.readBadgeRead : styles.readBadgeUnread,
            ]}
          >
            <Text
              style={[
                styles.readBadgeText,
                item.isRead
                  ? styles.readBadgeTextRead
                  : styles.readBadgeTextUnread,
              ]}
            >
              {item.isRead ? "Đã đọc" : "Chưa đọc"}
            </Text>
          </View>
          <Text style={styles.alertDesc} numberOfLines={1}>
            {item.isRead ? "Cần kiểm tra" : "Có người trong ảnh"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.pageTitle}>Cảnh báo</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              filter === f.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAlert}
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
              name="checkmark-circle-outline"
              size={48}
              color={COLORS.online}
            />
            <Text style={styles.emptyTitle}>Không có cảnh báo</Text>
            <Text style={styles.emptySubtitle}>
              Hệ thống đang hoạt động bình thường
            </Text>
          </View>
        )}
      />
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  filterTextActive: {
    color: COLORS.background,
    fontWeight: FONTS.weights.bold,
  },
  list: { paddingHorizontal: SPACING.base, paddingBottom: 30 },
  alertCard: {
    flexDirection: "column",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  alertCardUnread: { borderColor: COLORS.primary + "44" },
  unreadBar: { height: 3, width: "100%", backgroundColor: COLORS.primary },
  alertThumbBox: {
    width: "100%",
    height: 180,
    position: "relative",
    overflow: "hidden",
  },
  alertThumb: { width: "100%", height: "100%" },
  recBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recText: {
    color: "#fff",
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.5,
  },
  alertInfo: { flex: 1, padding: SPACING.sm },
  alertTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  alertTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  timeCol: { alignItems: "center" },
  alertTime: { color: COLORS.textSub, fontSize: FONTS.sizes.xs, flexShrink: 0 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginTop: 4 },
  dotUnread: { backgroundColor: COLORS.primary },
  dotRead: { backgroundColor: COLORS.textSub + "66" },
  alertDevRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  alertDev: { color: COLORS.textSub, fontSize: FONTS.sizes.xs, flex: 1 },
  alertDesc: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    flex: 1,
    marginLeft: 6,
  },
  alertBadgeRow: { flexDirection: "row", alignItems: "center" },
  readBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  readBadgeUnread: { backgroundColor: COLORS.primary + "22" },
  readBadgeRead: { backgroundColor: COLORS.surfaceHigh },
  readBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  readBadgeTextUnread: { color: COLORS.primary },
  readBadgeTextRead: { color: COLORS.textSub },
  empty: { alignItems: "center", paddingVertical: 60 },
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
});
