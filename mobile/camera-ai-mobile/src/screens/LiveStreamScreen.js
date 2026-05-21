import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { getToken } from "../storage/tokenStorage";
import { API_BASE_URL } from "../api/apiClient";

export default function LiveStreamScreen({ route, navigation }) {
  const { device } = route.params || {};
  const [streamState, setStreamState] = useState("STOPPED");
  const ws = useRef(null);

  const isOffline = device?.status === "OFFLINE";

  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const startStream = async () => {
    if (isOffline) return;
    setStreamState("CONNECTING");
    try {
      const token = await getToken();
      const wsUrl = `${API_BASE_URL.replace("http", "ws")}/ws/app?token=${token}`;
      ws.current = new WebSocket(wsUrl);
      ws.current.onopen = () => {
        ws.current.send(
          JSON.stringify({ type: "START_STREAM", device_id: device.id }),
        );
        setStreamState("STREAMING");
      };
      ws.current.onerror = () => setStreamState("ERROR");
      ws.current.onclose = () => setStreamState("STOPPED");
    } catch (e) {
      setStreamState("ERROR");
    }
  };

  const stopStream = () => {
    if (ws.current) {
      ws.current.send(
        JSON.stringify({ type: "STOP_STREAM", device_id: device?.id }),
      );
      ws.current.close();
    }
    setStreamState("STOPPED");
  };

  const handleCapture = () => {
    Alert.alert(
      "Chụp ảnh",
      "Tính năng chụp ảnh sẽ có trong phiên bản tiếp theo.",
    );
  };

  const isStreaming = streamState === "STREAMING";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => {
            stopStream();
            navigation.goBack();
          }}
        >
          <Ionicons name="menu" size={22} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>SENTINEL AI</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.textMain}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Xem trực tiếp</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>TRỰC TIẼP</Text>
          </View>
        </View>
        <View style={styles.deviceNameRow}>
          <Ionicons
            name="videocam-outline"
            size={14}
            color={COLORS.textSub}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.deviceName}>
            {device?.device_name || "Camera"}
          </Text>
        </View>

        {/* Video Area */}
        <View style={styles.videoBox}>
          {streamState === "STOPPED" && (
            <TouchableOpacity
              style={styles.videoCenter}
              onPress={startStream}
              disabled={isOffline}
            >
              <Ionicons
                name="videocam-outline"
                size={52}
                color={isOffline ? COLORS.textSub : COLORS.primary}
              />
              <Text
                style={[
                  styles.videoPlaceholderText,
                  isOffline && { color: COLORS.textSub },
                ]}
              >
                {isOffline ? "Thiết bị offline" : "Nhấn để xem trực tiếp"}
              </Text>
            </TouchableOpacity>
          )}
          {streamState === "CONNECTING" && (
            <View style={styles.videoCenter}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.videoPlaceholderText}>Đang kết nối...</Text>
            </View>
          )}
          {streamState === "STREAMING" && (
            <View style={styles.videoCenter}>
              <Ionicons name="videocam" size={48} color={COLORS.alert} />
              <Text
                style={[styles.videoPlaceholderText, { color: COLORS.alert }]}
              >
                ĐANG PHÁT TRỰC TIẾP
              </Text>
              <Text style={styles.videoPlaceholderSub}>
                Frame sẽ hiển thị khi backend sẵn sàng
              </Text>
            </View>
          )}
          {streamState === "ERROR" && (
            <View style={styles.videoCenter}>
              <Ionicons name="warning-outline" size={48} color={COLORS.alert} />
              <Text
                style={[styles.videoPlaceholderText, { color: COLORS.alert }]}
              >
                Kết nối thất bại
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={startStream}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* LIVE overlay pill */}
          {isStreaming && (
            <View style={styles.videoLivePill}>
              <View style={styles.liveDot} />
              <Text style={styles.videoLivePillText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              !isStreaming && !isOffline
                ? styles.actionBtnStart
                : styles.actionBtnDisabled,
            ]}
            onPress={startStream}
            disabled={isStreaming || isOffline}
          >
            <Ionicons
              name="play-circle-outline"
              size={20}
              color={
                !isStreaming && !isOffline ? COLORS.background : COLORS.textSub
              }
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.actionBtnText,
                (isStreaming || isOffline) && { color: COLORS.textSub },
              ]}
            >
              Bắt đầu xem
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              isStreaming ? styles.actionBtnStop : styles.actionBtnDisabled,
            ]}
            onPress={stopStream}
            disabled={!isStreaming}
          >
            <Ionicons
              name="stop-circle-outline"
              size={20}
              color={isStreaming ? COLORS.textMain : COLORS.textSub}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.actionBtnTextDark,
                !isStreaming && { color: COLORS.textSub },
              ]}
            >
              Dừng xem
            </Text>
          </TouchableOpacity>
        </View>

        {/* Warning notice */}
        <View style={styles.noticeBox}>
          <Ionicons
            name="warning-outline"
            size={18}
            color="#FF6B35"
            style={{ marginRight: 8, flexShrink: 0 }}
          />
          <Text style={styles.noticeText}>
            Khi xem trực tiếp, camera có thể tạm dừng phát hiện AI.
          </Text>
        </View>
      </View>
    </SafeAreaView>
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
  headerIcon: { padding: 4 },
  headerBrand: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 2,
  },
  container: { flex: 1, padding: SPACING.base },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  pageTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginRight: SPACING.sm,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.online + "22",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.online + "44",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.online,
    marginRight: 5,
  },
  liveBadgeText: {
    color: COLORS.online,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  deviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  deviceName: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.sm,
  },
  videoBox: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  videoCenter: { alignItems: "center", padding: SPACING.base },
  videoPlaceholderText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.body,
    marginTop: SPACING.sm,
    fontWeight: FONTS.weights.semibold,
  },
  videoPlaceholderSub: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
  },
  videoLivePill: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.alert + "CC",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  videoLivePillText: {
    color: "#fff",
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    marginLeft: 4,
  },
  retryBtn: {
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: 6,
  },
  retryBtnText: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  actionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: RADIUS.xl,
  },
  actionBtnCapture: { backgroundColor: COLORS.primary },
  actionBtnStart: { backgroundColor: COLORS.primary },
  actionBtnStop: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnDisabled: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
  },
  actionBtnTextDark: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FF6B3511",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "#FF6B3544",
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  noticeText: {
    color: "#FF6B35",
    fontSize: FONTS.sizes.sm,
    flex: 1,
    lineHeight: 20,
  },
  deviceInfoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  deviceInfoRow: { flexDirection: "row", alignItems: "center" },
  deviceInfoText: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
});
