import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { COLORS } from '../theme';

const SplashScreen = ({ onFinish }) => {

  useEffect(() => {
    // Define um timer de 3 segundos (3000 milissegundos)
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish(); // Chama a função para navegar para a tela principal
      }
    }, 3000);

    // Limpa o timer se o componente for desmontado antes dos 3 segundos
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.content}>
        {/* Marca geométrica — sem efeito de brilho */}
        <View style={styles.mark}>
          <Text style={styles.markLetter}>K</Text>
        </View>

        <Text style={styles.appName}>
          kilo<Text style={styles.appNameAccent}>app</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  markLetter: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.accent,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  },
  appNameAccent: {
    color: COLORS.accent,
  },
});

export default SplashScreen;