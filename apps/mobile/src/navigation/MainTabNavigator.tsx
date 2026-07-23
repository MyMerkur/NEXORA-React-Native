import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "@nexora/ui-tokens";
import { PlaceholderScreen } from "../screens/PlaceholderScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { FeedScreen } from "../features/feed/screens/FeedScreen";
import { CreateCaseScreen } from "../features/cases/screens/CreateCaseScreen";

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
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Hubs">{() => <PlaceholderScreen title="Hubs" />}</Tab.Screen>
      <Tab.Screen name="Create" component={CreateCaseScreen} />
      <Tab.Screen name="Career">{() => <PlaceholderScreen title="Kariyer" />}</Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
