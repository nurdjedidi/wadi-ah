import { AuthProvider } from '@/contexts/AuthContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { theme } from '@/theme/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="nutrition-form" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="new-food" />
          <Stack.Screen name="food-details" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </PaperProvider>
    </AuthProvider>
  );
}
