import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Animated } from 'react-native';
import { ProgressBar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized.length === 3
    ? sanitized.split('').map((c) => c + c).join('')
    : sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface NutritionProfile {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fats: number;
}

interface UserProfile {
  full_name: string;
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nutrition, setNutrition] = useState<NutritionProfile | null>(null);
  const [weekWorkouts, setWeekWorkouts] = useState(0);
  const [showCardioDetails, setShowCardioDetails] = useState(false);
  const [showFPDetails, setShowFPDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const { data: nutritionData } = await supabase
      .from('nutrition_profiles')
      .select('daily_calories, daily_protein, daily_carbs, daily_fats')
      .eq('user_id', user.id)
      .maybeSingle();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: workoutData, count } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('completed_at', weekAgo.toISOString());

    setProfile(profileData);
    setNutrition(nutritionData);
    setWeekWorkouts(count || 0);
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Athlète';

  const CircularProgress = ({
    size,
    strokeWidth,
    progress,
    trackColor,
    progressColor,
    center,
  }: {
    size: number;
    strokeWidth: number;
    progress: number; // 0..1
    trackColor: string;
    progressColor: string;
    center?: React.ReactNode;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(1, progress)));
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {center ? <View style={styles.circleLabel}>{center}</View> : null}
      </View>
    );
  };

  const NutritionSliderCard = () => {
    const primary = theme.colors.primary;
    const surfaceVariant = theme.colors.surfaceVariant as string;

    const calorieTarget = nutrition?.daily_calories || 2200;
    const calorieConsumed = 1280; // valeur de test
    const calorieProgress = calorieTarget > 0 ? calorieConsumed / calorieTarget : 0;

    const proteinTarget = nutrition?.daily_protein || 160;
    const proteinConsumed = 84; // test
    const carbTarget = nutrition?.daily_carbs || 250;
    const carbConsumed = 180; // test
    const fatTarget = nutrition?.daily_fats || 70;
    const fatConsumed = 40; // test

    // Couleurs normalisées (Standards proposés)
    const proteinsColor = '#EF4444'; // Rouge vif
    const carbsColor = '#3B82F6'; // Bleu vif
    const fatsColor = '#F59E0B'; // Ambre/Orange
    const caloriesColor = '#8B5CF6'; // Violet vif (recommandé)

    return (
      <View style={styles.glassCardWrapper}>
        <BlurView
          intensity={40}
          tint="dark"
          style={[
            styles.glassCard,
            {
              backgroundColor: hexToRgba(theme.colors.secondaryContainer as string, 0.14),
              borderColor: hexToRgba(primary, 0.22),
            },
          ]}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderContent}
          >
            <View style={styles.slideColumn}>
              <Text variant="titleMedium" style={styles.glassTitle}>Conso calorique</Text>
              <View style={styles.circleContainerCompact}>
                <CircularProgress
                  size={140}
                  strokeWidth={12}
                  progress={calorieProgress}
                  trackColor={surfaceVariant}
                  progressColor={caloriesColor}
                  center={
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="labelLarge" style={styles.progressValueSmall}>
                        {calorieConsumed}/{calorieTarget} kcal
                      </Text>
                    </View>
                  }
                />
              </View>
            </View>

            <View style={styles.slideColumn}>
              <Text variant="titleMedium" style={styles.glassTitle}>Macros</Text>
              <View style={styles.macrosCirclesRow}>
                {/* Glucides */}
                <View style={styles.macroCircleItem}>
                  <CircularProgress
                    size={72}
                    strokeWidth={8}
                    progress={carbTarget > 0 ? carbConsumed / carbTarget : 0}
                    trackColor={surfaceVariant}
                    progressColor={carbsColor}
                    center={
                      <View style={{ alignItems: 'center' }}>
                        <Text variant="labelLarge" style={styles.progressValueSmall}>
                          {carbConsumed}/{carbTarget}g
                        </Text>
                      </View>
                    }
                  />
                  <Text variant="bodySmall" style={styles.macroLabelSmall}>Glucides</Text>
                </View>

                {/* Lipides */}
                <View style={styles.macroCircleItem}>
                  <CircularProgress
                    size={72}
                    strokeWidth={8}
                    progress={fatTarget > 0 ? fatConsumed / fatTarget : 0}
                    trackColor={surfaceVariant}
                    progressColor={fatsColor}
                    center={
                      <View style={{ alignItems: 'center' }}>
                        <Text variant="labelLarge" style={styles.progressValueSmall}>
                          {fatConsumed}/{fatTarget}g
                        </Text>
                      </View>
                    }
                  />
                  <Text variant="bodySmall" style={styles.macroLabelSmall}>Lipides</Text>
                </View>

                {/* Protéines */}
                <View style={styles.macroCircleItem}>
                  <CircularProgress
                    size={72}
                    strokeWidth={8}
                    progress={proteinTarget > 0 ? proteinConsumed / proteinTarget : 0}
                    trackColor={surfaceVariant}
                    progressColor={proteinsColor}
                    center={
                      <View style={{ alignItems: 'center' }}>
                        <Text variant="labelLarge" style={styles.progressValueSmall}>
                          {proteinConsumed}/{proteinTarget}g
                        </Text>
                      </View>
                    }
                  />
                  <Text variant="bodySmall" style={styles.macroLabelSmall}>Protéines</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </BlurView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.customAppBar}>
  <BlurView
    intensity={60}
    tint="dark"
    style={[
      styles.appBarBlur,
      {
        backgroundColor: hexToRgba(theme.colors.secondaryContainer as string, 0.12),
        borderBottomColor: hexToRgba(theme.colors.primary as string, 0.25),
      },
    ]}
  >
    <View style={styles.appBarContent}>
      {/* Titre avec gradient subtil */}
      <View style={styles.appBarTitleSection}>
        <LinearGradient
          colors={['#2196F3', '#03A9F4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleGradientBg}
        >
          <Text variant="headlineSmall" style={styles.appBarTitle}>
            Wadi'ah
          </Text>
        </LinearGradient>
      </View>

      {/* Actions avec effet glassmorphism */}
      <View style={styles.appBarActions}>

        <Pressable
          style={styles.iconButton}
          onPress={() => {/* Action recherche */}}
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={[
              styles.iconButtonBlur,
              {
                backgroundColor: hexToRgba(theme.colors.primary as string, 0.15),
                borderColor: hexToRgba(theme.colors.primary as string, 0.3),
              },
            ]}
          >
            <Ionicons name="search-outline" size={20} color="#E3F2FD" />
          </BlurView>
        </Pressable>
      </View>
    </View>
  </BlurView>
</View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Pressable style={styles.ctaWrapper} onPress={() => router.push('/new-food')}>
            <LinearGradient
              colors={['rgba(33, 150, 243, 0.25)', 'rgba(33, 150, 243, 0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <BlurView
                intensity={30}
                tint="dark"
                style={[
                  styles.ctaCard,
                  {
                    backgroundColor: hexToRgba(theme.colors.secondaryContainer as string, 0.14),
                    borderColor: hexToRgba(theme.colors.primary as string, 0.35),
                  },
                ]}
              >
                <View style={styles.ctaContent}>
                  <View style={styles.ctaIconContainer}>
                    <LinearGradient
                      colors={['#2196F3', '#1976D2']}
                      style={styles.ctaIconGradient}
                    >
                      <Ionicons name="add-circle" size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.ctaTextBlock}>
                    <Text variant="titleMedium" style={styles.glassTitle}>Ajouter des aliments</Text>
                    <Text variant="bodySmall" style={styles.ctaSubtitle}>Suivez votre nutrition au quotidien</Text>
                  </View>
                  <View style={styles.ctaPill}>
                    <Ionicons name="arrow-forward" size={18} color="#E3F2FD" />
                  </View>
                </View>
              </BlurView>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <NutritionSliderCard />

        <Animated.View
          style={[
            styles.scoresRow,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.glassMiniWrapper,
              pressed && styles.glassMiniPressed,
            ]}
            onPress={() => setShowCardioDetails((v) => !v)}
          >
            <BlurView
              intensity={40}
              tint="dark"
              style={[
                styles.glassMini,
                {
                  backgroundColor: hexToRgba(theme.colors.secondaryContainer as string, 0.14),
                  borderColor: hexToRgba(theme.colors.primary as string, 0.22),
                },
              ]}
            >
              <View style={styles.miniContentColumn}>
                <Text variant="titleSmall" style={styles.glassTitle}>État cardiaque</Text>
                <View style={styles.miniCircleHolder}>
                  <CircularProgress
                    size={72}
                    strokeWidth={8}
                    progress={0.72}
                    trackColor={theme.colors.surfaceVariant as string}
                    progressColor="#DC2626"
                    center={
                      <View style={{ alignItems: 'center' }}>
                        <Text variant="labelLarge" style={styles.progressValueSmall}>72</Text>
                      </View>
                    }
                  />
                </View>
                <Text variant="bodySmall" style={styles.tapHint}>Appuyez pour détails</Text>
                {showCardioDetails && (
                  <View style={styles.miniExpand}>
                    <View style={styles.miniExpandRow}>
                      <Text variant="bodySmall" style={styles.miniExpandLabel}>SFA</Text>
                      <ProgressBar
                        visible
                        progress={18/25}
                        color="black"
                        style={[styles.miniLinear, { backgroundColor: theme.colors.surfaceVariant as string }]}
                      />
                      <Text variant="bodySmall" style={styles.miniExpandValue}>18/25g</Text>
                    </View>
                    <View style={styles.miniExpandRow}>
                      <Text variant="bodySmall" style={styles.miniExpandLabel}>Sodium</Text>
                      <ProgressBar
                        visible
                        progress={1.9/2.0}
                        color="#60A5FA"
                        style={[styles.miniLinear, { backgroundColor: theme.colors.surfaceVariant as string }]}
                      />
                      <Text variant="bodySmall" style={styles.miniExpandValue}>1.9/2.0g</Text>
                    </View>
                  </View>
                )}
              </View>
            </BlurView>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.glassMiniWrapper,
              pressed && styles.glassMiniPressed,
            ]}
            onPress={() => setShowFPDetails((v) => !v)}
          >
            <BlurView
              intensity={40}
              tint="dark"
              style={[
                styles.glassMini,
                {
                  backgroundColor: hexToRgba(theme.colors.secondaryContainer as string, 0.14),
                  borderColor: hexToRgba(theme.colors.primary as string, 0.22),
                },
              ]}
            >
              <View style={styles.miniContentColumn}>
                <Text variant="titleSmall" style={styles.glassTitle}>Fibres/Protéines</Text>
                <View style={styles.miniCircleHolder}>
                  <CircularProgress
                    size={72}
                    strokeWidth={8}
                    progress={0.64}
                    trackColor={theme.colors.surfaceVariant as string}
                    progressColor="#10B981"
                    center={
                      <View style={{ alignItems: 'center' }}>
                        <Text variant="labelLarge" style={styles.progressValueSmall}>64</Text>
                      </View>
                    }
                  />
                </View>
                <Text variant="bodySmall" style={styles.tapHint}>Appuyez pour détails</Text>
                {showFPDetails && (
                  <View style={styles.miniExpand}>
                    <View style={styles.miniExpandRow}>
                      <Text variant="bodySmall" style={styles.miniExpandLabel}>Fibres</Text>
                      <ProgressBar
                        visible
                        progress={18/25}
                        color="#10B981"
                        style={[styles.miniLinear, { backgroundColor: theme.colors.surfaceVariant as string }]}
                      />
                      <Text variant="bodySmall" style={styles.miniExpandValue}>18/25g</Text>
                    </View>
                    <View style={styles.miniExpandRow}>
                      <Text variant="bodySmall" style={styles.miniExpandLabel}>Prot</Text>
                      <ProgressBar
                        visible
                        progress={84/160}
                        color="#EF4444"
                        style={[styles.miniLinear, { backgroundColor: theme.colors.surfaceVariant as string }]}
                      />
                      <Text variant="bodySmall" style={styles.miniExpandValue}>84/160g</Text>
                    </View>
                  </View>
                )}
              </View>
            </BlurView>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.glassWideWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={[
              styles.glassWide,
              {
                backgroundColor: hexToRgba(theme.colors.secondaryContainer as string, 0.14),
                borderColor: hexToRgba(theme.colors.primary as string, 0.22),
              },
            ]}
          >
            <View style={styles.wideContent}>
              <Text variant="titleMedium" style={styles.glassTitle}>Indice glycémique</Text>

              <View style={styles.wideRow}>
                <Text variant="bodySmall" style={styles.miniExpandLabel}>Sucres totaux</Text>
                <View style={styles.barArea}>
                  <ProgressBar
                    visible
                    progress={45/60}
                    color="#3B82F6"
                    style={[styles.miniLinear, { backgroundColor: hexToRgba('#3B82F6', 0.15) }]}
                  />
                </View>
                <View style={styles.valueBadge}>
                  <Text variant="labelLarge" style={styles.valueBadgeText}>45/60g</Text>
                </View>
              </View>

              <View style={styles.wideRow}>
                <Text variant="bodySmall" style={styles.miniExpandLabel}>Impact glyc.</Text>
                <View style={styles.impactTrackWrapper}>
                  <LinearGradient
                    colors={['#EF4444', '#F59E0B', '#10B981']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.impactGradient}
                  />
                  <View style={[styles.impactMarker, { left: `${62}%` }]} />
                  <View style={styles.impactScale}>
                    <Text variant="labelSmall" style={styles.impactScaleText}>0</Text>
                    <Text variant="labelSmall" style={styles.impactScaleText}>100</Text>
                  </View>
                </View>
                <View style={styles.valueBadgeNeutral}>
                  <Text variant="labelLarge" style={styles.valueBadgeText}>62</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  greeting: {
    color: '#E3F2FD',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    color: '#B3D9FF',
  },
  ctaWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  ctaGradient: {
    borderRadius: 20,
  },
  ctaCard: {
    borderWidth: 2,
    borderRadius: 20,
  },
  ctaContent: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ctaIconContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextBlock: {
    flex: 1,
    gap: 4,
  },
  ctaSubtitle: {
    color: '#93C5FD',
  },
  ctaPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
  },
  glassContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  sliderContent: {
    padding: 16,
  },
  slideColumn: {
    width: 320,
    paddingVertical: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  circleContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainerCompact: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    color: '#E3F2FD',
    fontWeight: 'bold',
  },
  progressValueSmall: {
    color: '#E3F2FD',
    fontWeight: '600',
    fontSize: 11,
  },
  progressMetric: {
    color: '#B3D9FF',
  },
  glassInfo: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  macrosCirclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  macroCircleItem: {
    alignItems: 'center',
    gap: 6,
  },
  macroLabelSmall: {
    color: '#B3D9FF',
    marginTop: 2,
    fontSize: 11,
  },
  glassTitle: {
    color: '#E3F2FD',
    fontWeight: '600',
  },
  glassSubtitle: {
    color: '#B3D9FF',
  },
  glassSubtitleCentered: {
    color: '#B3D9FF',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#121838',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#E3F2FD',
    fontWeight: '600',
  },
  calorieInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  calorieLabel: {
    color: '#B3D9FF',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A2142',
    marginBottom: 8,
  },
  progressText: {
    color: '#B3D9FF',
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  glassMiniWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  glassMiniPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  glassMini: {
    borderWidth: 1.5,
  },
  miniContent: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniContentColumn: {
    padding: 12,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  miniCircleHolder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniInfo: {
    flex: 1,
    gap: 2,
  },
  miniLine: {
    color: '#B3D9FF',
  },
  tapHint: {
    color: '#93C5FD',
    fontSize: 10,
    fontStyle: 'italic',
  },
  miniExpand: {
    width: '100%',
    gap: 6,
    marginTop: 4,
  },
  miniExpandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniExpandLabel: {
    width: 56,
    color: '#B3D9FF',
    fontWeight: '600',
  },
  miniExpandValue: {
    color: '#E3F2FD',
  },
  miniLinear: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#0F1533',
  },
  glassWideWrapper: {
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassWide: {
    borderWidth: 1.5,
    shadowColor: '#2196F3',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  wideContent: {
    padding: 16,
    gap: 12,
  },
  wideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barArea: {
    flex: 1,
    justifyContent: 'center',
  },
  impactTrackWrapper: {
    flex: 1,
    height: 14,
    position: 'relative',
    justifyContent: 'center',
  },
  impactGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    borderRadius: 5,
    opacity: 0.9,
  },
  impactMarker: {
    position: 'absolute',
    top: 0,
    transform: [{ translateX: -3 }],
    width: 6,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#C4B5FD',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  impactScale: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactScaleText: {
    color: '#93C5FD',
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  valueBadgeNeutral: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  valueBadgeText: {
    color: '#E3F2FD',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  macroLabel: {
    color: '#B3D9FF',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121838',
    borderRadius: 16,
  },
  statContent: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#B3D9FF',
    textAlign: 'center',
  },
  customAppBar: {
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 16,
    borderRadius: 0,
    overflow: 'hidden',
  },
  appBarBlur: {
    borderBottomWidth: 1,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  appBarTitleSection: {
    flex: 1,
    gap: 4,
  },
  titleGradientBg: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconButtonBlur: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
});
