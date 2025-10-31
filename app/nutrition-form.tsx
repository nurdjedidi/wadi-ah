import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Apple } from 'lucide-react-native';

export default function NutritionFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateNutrition = (
    weightKg: number,
    heightCm: number,
    ageYears: number,
    activity: string,
    goalType: string
  ) => {
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;

    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let calories = Math.round(bmr * activityMultipliers[activity]);

    const goalAdjustments: { [key: string]: number } = {
      lose_weight: -500,
      maintain: 0,
      gain_muscle: 300,
      gain_weight: 500,
    };

    calories += goalAdjustments[goalType];

    const protein = Math.round(weightKg * 2);
    const fats = Math.round(calories * 0.25 / 9);
    const carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);

    const baseWaterMlPerKg = 35; // mL/kg

    let waterMl = weightKg * baseWaterMlPerKg;

    const waterActivityMultipliers: { [key: string]: number } = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      very_active: 1.4,
    };
    waterMl *= (waterActivityMultipliers[activity] ?? 1.0);
    const dailyWaterLiters = +(waterMl / 1000).toFixed(2);

    return {
      daily_calories: calories,
      daily_protein: protein,
      daily_carbs: carbs,
      daily_fats: fats,
      daily_water: dailyWaterLiters,
    };
  };

  const handleSubmit = async () => {
    if (!age || !weight || !height) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) {
      setError('Veuillez entrer des valeurs valides');
      return;
    }

    if (ageNum < 12 || ageNum > 120) {
      setError('L\'âge doit être entre 12 et 120 ans');
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      setError('Le poids doit être entre 30 et 300 kg');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      setError('La taille doit être entre 100 et 250 cm');
      return;
    }

    setLoading(true);
    setError('');

    const nutrition = calculateNutrition(weightNum, heightNum, ageNum, activityLevel, goal);

    const { error: nutritionError } = await supabase
      .from('nutrition_profiles')
      .insert({
        user_id: user?.id,
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        activity_level: activityLevel,
        goal,
        ...nutrition,
      });

    if (nutritionError) {
      setLoading(false);
      setError('Erreur lors de l\'enregistrement');
      return;
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('id', user?.id);

    setLoading(false);

    if (profileError) {
      setError('Erreur lors de la mise à jour du profil');
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Apple size={48} color="#2196F3" />
            <Text variant="displaySmall" style={styles.title}>
              Profil Nutritionnel
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Aidez-nous à personnaliser votre plan
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Informations Personnelles
              </Text>

              <TextInput
                mode="outlined"
                label="Âge (années)"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                style={styles.input}
                theme={{ colors: { primary: '#2196F3' } }}
              />

              <TextInput
                mode="outlined"
                label="Poids (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                style={styles.input}
                theme={{ colors: { primary: '#2196F3' } }}
              />

              <TextInput
                mode="outlined"
                label="Taille (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                style={styles.input}
                theme={{ colors: { primary: '#2196F3' } }}
              />
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Niveau d'Activité
              </Text>
              <SegmentedButtons
                value={activityLevel}
                onValueChange={setActivityLevel}
                buttons={[
                  { value: 'sedentary', label: 'Sédentaire' },
                  { value: 'light', label: 'Léger' },
                  { value: 'moderate', label: 'Modéré' },
                ]}
                style={styles.segmented}
              />
              <SegmentedButtons
                value={activityLevel}
                onValueChange={setActivityLevel}
                buttons={[
                  { value: 'active', label: 'Actif' },
                  { value: 'very_active', label: 'Très Actif' },
                ]}
                style={styles.segmented}
              />
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Objectif
              </Text>
              <SegmentedButtons
                value={goal}
                onValueChange={setGoal}
                buttons={[
                  { value: 'lose_weight', label: 'Perdre' },
                  { value: 'maintain', label: 'Maintenir' },
                ]}
                style={styles.segmented}
              />
              <SegmentedButtons
                value={goal}
                onValueChange={setGoal}
                buttons={[
                  { value: 'gain_muscle', label: 'Muscler' },
                  { value: 'gain_weight', label: 'Prendre' },
                ]}
                style={styles.segmented}
              />
            </View>

            {error ? (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Terminer
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  title: {
    color: '#E3F2FD',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: '#B3D9FF',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#E3F2FD',
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#121838',
  },
  segmented: {
    backgroundColor: '#121838',
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
