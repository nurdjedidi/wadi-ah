import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, ViewToken } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dumbbell, Heart, TrendingUp, Target } from 'lucide-react-native';


const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: Dumbbell,
    title: 'Entraînements Personnalisés',
    description: 'Suivez vos séances d\'entraînement avec des exercices adaptés à vos objectifs',
  },
  {
    id: '2',
    icon: Heart,
    title: 'Suivi de Nutrition',
    description: 'Gérez votre alimentation et atteignez vos objectifs sans trahir vos valeurs',
  },
  {
    id: '3',
    icon: TrendingUp,
    title: 'Progression en Temps Réel',
    description: 'La bonne santé n\'est pas le travail d\'un jour, suivez votre progression et avancez toujours plus loin',
  },
  {
    id: '4',
    icon: Target,
    title: 'Atteignez Vos Objectifs',
    description: 'Définissez vos objectifs et recevez un plan personnalisé pour les atteindre',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace('/nutrition-form');
    }
  };

  const handleSkip = () => {
    router.replace('/nutrition-form');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {
    const Icon = item.icon;
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <Icon size={100} color="#2196F3" strokeWidth={1.5} />
        </View>
        <Text variant="displaySmall" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <Button mode="text" onPress={handleSkip} textColor="#B3D9FF">
          Passer
        </Button>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {currentIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    color: '#E3F2FD',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: '#B3D9FF',
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A2142',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#2196F3',
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
