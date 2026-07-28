import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../features/auth/screens/LoginScreen";
import { DesignPreviewScreen } from "../features/devPreview/screens/DesignPreviewScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../store/useThemeStore";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const { scheme, colors } = useTheme();
  const base = scheme === "light" ? DefaultTheme : DarkTheme;

  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.accentGold,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
        {__DEV__ ? (
          <Stack.Screen
            name="DesignPreview"
            component={DesignPreviewScreen}
            options={{ headerShown: true, title: "Tasarım Önizleme" }}
          />
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
