import { Tabs } from 'expo-router';
import { ScanLine, User, Utensils, Search, ScanQrCode, ScanBarcode } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View, Text, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [showScanMenu, setShowScanMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showScanMenu) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showScanMenu]);
  
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: '#0A0E27',
          },
          headerTintColor: '#E3F2FD',
          headerTitleStyle: {
            color: '#E3F2FD',
          },
          tabBarStyle: {
            backgroundColor: '#121838',
            borderTopColor: '#1E2647',
            borderTopWidth: 1,
            height: 60 + Math.max(insets.bottom - 6, 0),
            paddingBottom: Math.max(insets.bottom, 12),
            paddingTop: 8,
            position: 'relative',
          },
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#B3D9FF',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarIcon: ({ color, size }) => <Utensils size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={styles.scanButtonContainer}>
                <View style={[styles.scanButton, focused && styles.scanButtonActive]}>
                  <ScanLine size={32} color={focused ? "#FFFFFF" : "#2196F3"} />
                </View>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowScanMenu(!showScanMenu);
            },
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>

      {showScanMenu && (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={() => setShowScanMenu(false)}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>

          <Animated.View
            style={[
              styles.floatingMenu,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
            pointerEvents="box-none"
          >
            <Pressable
              style={styles.floatingButtonWrapper}
              onPress={() => {
                setShowScanMenu(false);
              }}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.floatingButton}
              >
                <ScanBarcode size={24} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.floatingButtonLabel}>Code-barres</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.floatingButtonWrapper}
              onPress={() => {
                setShowScanMenu(false);
              }}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.floatingButton}
              >
                <Search size={24} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.floatingButtonLabel}>Recherche</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.floatingButtonWrapper}
              onPress={() => {
                setShowScanMenu(false);
              }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.floatingButton}
              >
                <ScanQrCode size={24} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.floatingButtonLabel}>QR Code</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scanButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0A0E27',
    borderWidth: 3,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#42A5F5',
    shadowColor: '#2196F3',
    shadowOpacity: 0.8,
    transform: [{ scale: 1.05 }],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  floatingMenu: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 20,
    zIndex: 1000,
  },
  floatingButtonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingButton: {
    width: 85,
    height: 85,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  floatingButtonLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});