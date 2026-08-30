import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { storageService } from '../services/storage';
import { COLORS } from '../theme';

export default function AuthScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Estados dos formulários
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verifica se o usuário já se cadastrou anteriormente
  useEffect(() => {
    checkRegistration();
  }, []);

  const checkRegistration = async () => {
    const user = await storageService.getUser();
    if (user) {
      setIsRegistered(true);
      setRegisteredUser(user);
    }
    setLoading(false);
  };

  // Trata a submissão do Cadastro Inicial
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos para continuar.');
      return;
    }

    const userData = { name, email, password };
    const result = await storageService.registerUser(userData);

    if (result.success) {
      Alert.alert('Sucesso', `Bem-vindo(a), ${name}!`);
      onLoginSuccess(userData);
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  // Trata a validação da Senha de Retorno
  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Atenção', 'Digite sua senha.');
      return;
    }

    const result = await storageService.loginWithPassword(password);

    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={NEON_GREEN} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>kilo<Text style={styles.titleAccent}>app</Text></Text>
      <Text style={styles.tagline}>Treino, calorias e evolução num só lugar</Text>

      {isRegistered ? (
        // TELA DE RETORNO: Apenas digite a senha
        <View style={styles.card}>
          <Text style={styles.subtitle}>Olá, {registeredUser?.name}!</Text>
          <Text style={styles.instruction}>Digite sua senha para acessar o treino:</Text>

          <TextInput
            style={styles.input}
            placeholder="Sua Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // PRIMEIRO ACESSO: Form de Cadastro
        <View style={styles.card}>
          <Text style={styles.subtitle}>Criar Cadastro</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Crie uma Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastrar e Iniciar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const { accent: NEON_GREEN, bg: DARK_BG, surface: CARD_BG, border: BORDER_COLOR } = COLORS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: DARK_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#FFF',
    marginBottom: 6,
  },
  titleAccent: {
    color: NEON_GREEN,
  },
  tagline: {
    fontSize: 13,
    color: '#7A7E70',
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#000',
    color: '#FFF',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  button: {
    backgroundColor: NEON_GREEN,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});