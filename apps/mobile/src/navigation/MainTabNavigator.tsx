import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { House, Users, CirclePlus, Briefcase, User } from "lucide-react-native";
import { colors, iconSizes, iconStrokeWidth } from "@nexora/ui-tokens";
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
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color }) => <House size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
      <Tab.Screen
        name="Hubs"
        component={HubsScreen}
        options={{
          tabBarIcon: ({ color }) => <Users size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateCaseScreen}
        options={{
          tabBarIcon: ({ color }) => <CirclePlus size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
      <Tab.Screen
        name="Career"
        component={CareerScreen}
        options={{
          tabBarIcon: ({ color }) => <Briefcase size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <User size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />,
        }}
      />
    </Tab.Navigator>
  );
}
