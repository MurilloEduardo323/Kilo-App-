import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MUSCLE_GROUPS, EXERCISES } from '../data/exercises';
import { storageService } from '../services/storage';
import { COLORS } from '../theme';

export default function ProfileScreen({ user, onLogout, isActive }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [exerciseCount, setExerciseCount] = useState(0);

  const [profile, setProfile] = useState({
    name: user?.name || 'Atleta',
    email: user?.email || 'atleta@email.com',
    avatarUrl: user?.avatarUrl || '',
  });

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [savedProfile, savedExercises] = await Promise.all([
        storageService.getProfile(),
        storageService.getCustomExercises(),
      ]);

      const finalProfile = savedProfile || {
        name: user?.name || 'Atleta',
        email: user?.email || 'atleta@email.com',
        avatarUrl: user?.avatarUrl || '',
      };
      setProfile(finalProfile);

      const exercisesSource = savedExercises || EXERCISES;
      setExerciseCount(Object.values(exercisesSource).flat().length);

      setIsLoading(false);
    };
    loadData();
  }, []);

  // Recarrega dados sempre que a aba Perfil volta a ficar ativa
  // (a tela fica sempre montada, então isso funciona como um "refresh ao focar")
  useEffect(() => {
    if (!isActive || isLoading) return;
    const refresh = async () => {
      const [savedProfile, savedExercises] = await Promise.all([
        storageService.getProfile(),
        storageService.getCustomExercises(),
      ]);
      if (savedProfile) setProfile(savedProfile);
      if (savedExercises) {
        setExerciseCount(Object.values(savedExercises).flat().length);
      }
    };
    refresh();
  }, [isActive]);

  const handleStartEdit = () => {
    setNameInput(profile.name);
    setEmailInput(profile.email);
    setAvatarInput(profile.avatarUrl);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!nameInput.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar em branco.');
      return;
    }
    const updatedProfile = {
      name: nameInput.trim(),
      email: emailInput.trim(),
      avatarUrl: avatarInput.trim(),
    };
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
    setIsEditing(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => onLogout && onLogout() },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={NEON_GREEN} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Perfil</Text>

      <View style={styles.avatarCenterContainer}>
        {(isEditing ? avatarInput : profile.avatarUrl) ? (
          <Image
            source={{ uri: isEditing ? avatarInput : profile.avatarUrl }}
            style={styles.largeAvatar}
          />
        ) : (
          <View style={styles.largeAvatarPlaceholder}>
            <Text style={styles.largeAvatarInitial}>
              {(isEditing ? nameInput : profile.name).charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
        )}
      </View>

      {isEditing ? (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Nome:</Text>
          <TextInput style={styles.input} value={nameInput} onChangeText={setNameInput} />

          <Text style={styles.inputLabel}>E-mail:</Text>
          <TextInput
            style={styles.input}
            value={emailInput}
            onChangeText={setEmailInput}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>URL da Foto de Perfil:</Text>
          <TextInput
            style={styles.input}
            placeholder="https://sua-foto.com/foto.jpg"
            placeholderTextColor="#555"
            value={avatarInput}
            onChangeText={setAvatarInput}
            autoCapitalize="none"
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelBtn]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{MUSCLE_GROUPS.length}</Text>
              <Text style={styles.statLabel}>Grupos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{exerciseCount}</Text>
              <Text style={styles.statLabel}>Exercícios</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={handleStartEdit}>
            <Feather name="edit-2" size={14} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const { accent: NEON_GREEN, bg: DARK_BG, surface: CARD_BG, border: BORDER_COLOR } = COLORS;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG, padding: 20 },
  loadingContainer: { flex: 1, backgroundColor: DARK_BG, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: '#FFF', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  avatarCenterContainer: { alignItems: 'center', marginBottom: 20 },
  largeAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: NEON_GREEN },
  largeAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CARD_BG,
    borderWidth: 3,
    borderColor: NEON_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarInitial: { fontSize: 40, fontWeight: 'bold', color: NEON_GREEN },
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 20 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  profileEmail: { fontSize: 14, color: '#AAA', textAlign: 'center', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginBottom: 20 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: NEON_GREEN },
  statLabel: { fontSize: 12, color: '#AAA', marginTop: 2 },
  editBtn: {
    flexDirection: 'row',
    backgroundColor: NEON_GREEN,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  inputLabel: { color: '#FFF', fontWeight: '600', marginBottom: 8, marginTop: 5 },
  input: {
    backgroundColor: '#000',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  buttonsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#333' },
  cancelBtnText: { color: '#FFF', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#34C759' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
  logoutBtn: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 15 },
});
