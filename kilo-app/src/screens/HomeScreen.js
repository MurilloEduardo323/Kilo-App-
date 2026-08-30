import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MUSCLE_GROUPS, EXERCISES } from '../data/exercises';
import ExerciseDetailScreen from './ExerciseDetailScreen';
import { storageService } from '../services/storage';
import { COLORS } from '../theme';

// Mapeamento padrão de GIFs para os exercícios do sistema
const EXERCISE_GIFS = {
  // --- PEITO ---
  'supino reto': 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-reto.gif',
  'supino inclinado': 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-barra.gif',
  'crucifixo': 'https://www.mundoboaforma.com.br/wp-content/uploads/2019/11/03081301-crucifixo-com-halteres.gif',
  'crossover': 'https://i0.wp.com/meutreinador.com/wp-content/uploads/2024/04/Crossover-polia-alta.gif?fit=1080%2C1080&ssl=1',

  // --- COSTAS ---
  'puxada alta': 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-puxada-aberta-com-barra-no-pulley.gif',
  'remada curvada': 'https://i.pinimg.com/originals/c6/f7/47/c6f7479b3c35d406e71e8575e7df528d.gif',
  'remada baixa': 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/09/remada-sentado-com-cabos-e-triangulo-para-costas.gif',
  'pulldown': 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/09/pulldown-corda.gif',

  // --- OMBROS ---
  'desenvolvimento': 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/desenvolvimento-para-ombros-com-halteres.gif',
  'elevação lateral': 'https://treinoemalta.com.br/wp-content/uploads/2023/07/Elevacao-Lateral-com-Halteres.gif',
  'elevação frontal': 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/09/elevacao-frontal-com-anilha-v2.gif',
  'crucifixo inverso': 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/03/lever-seated-reverse-fly-parallel-grip.gif',

  // --- BRAÇOS (BÍCEPS / TRÍCEPS) ---
  'rosca direta': 'https://www.mundoboaforma.com.br/wp-content/uploads/2022/09/rosca-biceps-direta-com-halteres.gif',
  'tríceps testa': 'https://www.hipertrofia.org/blog/wp-content/uploads/2025/01/rosca-testa-com-barra2.gif',
  'rosca martelo': 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/04/dumbbell-hammer-curl-v-2.gif',
  'tríceps corda': 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-puxada-no-pulley-com-corda.gif',

  // --- PERNAS ---
  'agachamento': 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/01/barbell-low-bar-squat.gif',
  'leg press': 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/pernas-leg-press-45-com-pes-distantes.gif',
  'extensora': 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/11/lever-leg-extension.gif',
  'flexora': 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/09/cadeira-flexora.gif',

  // --- ABDÔMEN ---
  'infra': 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/abdominal-infra-solo2.gif',
  'supra': 'https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/abdominal-reto.gif',
  'prancha': 'https://i.pinimg.com/736x/b5/14/49/b51449a70b867a88c43146f85f34a224.jpg',
};

const getGifUrl = (exercise) => {
  if (exercise.imageUrl) return exercise.imageUrl;

  const exerciseNameLower = exercise.name.toLowerCase();
  for (const [key, url] of Object.entries(EXERCISE_GIFS)) {
    if (exerciseNameLower.includes(key)) {
      return url;
    }
  }
  return null;
};

