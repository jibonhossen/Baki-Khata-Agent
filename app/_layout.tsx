import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../constants/theme';
import supabase from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Initial check
    supabase.getStoredAgent().then(agent => {
      setIsLoggedIn(!!agent);
      setIsLoading(false);
    });

    // Subscribe to changes
    const unsubscribe = supabase.onAuthStateChange((agent) => {
      setIsLoggedIn(!!agent);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inUserDetail = segments[0] === 'user';
    const inProtectedArea = inAuthGroup || inUserDetail;

    if (!isLoggedIn && inProtectedArea) {
      router.replace('/login');
    } else if (isLoggedIn && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [isLoading, isLoggedIn, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0A0A0F', '#151520', '#0A0A0F']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="user/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
