import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { navigationRef } from "./navigationRef";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import AddDeviceScreen from "../screens/AddDeviceScreen";
import AlertDetailScreen from "../screens/AlertDetailScreen";
import LiveStreamScreen from "../screens/LiveStreamScreen";
import { getToken } from "../storage/tokenStorage";
import { registerForPushNotifications } from "../utils/notifications";
import { COLORS } from "../constants/theme";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const notifResponseListener = useRef();

  useEffect(() => {
    if (isLoading || !isLoggedIn) return;

    // Đăng ký FCM token với backend
    registerForPushNotifications();

    // Xử lý khi user tap notification (app foreground/background)
    notifResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "ALERT" && navigationRef.isReady()) {
          navigationRef.navigate("MainTabs", { screen: "Alerts" });
        }
      });

    // Xử lý khi app bị kill và mở lại từ notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data;
      if (data?.type === "ALERT" && navigationRef.isReady()) {
        navigationRef.navigate("MainTabs", { screen: "Alerts" });
      }
    });

    return () => {
      if (notifResponseListener.current) {
        notifResponseListener.current.remove();
      }
    };
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    // Kiểm tra JWT khi khởi động app
    const checkAuth = async () => {
      try {
        const token = await getToken();
        setIsLoggedIn(!!token);
      } catch (e) {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Đã đăng nhập
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
            <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
            <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
            <Stack.Screen name="AuthStack" component={AuthStack} />
          </>
        ) : (
          // Chưa đăng nhập
          <>
            <Stack.Screen name="AuthStack" component={AuthStack} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
            <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
            <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
