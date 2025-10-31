import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Activity } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Activity size={48} color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Activity size={80} color="#2196F3" />
          <Text variant="displayMedium" style={styles.title}>
          Wadi'ah
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            L'éthique du corps
          </Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text variant="bodyMedium" style={styles.description}>
            Adoptez un mode de vie sain qui vous correspond vraiment sans trahir vos valeurs
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.push('/auth/signup')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Commencer
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/auth/login')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Se connecter
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    color: '#E3F2FD',
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    color: '#B3D9FF',
    marginTop: 8,
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
  },
  description: {
    color: '#B3D9FF',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
