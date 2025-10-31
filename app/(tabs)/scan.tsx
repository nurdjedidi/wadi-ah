import { useRouter } from 'expo-router';
import { ScanLine } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScanLine size={80} color="#2196F3" />
        <Text variant="headlineMedium" style={styles.title}>
          Scanner un code-barres
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Fonctionnalité bientôt disponible
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: '#E3F2FD',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#B3D9FF',
    textAlign: 'center',
  },
});

