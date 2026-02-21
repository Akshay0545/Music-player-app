import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/rootNavigation';
import { usePlayerStore } from './src/store/playerStore';

function AppContent() {
  const hydrate = usePlayerStore((s) => s.hydrate);
  const isDark = useTheme().isDark;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <NavigationContainer ref={navigationRef}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <PlayerProvider>
          <RootNavigator />
        </PlayerProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
