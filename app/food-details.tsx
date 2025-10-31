import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Activity, Apple, ArrowLeft, Droplets, Flame, SlidersHorizontal, Target, Waves } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, ProgressBar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Food {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fibres: number;
  sodium_mg: number;
  water_ml?: number;
}

export default function FoodDetailsScreen() {
  const router = useRouter();
  const { foodName, portion, calories, protein, carbs, fats, fibres, sodium_mg, water_ml } = useLocalSearchParams();
  const { user } = useAuth();

  const food: Food = {
    name: foodName as string,
    portion: portion as string,
    calories: parseFloat(calories as string),
    protein: parseFloat(protein as string),
    carbs: parseFloat(carbs as string),
    fats: parseFloat(fats as string),
    fibres: parseFloat(fibres as string),
    sodium_mg: parseFloat(sodium_mg as string),
    water_ml: water_ml ? parseFloat(water_ml as string) : undefined,
  };

  const [userNutrition, setUserNutrition] = useState<any>(null);
  const [customPortion, setCustomPortion] = useState<number>(100);
  const [portionInput, setPortionInput] = useState<string>('100');

  useEffect(() => {
    loadUserNutrition();
  }, [user]);

  const loadUserNutrition = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('nutrition_profiles')
      .select('daily_calories, daily_protein, daily_carbs, daily_fats')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setUserNutrition(data);
  };

  const calculatePercentage = (value: number, daily: number) => {
    if (!daily || daily === 0) return 0;
    return Math.min((value / daily) * 100, 100);
  };

  const getNutritionColor = (percentage: number) => {
    if (percentage >= 80) return '#EF4444'; // Rouge
    if (percentage >= 50) return '#F59E0B'; // Orange
    return '#10B981'; // Vert
  };

  const calculateAdjustedValue = (baseValue: number, portionGrams: number) => {
    if (portionGrams <= 0) return 0;
    const ratio = portionGrams / 100;
    return Math.round((baseValue * ratio) * 10) / 10;
  };

  const effectivePortion = customPortion > 0 ? customPortion : 100;

  const adjustedFood = {
    calories: calculateAdjustedValue(food.calories, effectivePortion),
    protein: calculateAdjustedValue(food.protein, effectivePortion),
    carbs: calculateAdjustedValue(food.carbs, effectivePortion),
    fats: calculateAdjustedValue(food.fats, effectivePortion),
    fibres: calculateAdjustedValue(food.fibres, effectivePortion),
    sodium_mg: calculateAdjustedValue(food.sodium_mg, effectivePortion),
    water_ml: food.water_ml ? calculateAdjustedValue(food.water_ml, effectivePortion) : undefined,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => router.back()}
          icon={() => <ArrowLeft size={24} color="#B3D9FF" />}
          style={styles.backButton}
        >
          Retour
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.mainCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Apple size={48} color="#2196F3" />
              </View>
              <View style={styles.titleContainer}>
                <Text variant="headlineSmall" style={styles.foodName}>
                  {food.name}
                </Text>
                <Text variant="bodyMedium" style={styles.portion}>
                  {food.portion}
                </Text>
              </View>
            </View>

            <View style={styles.portionSelector}>
              <View style={styles.portionLabelContainer}>
                <SlidersHorizontal size={16} color="#93C5FD" />
                <Text variant="bodySmall" style={styles.portionLabel}>
                  Portion personnalisée
                </Text>
              </View>
              <View style={styles.portionInputContainer}>
                <TextInput
                  mode="flat"
                  value={portionInput}
                  onChangeText={(text) => {
                    // Permettre la saisie libre de texte
                    setPortionInput(text);
                    // Valider et mettre à jour la portion
                    if (text === '') {
                      setCustomPortion(0);
                      return;
                    }
                    const num = parseInt(text);
                    if (!isNaN(num) && num >= 1 && num <= 10000) {
                      setCustomPortion(num);
                    }
                  }}
                  keyboardType="numeric"
                  style={styles.portionInput}
                  contentStyle={styles.portionInputContent}
                  theme={{ colors: { primary: '#2196F3' } }}
                />
                <Text style={styles.gramsLabel}>g</Text>
              </View>
            </View>

            <View style={styles.calorieHighlight}>
              <Flame size={32} color="#2196F3" />
              <View style={styles.calorieTextContainer}>
                <Text variant="displaySmall" style={styles.caloriesValue}>
                  {adjustedFood.calories}
                </Text>
                <Text variant="bodyLarge" style={styles.caloriesLabel}>
                  kcal
                </Text>
              </View>
            </View>

            {userNutrition && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={calculatePercentage(adjustedFood.calories, userNutrition.daily_calories) / 100}
                  color={getNutritionColor(calculatePercentage(adjustedFood.calories, userNutrition.daily_calories))}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.progressText}>
                  {calculatePercentage(adjustedFood.calories, userNutrition.daily_calories).toFixed(0)}% de l'objectif journalier
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.macrosGrid}>
          <Card style={styles.macroCard}>
            <Card.Content>
              <View style={styles.macroIconContainer}>
                <Target size={28} color="#EF4444" />
              </View>
              <Text variant="headlineSmall" style={styles.macroValue}>
                {adjustedFood.protein}g
              </Text>
              <Text variant="bodySmall" style={styles.macroLabel}>
                Protéines
              </Text>
              {userNutrition && (
                <Text variant="labelSmall" style={styles.macroPercentage}>
                  {calculatePercentage(adjustedFood.protein, userNutrition.daily_protein).toFixed(0)}%
                </Text>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.macroCard}>
            <Card.Content>
              <View style={styles.macroIconContainer}>
                <Activity size={28} color="#3B82F6" />
              </View>
              <Text variant="headlineSmall" style={styles.macroValue}>
                {adjustedFood.carbs}g
              </Text>
              <Text variant="bodySmall" style={styles.macroLabel}>
                Glucides
              </Text>
              {userNutrition && (
                <Text variant="labelSmall" style={styles.macroPercentage}>
                  {calculatePercentage(adjustedFood.carbs, userNutrition.daily_carbs).toFixed(0)}%
                </Text>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.macroCard}>
            <Card.Content>
              <View style={styles.macroIconContainer}>
                <Flame size={28} color="#F59E0B" />
              </View>
              <Text variant="headlineSmall" style={styles.macroValue}>
                {adjustedFood.fats}g
              </Text>
              <Text variant="bodySmall" style={styles.macroLabel}>
                Lipides
              </Text>
              {userNutrition && (
                <Text variant="labelSmall" style={styles.macroPercentage}>
                  {calculatePercentage(adjustedFood.fats, userNutrition.daily_fats).toFixed(0)}%
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>

        <View style={styles.detailsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Détails nutritionnels
          </Text>
          
          <View style={styles.detailsGrid}>
            <Card style={styles.detailCard}>
              <Card.Content style={styles.detailCardContent}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Target size={20} color="#10B981" />
                </View>
                <Text variant="headlineMedium" style={styles.detailNumber}>
                  {adjustedFood.fibres}
                </Text>
                <Text variant="labelSmall" style={styles.detailLabel}>
                  Fibres (g)
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.detailCard}>
              <Card.Content style={styles.detailCardContent}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Waves size={20} color="#3B82F6" />
                </View>
                <Text variant="headlineMedium" style={styles.detailNumber}>
                  {adjustedFood.sodium_mg}
                </Text>
                <Text variant="labelSmall" style={styles.detailLabel}>
                  Sodium (mg)
                </Text>
              </Card.Content>
            </Card>
          </View>

          {adjustedFood.water_ml && (
            <Card style={styles.waterCard}>
              <Card.Content style={styles.waterCardContent}>
                <View style={styles.waterContent}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Droplets size={28} color="#3B82F6" />
                  </View>
                  <View style={styles.waterTextContainer}>
                    <Text variant="headlineSmall" style={styles.waterValue}>
                      {adjustedFood.water_ml}ml
                    </Text>
                    <Text variant="bodySmall" style={styles.waterLabel}>
                      Contenu en eau
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>

        <Button
          mode="contained"
          onPress={() => {
            // Logique pour ajouter à la journée
            router.back();
          }}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
        >
          Ajouter à ma journée
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  mainCard: {
    backgroundColor: '#121838',
    borderRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A2142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  foodName: {
    color: '#E3F2FD',
    fontWeight: 'bold',
  },
  portion: {
    color: '#B3D9FF',
  },
  portionSelector: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#1A2142',
    borderRadius: 12,
  },
  portionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  portionLabel: {
    color: '#93C5FD',
  },
  portionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portionInput: {
    backgroundColor: '#121838',
    borderRadius: 8,
    flex: 1,
  },
  portionInputContent: {
    fontSize: 16,
    fontWeight: '600',
  },
  gramsLabel: {
    color: '#B3D9FF',
    fontSize: 16,
    fontWeight: '600',
  },
  calorieHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  calorieTextContainer: {
    alignItems: 'center',
  },
  caloriesValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  caloriesLabel: {
    color: '#B3D9FF',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A2142',
  },
  progressText: {
    color: '#B3D9FF',
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#121838',
    borderRadius: 16,
  },
  macroIconContainer: {
    marginBottom: 8,
  },
  macroValue: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  macroLabel: {
    color: '#B3D9FF',
  },
  macroPercentage: {
    color: '#93C5FD',
    marginTop: 4,
  },
  detailsSection: {
    gap: 16,
  },
  sectionTitle: {
    color: '#E3F2FD',
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#121838',
    borderRadius: 16,
  },
  detailCardContent: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailNumber: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  detailLabel: {
    color: '#93C5FD',
    textAlign: 'center',
  },
  waterCard: {
    backgroundColor: '#121838',
    borderRadius: 16,
  },
  waterCardContent: {
    padding: 16,
  },
  waterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  waterTextContainer: {
    flex: 1,
    gap: 4,
  },
  waterValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  waterLabel: {
    color: '#B3D9FF',
  },
  addButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonContent: {
    paddingVertical: 8,
  },
});

