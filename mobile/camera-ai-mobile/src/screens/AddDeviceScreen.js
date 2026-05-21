import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { getEsp32Info, sendWifiConfig } from "../api/esp32Api";
import { pairDevice } from "../api/deviceApi";

const STEPS = [
  { id: 0, title: "Kết nối WiFi ESP32" },
  { id: 1, title: "Phát hiện thiết bị" },
  { id: 2, title: "Cấu hình WiFi nhà" },
  { id: 3, title: "Ghép nối thiết bị" },
  { id: 4, title: "Hoàn thành" },
];

export default function AddDeviceScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);

  // State cho từng bước
  const [macAddress, setMacAddress] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bước 1: Phát hiện ESP32
  const handleDetectEsp32 = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getEsp32Info();
      const mac = res.data.macAddress || res.data.mac_address;
      setMacAddress(mac);
      setCurrentStep(2);
    } catch (err) {
      setError(
        "Không tìm thấy ESP32-CAM. Hãy chắc chắn điện thoại đã kết nối WiFi ESP32-CAM-XXXX",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Gửi WiFi xuống ESP32
  const handleSendWifi = async () => {
    if (!ssid.trim()) {
      setError("Vui lòng nhập tên WiFi");
      return;
    }
    if (!wifiPassword) {
      setError("Vui lòng nhập mật khẩu WiFi");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendWifiConfig(ssid.trim(), wifiPassword);
      setCurrentStep(3);
    } catch (err) {
      // ESP32 ngắt SoftAP ngay sau khi nhận config → connection reset là bình thường
      if (!err.response) {
        setCurrentStep(3);
      } else {
        setError("Gửi cấu hình WiFi thất bại. Kiểm tra kết nối ESP32-CAM.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 3: Ghép nối với backend
  const handlePair = async () => {
    if (!deviceName.trim()) {
      setError("Vui lòng đặt tên cho camera");
      return;
    }
    if (!macAddress) {
      setError("Lỗi: Không có MAC address. Vui lòng bắt đầu lại từ đầu.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await pairDevice(macAddress, deviceName.trim());
      setCurrentStep(4);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Ghép nối thất bại. Thử lại sau.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Kết nối Camera</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 4 }}
        >
          <Ionicons name="close" size={22} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Stepper */}
        <View style={styles.stepper}>
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    idx < currentStep && styles.stepDone,
                    idx === currentStep && styles.stepActive,
                  ]}
                >
                  <Text style={styles.stepCircleText}>
                    {idx < currentStep ? "✓" : idx + 1}
                  </Text>
                </View>
              </View>
              {idx < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    idx < currentStep && styles.stepLineDone,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.stepLabel}>
          {STEPS[currentStep].icon} {STEPS[currentStep].title}
        </Text>

        {/* Error banner */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* === Step 0: Hướng dẫn kết nối WiFi ESP32 === */}
        {currentStep === 0 && (
          <View style={styles.stepContent}>
            {/* Icon stacked */}
            <View style={styles.wizardIconBox}>
              <Ionicons
                name="camera-outline"
                size={36}
                color={COLORS.primary}
              />
              <Ionicons
                name="wifi"
                size={22}
                color={COLORS.primary}
                style={styles.iconOverlay}
              />
            </View>
            <Text style={styles.instruction}>
              Thực hiện các bước sau trước khi nhấn tiếp theo:
            </Text>
            <View style={styles.stepsList}>
              <View style={styles.stepsListItem}>
                <View style={styles.stepsNum}>
                  <Text style={styles.stepsNumText}>1</Text>
                </View>
                <Text style={styles.stepsText}>
                  Kết nối điện thoại với nguồn điện
                </Text>
              </View>
              <View style={styles.stepsListItem}>
                <View style={styles.stepsNum}>
                  <Text style={styles.stepsNumText}>2</Text>
                </View>
                <Text style={styles.stepsText}>Đợi camera tạo mạng WiFi</Text>
              </View>
              <View style={styles.stepsListItem}>
                <View style={styles.stepsNum}>
                  <Text style={styles.stepsNumText}>3</Text>
                </View>
                <View>
                  <Text style={styles.stepsText}>Kết nối vào mạng:</Text>
                  <View style={styles.ssidBox}>
                    <Ionicons
                      name="wifi"
                      size={14}
                      color={COLORS.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.ssidText}>ESP32-CAM-XXXX</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => {
                setError(null);
                setCurrentStep(1);
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaBtnText}>Tôi đã kết nối</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === Step 1: Phát hiện ESP32 === */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.wizardIconBox}>
              <Ionicons
                name="search-outline"
                size={40}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.instruction}>
              App sẽ tự động phát hiện thiết bị ESP32-CAM trên mạng SoftAP.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleDetectEsp32}
              disabled={isLoading}
            >
              <Ionicons
                name={isLoading ? "hourglass-outline" : "radio-outline"}
                size={20}
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaBtnText}>
                {isLoading ? "Đang tìm..." : "Phát hiện thiết bị"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === Step 2: Cấu hình WiFi nhà === */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            {macAddress ? (
              <View style={styles.macBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.online}
                  style={{ marginRight: 8 }}
                />
                <View>
                  <Text style={styles.macLabel}>Tìm thấy thiết bị</Text>
                  <Text style={styles.macValue}>MAC: {macAddress}</Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.instruction}>
              Nhập thông tin WiFi nhà để ESP32-CAM kết nối sau khi cài đặt:
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="wifi-outline"
                size={18}
                color={COLORS.textSub}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.input}
                value={ssid}
                onChangeText={(t) => {
                  setSsid(t);
                  setError(null);
                }}
                placeholder="Tên mạng WiFi nhà"
                placeholderTextColor={COLORS.textSub}
              />
            </View>
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.textSub}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.input}
                value={wifiPassword}
                onChangeText={(t) => {
                  setWifiPassword(t);
                  setError(null);
                }}
                placeholder="Mật khẩu WiFi nhà"
                placeholderTextColor={COLORS.textSub}
                secureTextEntry
              />
            </View>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleSendWifi}
              disabled={isLoading}
            >
              <Ionicons
                name={isLoading ? "hourglass-outline" : "send-outline"}
                size={20}
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaBtnText}>
                {isLoading ? "Đang gửi..." : "Gửi cấu hình WiFi"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === Step 3: Ghép nối với backend === */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={COLORS.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.infoText}>
                ESP32-CAM đang kết nối WiFi nhà...{"\n"}
                Kết nối lại WiFi nhà trên điện thoại, sau đó đặt tên camera.
              </Text>
            </View>
            <View style={styles.inputWrap}>
              <Ionicons
                name="videocam-outline"
                size={18}
                color={COLORS.textSub}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.input}
                value={deviceName}
                onChangeText={(t) => {
                  setDeviceName(t);
                  setError(null);
                }}
                placeholder="VD: Camera cửa chính"
                placeholderTextColor={COLORS.textSub}
                autoCapitalize="sentences"
              />
            </View>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handlePair}
              disabled={isLoading}
            >
              <Ionicons
                name={isLoading ? "hourglass-outline" : "link-outline"}
                size={20}
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaBtnText}>
                {isLoading ? "Đang ghép nối..." : "Ghép nối thiết bị"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === Step 4: Thành công === */}
        {currentStep === 4 && (
          <View style={styles.successContent}>
            <View style={styles.successIconBox}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={COLORS.online}
              />
            </View>
            <Text style={styles.successTitle}>Thêm camera thành công!</Text>
            <Text style={styles.successSubtitle}>
              Camera <Text style={styles.highlight}>"{deviceName}"</Text> đã
              được ghép vào tài khoản của bạn.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Home" })
              }
            >
              <Ionicons
                name="home-outline"
                size={20}
                color={COLORS.background}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaBtnText}>Về trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnSecondary]}
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Devices" })
              }
            >
              <Text style={styles.ctaBtnSecondaryText}>
                Xem danh sách thiết bị
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  container: {
    padding: SPACING.base,
    paddingBottom: 60,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  stepItem: { alignItems: "center" },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "33",
  },
  stepDone: { borderColor: COLORS.online, backgroundColor: COLORS.online },
  stepCircleText: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  stepLineDone: { backgroundColor: COLORS.online },
  stepLabel: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
    marginBottom: SPACING.base,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: COLORS.alert + "22",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.alert,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  errorText: { color: COLORS.alert, fontSize: FONTS.sizes.sm },
  stepContent: { marginTop: SPACING.sm },
  wizardIconBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.base,
    position: "relative",
    height: 72,
  },
  iconOverlay: { position: "absolute", bottom: 0, right: "32%" },
  instruction: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.md,
    lineHeight: 24,
    marginBottom: SPACING.base,
  },
  highlight: { color: COLORS.primary, fontWeight: FONTS.weights.semibold },
  stepsList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  stepsListItem: { flexDirection: "row", alignItems: "flex-start" },
  stepsNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "22",
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    flexShrink: 0,
  },
  stepsNumText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  stepsText: { color: COLORS.textMain, fontSize: FONTS.sizes.sm, flex: 1 },
  ssidBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "11",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + "44",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  ssidText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    height: 52,
    marginTop: SPACING.md,
  },
  ctaBtnText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  ctaBtnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ctaBtnSecondaryText: { color: COLORS.textSub, fontSize: FONTS.sizes.body },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    height: 50,
  },
  input: { flex: 1, color: COLORS.textMain, fontSize: FONTS.sizes.md },
  macBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.online + "11",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.online,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  macLabel: {
    color: COLORS.online,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  macValue: { color: COLORS.textMain, fontSize: FONTS.sizes.sm },
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.primary + "11",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + "44",
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  infoText: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.sm,
    flex: 1,
    lineHeight: 20,
  },
  successContent: { alignItems: "center", paddingTop: SPACING.xl },
  successIconBox: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.online + "11",
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  successTitle: {
    color: COLORS.textMain,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    color: COLORS.textSub,
    fontSize: FONTS.sizes.md,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
});
