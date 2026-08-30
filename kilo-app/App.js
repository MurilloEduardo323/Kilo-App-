import React, { useState } from 'react';
import { StyleSheet, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import CaloriesScreen from './src/screens/CaloriesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SplashScreen from './src/screens/SplashScreen';
import { COLORS } from './src/theme';

const TAB_BAR_BG = '#0E0F0A';

const TABS = [
  { id: 'treinos', label: 'Treinos', icon: 'dumbbell' },
  { id: 'calorias', label: 'Calorias', icon: 'food-apple-outline' },
  { id: 'historico', label: 'Histórico', icon: 'chart-line' },
  { id: 'perfil', label: 'Perfil', icon: 'account-outline' },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('treinos');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('treinos');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        {!currentUser ? (
          <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />
        ) : (
          <>
            <View style={styles.screenArea}>
              <View
                style={[
                  styles.tabScreen,
                  activeTab === 'treinos' ? styles.tabScreenVisible : styles.tabScreenHidden,
                ]}
              >
                <HomeScreen user={currentUser} onLogout={handleLogout} />
              </View>

              <View
                style={[
                  styles.tabScreen,
                  activeTab === 'calorias' ? styles.tabScreenVisible : styles.tabScreenHidden,
                ]}
              >
                <CaloriesScreen isActive={activeTab === 'calorias'} />
              </View>

              <View
                style={[
                  styles.tabScreen,
                  activeTab === 'historico' ? styles.tabScreenVisible : styles.tabScreenHidden,
                ]}
              >
                <HistoryScreen isActive={activeTab === 'historico'} />
              </View>

              <View
                style={[
                  styles.tabScreen,
                  activeTab === 'perfil' ? styles.tabScreenVisible : styles.tabScreenHidden,
                ]}
              >
                <ProfileScreen
                  user={currentUser}
                  onLogout={handleLogout}
                  isActive={activeTab === 'perfil'}
                />
              </View>
            </View>

            <View style={styles.tabBar}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.tabItem}
                    onPress={() => setActiveTab(tab.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                      <MaterialCommunityIcons
                        name={tab.icon}
                        size={20}
                        color={isActive ? COLORS.bg : COLORS.textMuted}
                      />
                    </View>
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  screenArea: { flex: 1, position: 'relative' },
  tabScreen: { ...StyleSheet.absoluteFillObject },
  tabScreenVisible: { display: 'flex' },
  tabScreenHidden: { display: 'none' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: TAB_BAR_BG,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabIconWrap: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: { backgroundColor: COLORS.accent },
  tabLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  tabLabelActive: { color: COLORS.textPrimary },
});