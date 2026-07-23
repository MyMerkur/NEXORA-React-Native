import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "@nexora/ui-tokens";
import { PlaceholderScreen } from "../screens/PlaceholderScreen";

export type MainTabParamList = {
  Feed: undefined;
  Hubs: undefined;
  Create: undefined;
  Career: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accentGold,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen name="Feed">{() => <PlaceholderScreen title="Ana Akış" />}</Tab.Screen>
      <Tab.Screen name="Hubs">{() => <PlaceholderScreen title="Hubs" />}</Tab.Screen>
      <Tab.Screen name="Create">{() => <PlaceholderScreen title="Paylaş" />}</Tab.Screen>
      <Tab.Screen name="Career">{() => <PlaceholderScreen title="Kariyer" />}</Tab.Screen>
      <Tab.Screen name="Profile">{() => <PlaceholderScreen title="Profil" />}</Tab.Screen>
    </Tab.Navigator>
  );
}