export default function HomeScreen({ user, onLogout }) {
  // Estado de carregamento inicial (aguarda ler perfil/exercícios salvos)
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estado do Perfil
  const [profile, setProfile] = useState({
    name: user?.name || 'Atleta',
    email: user?.email || 'atleta@email.com',
    avatarUrl: user?.avatarUrl || '',
  });

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Lista dinâmica de exercícios
  const [customExercises, setCustomExercises] = useState(EXERCISES);

  // Carrega perfil e exercícios customizados salvos localmente ao abrir a tela
  useEffect(() => {
    const loadPersistedData = async () => {
      const [savedProfile, savedExercises] = await Promise.all([
        storageService.getProfile(),
        storageService.getCustomExercises(),
      ]);

      if (savedProfile) {
        setProfile(savedProfile);
      }
      if (savedExercises) {
        setCustomExercises(savedExercises);
      }
      setIsLoadingData(false);
    };

    loadPersistedData();
  }, []);

  // Modais de Exercício
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [inputExName, setInputExName] = useState('');
  const [inputExImageUrl, setInputExImageUrl] = useState('');

  // --- AÇÕES DE EXERCÍCIOS ---
  const handleOpenAddExerciseModal = () => {
    setEditingExercise(null);
    setInputExName('');
    setInputExImageUrl('');
    setIsExerciseModalVisible(true);
  };

  const handleOpenEditExerciseModal = (exercise) => {
    setEditingExercise(exercise);
    setInputExName(exercise.name);
    setInputExImageUrl(getGifUrl(exercise) || '');
    setIsExerciseModalVisible(true);
  };

  const handleSaveExercise = () => {
    if (!inputExName.trim()) {
      Alert.alert('Atenção', 'Digite o nome do exercício.');
      return;
    }

    const groupId = selectedGroup.id;
    const currentList = customExercises[groupId] || [];

    let updatedExercises;

    if (editingExercise) {
      const updatedList = currentList.map((ex) =>
        ex.id === editingExercise.id
          ? { ...ex, name: inputExName.trim(), imageUrl: inputExImageUrl.trim() }
          : ex
      );
      updatedExercises = { ...customExercises, [groupId]: updatedList };
    } else {
      const newExercise = {
        id: `custom_${Date.now()}`,
        name: inputExName.trim(),
        imageUrl: inputExImageUrl.trim() || null,
      };
      updatedExercises = {
        ...customExercises,
        [groupId]: [...currentList, newExercise],
      };
    }

    setCustomExercises(updatedExercises);
    storageService.saveCustomExercises(updatedExercises);

    setIsExerciseModalVisible(false);
  };

  // Aguarda carregar perfil/exercícios salvos antes de renderizar
  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={NEON_GREEN} />
      </View>
    );
  }

  // Tela de execução
  if (selectedExercise) {
    return (
      <ExerciseDetailScreen
        exercise={selectedExercise}
        allCategoryExercises={customExercises[selectedGroup.id]}
        onBack={() => setSelectedExercise(null)}
        onFinishExercise={(nextEx) => {
          setSelectedExercise(nextEx);
        }}
      />
    );
  }

  // Lista de exercícios de um grupo
  if (selectedGroup) {
    const groupExercises = customExercises[selectedGroup.id] || [];

    return (
      <View style={styles.container}>
        <View style={styles.exerciseHeaderRow}>
          <TouchableOpacity onPress={() => setSelectedGroup(null)}>
            <Text style={styles.backText}>← Voltar aos Grupos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenAddExerciseModal}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>
          {selectedGroup.icon} Exercícios de {selectedGroup.name}
        </Text>

        <FlatList
          key="lista-exercicios"
          data={groupExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const imageUrl = getGifUrl(item);

            return (
              <TouchableOpacity
                style={styles.exerciseCard}
                onPress={() => setSelectedExercise(item)}
                activeOpacity={0.7}
              >
                {imageUrl && (
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.exerciseGif}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.exerciseName}>{item.name}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => handleOpenEditExerciseModal(item)}
                      style={styles.editBtn}
                    >
                      <Text style={styles.editText}>✏️ Editar</Text>
                    </TouchableOpacity>

                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Modal Criar/Editar Exercício */}
        <Modal
          visible={isExerciseModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsExerciseModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
              </Text>

              <Text style={styles.inputLabel}>Nome do Exercício:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Supino Inclinado na Máquina"
                placeholderTextColor="#555"
                value={inputExName}
                onChangeText={setInputExName}
              />

              <Text style={styles.inputLabel}>URL da Imagem / GIF (opcional):</Text>
              <TextInput
                style={styles.input}
                placeholder="https://exemplo.com/imagem.gif"
                placeholderTextColor="#555"
                value={inputExImageUrl}
                onChangeText={setInputExImageUrl}
                autoCapitalize="none"
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setIsExerciseModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSaveExercise}
                >
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // TELA INICIAL: Seleção dos Grupos Musculares
  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.topRow}>
        <View style={styles.profileHeaderBtn}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarHeader} />
          ) : (
            <View style={styles.avatarPlaceholderHeader}>
              <Text style={styles.avatarInitialText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.welcomeText}>Olá, {profile.name} 👋</Text>
            <Text style={styles.profileSubText}>Bora treinar?</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Qual membro vamos treinar hoje?</Text>

      <FlatList
        key="grid-grupos"
        data={MUSCLE_GROUPS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() => setSelectedGroup(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.groupIcon}>{item.icon}</Text>
            <Text style={styles.groupName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const { accent: NEON_GREEN, bg: DARK_BG, surface: CARD_BG, border: BORDER_COLOR } = COLORS;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG, padding: 20 },
  loadingContainer: { flex: 1, backgroundColor: DARK_BG, justifyContent: 'center', alignItems: 'center' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  profileHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarHeader: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    borderWidth: 2, 
    borderColor: NEON_GREEN 
  },
  avatarPlaceholderHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: NEON_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialText: { color: NEON_GREEN, fontSize: 18, fontWeight: 'bold' },
  welcomeText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profileSubText: { color: NEON_GREEN, fontSize: 12, fontWeight: '600' },
  logoutBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#333' },
  logoutText: { color: '#FF4D4D', fontWeight: 'bold' },
  sectionTitle: { color: '#888', fontSize: 16, marginBottom: 20 },
  groupCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    margin: 8,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  groupIcon: { fontSize: 36, marginBottom: 10 },
  groupName: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  /* Topo Lista Exercícios */
  exerciseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  backText: { color: NEON_GREEN, fontSize: 16, fontWeight: 'bold' },
  addButton: {
    backgroundColor: NEON_GREEN,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#000', fontSize: 24, fontWeight: 'bold', marginTop: -2 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },

  /* Card de Exercício */
  exerciseCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseGif: { width: '100%', height: '100%' },
  cardFooter: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: { color: '#FFF', fontSize: 15, fontWeight: '600', flex: 1 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editBtn: { backgroundColor: '#1E1E1E', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#333' },
  editText: { color: '#AAA', fontSize: 12 },
  arrowText: { color: NEON_GREEN, fontSize: 18, fontWeight: 'bold' },

  /* Estilos do Modal Padrão */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  modalTitle: { color: NEON_GREEN, fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  inputLabel: { color: '#AAA', fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: '#000',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#222' },
  cancelBtnText: { color: '#FFF', fontWeight: 'bold' },
  saveBtn: { backgroundColor: NEON_GREEN },
  saveBtnText: { color: '#000', fontWeight: 'bold' },

  /* Estilos Específicos do Modal de Perfil */
  profileModalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeModalText: { color: '#888', fontSize: 20, fontWeight: 'bold' },
  avatarCenterContainer: { alignItems: 'center', marginVertical: 15 },
  largeAvatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: NEON_GREEN },
  largeAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: NEON_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarInitial: { color: NEON_GREEN, fontSize: 36, fontWeight: 'bold' },
  viewProfileInfo: { alignItems: 'center' },
  profileInfoName: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  profileInfoEmail: { color: '#888', fontSize: 14, marginBottom: 20 },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  statValue: { color: NEON_GREEN, fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  editProfileBtn: {
    backgroundColor: NEON_GREEN,
    width: '100%',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editProfileBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  editProfileForm: { marginTop: 10 },
});