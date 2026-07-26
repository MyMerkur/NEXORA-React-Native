import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "@nexora/ui-tokens";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { FeedScreen } from "../features/feed/screens/FeedScreen";
import { HubsScreen } from "../features/hubs/screens/HubsScreen";
import { CreateCaseScreen } from "../features/cases/screens/CreateCaseScreen";
import { CareerScreen } from "../features/jobs/screens/CareerScreen";

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
      <Tab.Screen name="Hubs" component={HubsScreen} />
      <Tab.Screen name="Create" component={CreateCaseScreen} />
      <Tab.Screen name="Career" component={CareerScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
