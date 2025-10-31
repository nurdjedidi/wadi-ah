import { useAuth } from '@/contexts/AuthContext';
import { foods } from '@/lib/basic-food';
import { useRouter } from 'expo-router';
import { ArrowLeft, Flame, Search, Target } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Text as PaperText } from 'react-native-paper';
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

export default function NewFoodScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    // ta logique de chargement si besoin
  };

  const onChangeSearch = (text: string) => {
    setSearch(text);
    const lower = text.toLowerCase();
    if (lower.length === 0) {
      setFilteredFoods([]); // Pas d'affichage si rien saisi
    } else {
      const filtered = foods.filter(f => f.name.toLowerCase().includes(lower));
      setFilteredFoods(filtered);
    }
  };
  

  const onSelectFood = (food: Food) => {
    router.push({
      pathname: '/food-details',
      params: {
        foodName: food.name,
        portion: food.portion,
        calories: food.calories.toString(),
        protein: food.protein.toString(),
        carbs: food.carbs.toString(),
        fats: food.fats.toString(),
        fibres: food.fibres.toString(),
        sodium_mg: food.sodium_mg.toString(),
        ...(food.water_ml && { water_ml: food.water_ml.toString() }),
      }
    });
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
        <PaperText variant="headlineSmall" style={styles.title}>
          Rechercher un aliment
        </PaperText>
      </View>

      <View style={styles.searchContainer}>
        <Search size={24} color="#93C5FD" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tapez le nom de l'aliment..."
          placeholderTextColor="#93C5FD"
          value={search}
          onChangeText={onChangeSearch}
          autoCapitalize="none"
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFoods.length === 0 ? (
          <View style={styles.emptyState}>
            <PaperText variant="titleMedium" style={styles.emptyText}>
              Aucun aliment trouvé
            </PaperText>
            <PaperText variant="bodyMedium" style={styles.emptySubtext}>
              Essayez avec un autre mot-clé
            </PaperText>
          </View>
        ) : (
          filteredFoods.map((f, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.foodCard}
              onPress={() => onSelectFood(f)}
              activeOpacity={0.7}
            >
              <View style={styles.foodCardContent}>
                <View style={styles.foodInfo}>
                  <PaperText variant="titleMedium" style={styles.foodName}>
                    {f.name}
                  </PaperText>
                  <PaperText variant="bodySmall" style={styles.portion}>
                    {f.portion}
                  </PaperText>
                </View>
                <View style={styles.nutritionPreview}>
                  <View style={styles.nutritionItem}>
                    <Flame size={14} color="#2196F3" />
                    <PaperText variant="labelLarge" style={styles.nutritionValue}>
                      {f.calories}
                    </PaperText>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Target size={14} color="#EF4444" />
                    <PaperText variant="labelLarge" style={styles.nutritionValue}>
                      {f.protein}g
                    </PaperText>
                  </View>
                </View>
              </View>
              <View style={styles.macroBar}>
                <View style={[styles.macroSegment, { flex: f.carbs, backgroundColor: '#3B82F6' }]} />
                <View style={[styles.macroSegment, { flex: f.protein, backgroundColor: '#EF4444' }]} />
                <View style={[styles.macroSegment, { flex: f.fats, backgroundColor: '#F59E0B' }]} />
              </View>
            </TouchableOpacity>
          ))
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    color: '#E3F2FD',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#121838',
    borderWidth: 1,
    borderColor: '#1E2647',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#E3F2FD',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#E3F2FD',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#93C5FD',
  },
  foodCard: {
    backgroundColor: '#121838',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2647',
  },
  foodCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    color: '#E3F2FD',
    fontWeight: '600',
  },
  portion: {
    color: '#93C5FD',
  },
  nutritionPreview: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1A2142',
  },
  nutritionValue: {
    color: '#E3F2FD',
    fontWeight: '600',
  },
  macroBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroSegment: {
    minWidth: 8,
  },
});
