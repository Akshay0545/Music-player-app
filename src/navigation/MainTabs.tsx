import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { MainTabsParamList } from './types';
import { HomeStack } from './HomeStack';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { QueueScreen } from '@/screens/QueueScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useTheme } from '@/context/ThemeContext';

const Tab = createBottomTabNavigator<MainTabsParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    HomeTab: '🏠',
    FavoritesTab: '♡',
    PlaylistsTab: '📋',
    SettingsTab: '⚙',
  };
  return <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icons[label] || '•'}</Text>;
}

function CustomTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const { colors } = useTheme();
  return (
    <View style={[styles.tabBarWrap, { backgroundColor: colors.background }]}>
      <MiniPlayer />
      <View style={[styles.tabBar, { borderTopColor: colors.border }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
              <Text style={{ color: isFocused ? colors.accent : colors.tabInactive }}>
                <TabIcon label={route.name} focused={isFocused} />
              </Text>
              <Text style={[styles.tabLabel, { color: isFocused ? colors.accent : colors.tabInactive }]}>
                {options.title ?? route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ title: 'Favorites' }} />
      <Tab.Screen name="PlaylistsTab" component={QueueScreen} options={{ title: 'Playlists' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {},
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIconWrap: { fontSize: 22 },
  tabLabel: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  tabIcon: { fontSize: 22, opacity: 0.7 },
  tabIconActive: { opacity: 1 },
});
