import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Activity, Apple, LogOut, Mail, Settings, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  full_name: string;
}

interface NutritionProfile {
  age: number;
  weight: number;
  height: number;
  activity_level: string;
  goal: string;
  daily_calories: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nutrition, setNutrition] = useState<NutritionProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const { data: nutritionData } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setProfile(profileData);
    setNutrition(nutritionData);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const getActivityLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      sedentary: 'Sédentaire',
      light: 'Léger',
      moderate: 'Modéré',
      active: 'Actif',
      very_active: 'Très Actif',
    };
    return labels[level] || level;
  };

  const getGoalLabel = (goal: string) => {
    const labels: { [key: string]: string } = {
      lose_weight: 'Perdre du poids',
      maintain: 'Maintenir',
      gain_muscle: 'Gagner du muscle',
      gain_weight: 'Prendre du poids',
    };
    return labels[goal] || goal;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Profil
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <User size={48} color="#2196F3" />
              </View>
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.name}>
                  {profile?.full_name || 'Utilisateur'}
                </Text>
                <View style={styles.emailContainer}>
                  <Mail size={16} color="#B3D9FF" />
                  <Text variant="bodyMedium" style={styles.email}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {nutrition && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Apple size={24} color="#2196F3" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Informations Nutritionnelles
                </Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.infoLabel}>
                    Âge
                  </Text>
                  <Text variant="titleMedium" style={styles.infoValue}>
                    {nutrition.age} ans
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.infoLabel}>
                    Poids
                  </Text>
                  <Text variant="titleMedium" style={styles.infoValue}>
                    {nutrition.weight} kg
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.infoLabel}>
                    Taille
                  </Text>
                  <Text variant="titleMedium" style={styles.infoValue}>
                    {nutrition.height} cm
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <List.Item
                title="Niveau d'activité"
                description={getActivityLabel(nutrition.activity_level)}
                titleStyle={styles.listTitle}
                descriptionStyle={styles.listDescription}
                left={(props) => <Activity {...props} size={24} color="#2196F3" />}
              />

              <List.Item
                title="Objectif"
                description={getGoalLabel(nutrition.goal)}
                titleStyle={styles.listTitle}
                descriptionStyle={styles.listDescription}
                left={(props) => <Activity {...props} size={24} color="#2196F3" />}
              />

              <List.Item
                title="Calories quotidiennes"
                description={`${nutrition.daily_calories} kcal`}
                titleStyle={styles.listTitle}
                descriptionStyle={styles.listDescription}
                left={(props) => <Activity {...props} size={24} color="#2196F3" />}
              />
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Paramètres"
              titleStyle={styles.listTitle}
              left={(props) => <Settings {...props} size={24} color="#2196F3" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#B3D9FF" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleSignOut}
          icon={() => <LogOut size={20} color="#EF5350" />}
          textColor="#EF5350"
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
        >
          Se déconnecter
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    color: '#E3F2FD',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#121838',
    borderRadius: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A2142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  name: {
    color: '#E3F2FD',
    fontWeight: 'bold',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  email: {
    color: '#B3D9FF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#E3F2FD',
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#B3D9FF',
    marginBottom: 4,
  },
  infoValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#1A2142',
    marginVertical: 12,
  },
  listTitle: {
    color: '#E3F2FD',
  },
  listDescription: {
    color: '#B3D9FF',
  },
  logoutButton: {
    borderColor: '#EF5350',
    borderRadius: 12,
    marginTop: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});
