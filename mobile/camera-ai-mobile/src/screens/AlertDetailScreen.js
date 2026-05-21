import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { markAsRead } from "../api/alertApi";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function AlertDetailScreen({ route, navigation }) {
  const { alert: initialAlert } = route.params;
  const [alert, setAlert] = useState(initialAlert);
  const [marked, setMarked] = useState(initialAlert.isRead);
  const [marking, setMarking] = useState(false);
  const [imgFullscreen, setImgFullscreen] = useState(false);

  const confidence = Math.round((alert.confidenceScore || 0.98) * 100);
  const d = new Date(alert.createdAt);
  const time = `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;

  const handleMarkRead = async () => {
    if (marking) return;
    setMarking(true);
    try {
      await markAsRead(alert.id);
      setMarked(true);
      setAlert((prev) => ({ ...prev, isRead: true }));
    } catch (err) {
      // silent fail — vẫn cập nhật UI
      setMarked(true);
      setAlert((prev) => ({ ...prev, isRead: true }));
    } finally {
      setMarking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Fullscreen image modal */}
      <Modal
        visible={imgFullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setImgFullscreen(false)}
        statusBarTranslucent
      >
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImgFullscreen(false)}
        >
          <Image
            source={{ uri: resolveMediaUrl(alert.mediaUrl) }}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setImgFullscreen(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết cảnh báo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Large image with overlaid content */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setImgFullscreen(true)}
        >
          <View style={styles.imageBox}>
            <Image
              source={{ uri: resolveMediaUrl(alert.mediaUrl) }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* TOP pills row */}
            <View style={styles.topPillsRow}>
              <View
                style={[
                  styles.overlayPill,
                  marked ? styles.overlayPillRead : styles.overlayPillUnread,
                ]}
              >
                <View
                  style={[
                    styles.pillDot,
                    { backgroundColor: marked ? COLORS.online : COLORS.alert },
                  ]}
                />
                <Text
                  style={[
                    styles.pillText,
                    { color: marked ? COLORS.online : COLORS.alert },
                  ]}
                >
                  {marked ? "ĐÃ ĐỌC" : "CHƯA ĐỌC"}
                </Text>
              </View>
              <View style={[styles.overlayPill, styles.overlayPillType]}>
                <Text style={styles.pillText}>
                  {(alert.description || "Có người trong ảnh").toUpperCase()}
                </Text>
              </View>
            </View>
            {/* BOTTOM title + device overlay */}
            <View style={styles.bottomOverlay}>
              <Text style={styles.imageAlertTitle}>{"Phát hiện người"}</Text>
              <View style={styles.imageDevRow}>
                <Ionicons
                  name="videocam-outline"
                  size={14}
                  color={COLORS.textSub}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.imageDevName}>
                  {alert.deviceName || "Camera cửa chính"}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Time info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>THỜI GIAN</Text>
          <Text style={styles.infoValue}>{time}</Text>
        </View>

        {/* Mark read button */}
        {!marked ? (
          <TouchableOpacity
            style={[styles.ctaBtn, marking && { opacity: 0.7 }]}
            onPress={handleMarkRead}
            activeOpacity={0.85}
            disabled={marking}
          >
            {marking ? (
              <ActivityIndicator
                size="small"
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={styles.ctaBtnText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.readBanner}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={COLORS.online}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.readBannerText}>Đã đọc</Text>
          </View>
        )}

        {/* Live stream link */}
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() =>
            navigation.navigate("LiveStream", {
              device: { id: alert.deviceId, deviceName: alert.deviceName },
            })
          }
        >
          <Ionicons
            name="play-circle-outline"
            size={16}
            color={COLORS.textSub}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.linkBtnText}>Xem trực tiếp</Text>
        </TouchableOpacity>
      </ScrollView>
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
  backBtn: { width: 36, alignItems: "flex-start" },
  headerTitle: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  container: {
    paddingBottom: 40,
  },
  imageBox: {
    position: "relative",
    height: 260,
    backgroundColor: COLORS.surfaceHigh,
  },
  image: { width: "100%", height: "100%" },
  topPillsRow: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: "row",
    gap: SPACING.xs,
  },
  overlayPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11,19,38,0.85)",
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
  },
  overlayPillUnread: { borderColor: COLORS.alert + "55" },
  overlayPillRead: { borderColor: COLORS.online + "55" },
  overlayPillType: { borderColor: COLORS.border },
  pillDot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  pillText: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.5,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.base,
    backgroundColor: "rgba(11,19,38,0.7)",
  },
  imageAlertTitle: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  imageDevRow: { flexDirection: "row", alignItems: "center" },
  imageDevName: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    padding: SPACING.base,
  },
  infoLabel: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  infoValue: { color: COLORS.textMain, fontSize: FONTS.sizes.md },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  confidenceText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    height: 52,
  },
  ctaBtnText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  readBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.online + "22",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.online,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    height: 52,
  },
  readBannerText: {
    color: COLORS.online,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  linkBtnText: { color: COLORS.textSub, fontSize: FONTS.sizes.sm },
  // Fullscreen image modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalClose: {
    position: "absolute",
    top: 48,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 6,
  },
});
