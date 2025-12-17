import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';

const TabIcon = ({
  name,
  focused
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Ionicons
      name={name}
      size={22}
      color={focused ? colors.primary.default : colors.text.muted}
    />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary.default,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'গ্রাহক',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'প্রোফাইল',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    height: 65,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {},
});
