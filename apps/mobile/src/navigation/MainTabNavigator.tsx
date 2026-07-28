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

interface TabIconProps {
  color: string;
}

function FeedTabIcon({ color }: TabIconProps) {
  return <House size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />;
}

function HubsTabIcon({ color }: TabIconProps) {
  return <Users size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />;
}

function CreateTabIcon({ color }: TabIconProps) {
  return <CirclePlus size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />;
}

function CareerTabIcon({ color }: TabIconProps) {
  return <Briefcase size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />;
}

function ProfileTabIcon({ color }: TabIconProps) {
  return <User size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />;
}

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
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: "Ana Sayfa", tabBarIcon: FeedTabIcon }} />
      <Tab.Screen name="Hubs" component={HubsScreen} options={{ title: "Topluluklar", tabBarIcon: HubsTabIcon }} />
      <Tab.Screen name="Create" component={CreateCaseScreen} options={{ title: "Paylaş", tabBarIcon: CreateTabIcon }} />
      <Tab.Screen name="Career" component={CareerScreen} options={{ title: "Kariyer", tabBarIcon: CareerTabIcon }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil", tabBarIcon: ProfileTabIcon }} />
    </Tab.Navigator>
  );
}
