import { useEffect, useState, type ComponentType } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { House, Users, CirclePlus, Briefcase, User, MessageCircle, Menu } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { duration, iconSizes, iconStrokeWidth } from "@nexora/ui-tokens";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { FeedScreen } from "../features/feed/screens/FeedScreen";
import { HubsScreen } from "../features/hubs/screens/HubsScreen";
import { CreateCaseScreen } from "../features/cases/screens/CreateCaseScreen";
import { CareerScreen } from "../features/jobs/screens/CareerScreen";
import { InboxScreen } from "../features/inbox/screens/InboxScreen";
import { getUnreadThreadCount } from "../services/inboxApi";
import { NotificationsHeaderButton } from "../features/notifications/components/NotificationsHeaderButton";
import { useTheme } from "../store/useThemeStore";

export type MainTabParamList = {
  Feed: undefined;
  Hubs: undefined;
  Create: undefined;
  Career: undefined;
  Inbox: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  focused: boolean;
  color: string;
}

// lucide-react-native doesn't export its icon component type publicly — mirrors the
// subset every icon actually needs here (see components/EmptyState.tsx for the same pattern).
interface IconComponentProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function AnimatedTabIcon(Icon: ComponentType<IconComponentProps>) {
  return function TabIcon({ focused, color }: TabIconProps) {
    const focusValue = useSharedValue(focused ? 1 : 0);

    useEffect(() => {
      focusValue.value = withTiming(focused ? 1 : 0, { duration: duration.fast });
    }, [focused, focusValue]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: 1 + focusValue.value * 0.12 }],
    }));

    return (
      <Animated.View style={animatedStyle}>
        <Icon size={iconSizes.md} color={color} strokeWidth={iconStrokeWidth} />
      </Animated.View>
    );
  };
}

const FeedTabIcon = AnimatedTabIcon(House);
const HubsTabIcon = AnimatedTabIcon(Users);
const CreateTabIcon = AnimatedTabIcon(CirclePlus);
const CareerTabIcon = AnimatedTabIcon(Briefcase);
const InboxTabIcon = AnimatedTabIcon(MessageCircle);
const ProfileTabIcon = AnimatedTabIcon(User);

// headerLeft on Ana Sayfa — opens the sidebar (Faz 5, #72). Sits at the same header
// height as the title and NotificationsHeaderButton, so all three stay aligned.
function SidebarToggle() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={styles.sidebarToggle}
      accessibilityLabel="Menü"
    >
      <Menu size={iconSizes.md} color={colors.textPrimary} strokeWidth={iconStrokeWidth} />
    </TouchableOpacity>
  );
}

export function MainTabNavigator() {
  const { colors } = useTheme();
  const [unreadThreadCount, setUnreadThreadCount] = useState(0);

  useEffect(() => {
    getUnreadThreadCount()
      .then(setUnreadThreadCount)
      .catch(() => undefined);
  }, []);

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
          title: "Ana Sayfa",
          tabBarIcon: FeedTabIcon,
          headerLeft: SidebarToggle,
          headerRight: NotificationsHeaderButton,
        }}
      />
      <Tab.Screen name="Hubs" component={HubsScreen} options={{ title: "Topluluklar", tabBarIcon: HubsTabIcon }} />
      <Tab.Screen name="Create" component={CreateCaseScreen} options={{ title: "Paylaş", tabBarIcon: CreateTabIcon }} />
      <Tab.Screen name="Career" component={CareerScreen} options={{ title: "Kariyer", tabBarIcon: CareerTabIcon }} />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          title: "Mesajlar",
          tabBarIcon: InboxTabIcon,
          tabBarBadge: unreadThreadCount > 0 ? unreadThreadCount : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil", tabBarIcon: ProfileTabIcon }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  sidebarToggle: {
    marginLeft: 12,
    padding: 6,
  },
});
