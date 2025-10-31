import { Tabs } from 'expo-router';
import { ScanLine, User, Utensils, Search, ScanQrCode, ScanBarcode } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [showScanMenu, setShowScanMenu] = useState(false);
  
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
        <View style={styles.floatingMenu} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => {
              setShowScanMenu(false);
              // Action gauche - Scanner QR
            }}
          >
            <ScanBarcode size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => {
              setShowScanMenu(false);
              // Action centre - Scanner Code-barres
            }}
          >
            <Search size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => {
              setShowScanMenu(false);
              // Action droite - Scanner Document
            }}
          >
            <ScanQrCode size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
  },
  floatingMenu: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    zIndex: 1000,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A0E27',
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});