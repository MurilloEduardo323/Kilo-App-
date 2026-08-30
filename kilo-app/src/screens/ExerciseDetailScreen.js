import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { LineChart } from 'react-native-chart-kit';
import { storageService } from '../services/storage';
import { COLORS } from '../theme';

const screenWidth = Dimensions.get('window').width;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function ExerciseDetailScreen({ exercise, allCategoryExercises, onFinishExercise, onBack }) {
  const TOTAL_SETS = 4;
  const [currentSet, setCurrentSet] = useState(1);
  const [isSetRunning, setIsSetRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  
  const [restTime, setRestTime] = useState(60); 
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isFinished, setIsFinished] = useState(false);

  // Registro de Peso / Repetições
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Modal de Evolução e Filtros
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('mes'); // 'semana' | 'mes' | 'ano'
  const [filteredLogs, setFilteredLogs] = useState([]);

  const notificationIdRef = useRef(null);

  useEffect(() => {
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão para notificações não foi concedida');
      }

      await Notifications.setNotificationCategoryAsync('set_running', [
        { identifier: 'FINISH_SET', buttonTitle: '⏹️ Finalizar Série', options: { isAuthenticationRequired: false } },
      ]);
      await Notifications.setNotificationCategoryAsync('resting', [
        { identifier: 'SKIP_REST', buttonTitle: '⏩ Pular Descanso', options: { isAuthenticationRequired: false } },
      ]);
      await Notifications.setNotificationCategoryAsync('set_ready', [
        { identifier: 'START_SET', buttonTitle: '▶️ Começar Série', options: { isAuthenticationRequired: false } },
      ]);
    }

    setupNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const action = response.actionIdentifier;
      if (action === 'START_SET') handleStartSet();
      else if (action === 'FINISH_SET') handleFinishSet();
      else if (action === 'SKIP_REST') handleSkipRest();
    });

    return () => subscription.remove();
  }, [currentSet, isSetRunning, isResting, restTime]);

  const showStateNotification = async (type, bodyText) => {
    try {
      await cancelRestNotification();
      let categoryId = 'set_ready';
      let title = `🏋️ ${exercise.name} (Série ${currentSet}/${TOTAL_SETS})`;

      if (type === 'running') {
        categoryId = 'set_running';
        title = `🔥 Executando Série ${currentSet}/${TOTAL_SETS}`;
      } else if (type === 'resting') {
        categoryId = 'resting';
        title = `⏳ Descanso: ${exercise.name}`;
      }

      notificationIdRef.current = await Notifications.scheduleNotificationAsync({
        content: { title, body: bodyText, categoryIdentifier: categoryId },
        trigger: null,
      });
    } catch (e) {
      console.log('Erro na notificação:', e);
    }
  };

  const cancelRestNotification = async () => {
    if (notificationIdRef.current) {
      await Notifications.dismissNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    await Notifications.dismissAllNotificationsAsync();
  };

  useEffect(() => {
    let interval = null;
    if (isResting && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (isResting && timerSeconds === 0) {
      clearInterval(interval);
      setIsResting(false);

      if (currentSet < TOTAL_SETS) {
        const nextSet = currentSet + 1;
        setCurrentSet(nextSet);
        showStateNotification('ready', `Descanso finalizado! Toque para começar a ${nextSet}ª série.`);
      } else {
        setIsFinished(true);
        cancelRestNotification();
      }
    }
    return () => clearInterval(interval);
  }, [isResting, timerSeconds, currentSet]);

  const handleStartSet = () => {
    setIsSetRunning(true);
    showStateNotification('running', `Série ${currentSet} em andamento.`);
  };

  const handleFinishSet = () => {
    setIsSetRunning(false);
    if (currentSet <= TOTAL_SETS) {
      setTimerSeconds(restTime);
      setIsResting(true);
      showStateNotification('resting', `Tempo de descanso: ${restTime}s.`);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    if (currentSet < TOTAL_SETS) {
      const nextSet = currentSet + 1;
      setCurrentSet(nextSet);
      showStateNotification('ready', `Pronto para a ${nextSet}ª série!`);
    } else {
      setIsFinished(true);
      cancelRestNotification();
    }
  };

  // Carrega histórico filtrado
  const fetchEvolutionData = async (period) => {
    const logs = await storageService.getFilteredHistoryForExercise(exercise.id, period);
    // Ordena por data (mais antigo -> mais recente) para plotar no gráfico
    const sortedLogs = logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredLogs(sortedLogs);
  };

  const handleOpenEvolution = async () => {
    await fetchEvolutionData(selectedPeriod);
    setShowEvolutionModal(true);
  };

  const handleSelectPeriod = async (period) => {
    setSelectedPeriod(period);
    await fetchEvolutionData(period);
  };

  const handleSaveWorkout = async () => {
    if (!weight || !reps) {
      Alert.alert('Atenção', 'Informe o peso e a quantidade de repetições.');
      return;
    }

    const res = await storageService.saveExerciseLog(exercise.id, weight, reps);
    if (res.success) {
      setIsSaved(true);
      Alert.alert('Sucesso', 'Registro salvo no seu histórico!');
    }
  };

  const nextExercise = allCategoryExercises.find(ex => ex.id === exercise.recommendedNext) || allCategoryExercises[0];

  // Preparação dos dados do Gráfico
  const getChartData = () => {
    if (filteredLogs.length === 0) return null;

    const labels = filteredLogs.map((log) => {
      const d = new Date(log.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const weightData = filteredLogs.map((log) => log.weight);

    return {
      labels: labels.slice(-6), // Exibe até os 6 últimos pontos no eixo X para não amontoar
      datasets: [
        {
          data: weightData.slice(-6),
          color: (opacity = 1) => `rgba(199, 255, 63, ${opacity})`, // Linha de destaque para Peso
          strokeWidth: 3,
        },
      ],
    };
  };

  const chartData = getChartData();

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          onPress={() => {
            cancelRestNotification();
            onBack();
          }} 
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpenEvolution} style={styles.evolutionBtn}>
          <Text style={styles.evolutionBtnText}>📊 Evolução</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.subtitle}>Série {currentSet} de {TOTAL_SETS}</Text>

      {!isFinished ? (
        <View style={styles.card}>
          {isResting ? (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Tempo de Descanso</Text>
              <Text style={styles.timerText}>{timerSeconds}s</Text>
              
              <View style={styles.adjustRestRow}>
                <TouchableOpacity onPress={() => setRestTime(Math.max(15, restTime - 15))} style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>-15s</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRestTime(restTime + 15)} style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>+15s</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipRest}>
                <Text style={styles.buttonText}>Pular Descanso ⏩</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionContainer}>
              {!isSetRunning ? (
                <TouchableOpacity style={styles.primaryButton} onPress={handleStartSet}>
                  <Text style={styles.buttonText}>Começar {currentSet}ª Série</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.finishSetButton} onPress={handleFinishSet}>
                  <Text style={styles.buttonText}>Finalizar {currentSet}ª Série</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.finishedCard}>
          <Text style={styles.finishedTitle}>🎉 Exercício Concluído!</Text>
          
          {!isSaved ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Registre sua carga de hoje:</Text>
              <View style={styles.inputsRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Peso (kg)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Reps/série"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={reps}
                  onChangeText={setReps}
                />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWorkout}>
                <Text style={styles.saveBtnText}>💾 Salvar Carga e Reps</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.savedMessage}>✅ Carga de {weight}kg ({reps} reps) registrada!</Text>
          )}

          <Text style={styles.recommendationTitle}>Próximo exercício sugerido:</Text>
          <TouchableOpacity 
            style={styles.recommendedButton}
            onPress={() => {
              cancelRestNotification();
              onFinishExercise(nextExercise);
            }}
          >
            <Text style={styles.recommendedBtnText}>Ir para: {nextExercise.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              cancelRestNotification();
              onFinishExercise(null);
            }}
          >
            <Text style={styles.buttonText}>Escolher Outro Exercício</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL DE EVOLUÇÃO COM GRÁFICO E FILTROS */}
      <Modal visible={showEvolutionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📊 Gráfico de Evolução</Text>
            <Text style={styles.modalSubTitle}>{exercise.name}</Text>

            {/* Filtros: Semana / Mês / Ano */}
            <View style={styles.filterRow}>
              {['semana', 'mes', 'ano'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.filterTab,
                    selectedPeriod === period && styles.filterTabActive,
                  ]}
                  onPress={() => handleSelectPeriod(period)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      selectedPeriod === period && styles.filterTabTextActive,
                    ]}
                  >
                    {period.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* GRÁFICO */}
            {chartData ? (
              <View style={styles.chartContainer}>
                <Text style={styles.chartLabel}>Evolução da Carga (kg)</Text>
                <LineChart
                  data={chartData}
                  width={screenWidth - 70}
                  height={180}
                  yAxisSuffix="kg"
                  chartConfig={{
                    backgroundColor: CARD_BG,
                    backgroundGradientFrom: CARD_BG,
                    backgroundGradientTo: '#1E1E1E',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(199, 255, 63, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
                    style: { borderRadius: 12 },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: NEON_GREEN,
                    },
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 12 }}
                />
              </View>
            ) : (
              <Text style={styles.emptyText}>Sem dados suficientes para este período.</Text>
            )}

            {/* HISTÓRICO EM LISTA */}
            <FlatList
              data={[...filteredLogs].reverse()} // Exibe os mais recentes no topo da lista
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 150 }}
              renderItem={({ item }) => {
                const dateObj = new Date(item.date);
                const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')} - ${dateObj.getHours()}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                return (
                  <View style={styles.logCard}>
                    <Text style={styles.logDate}>{formattedDate}</Text>
                    <Text style={styles.logDetails}>🏋️ {item.weight} kg  |  🔄 {item.reps} reps/série</Text>
                  </View>
                );
              }}
            />

            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setShowEvolutionModal(false)}
            >
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { accent: NEON_GREEN, bg: DARK_BG, surface: CARD_BG, border: BORDER_COLOR } = COLORS;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: DARK_BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  backButton: { paddingVertical: 5 },
  backText: { color: NEON_GREEN, fontSize: 16, fontWeight: 'bold' },
  evolutionBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: NEON_GREEN },
  evolutionBtnText: { color: NEON_GREEN, fontSize: 14, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#AAA', textAlign: 'center', marginBottom: 25 },
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR },
  timerContainer: { alignItems: 'center', width: '100%' },
  timerLabel: { color: '#AAA', fontSize: 16 },
  timerText: { fontSize: 54, fontWeight: 'bold', color: '#FF9500', marginVertical: 15 },
  adjustRestRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  smallBtn: { backgroundColor: '#333', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  smallBtnText: { color: '#FFF', fontWeight: 'bold' },
  actionContainer: { width: '100%' },
  primaryButton: { backgroundColor: '#34C759', padding: 18, borderRadius: 12, alignItems: 'center' },
  finishSetButton: { backgroundColor: '#FF3B30', padding: 18, borderRadius: 12, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#333', padding: 15, borderRadius: 12, alignItems: 'center', width: '100%', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  finishedCard: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR },
  finishedTitle: { fontSize: 22, fontWeight: 'bold', color: NEON_GREEN, marginBottom: 15 },
  inputContainer: { width: '100%', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 20 },
  inputLabel: { color: '#FFF', fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  inputsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#000', color: '#FFF', borderRadius: 8, padding: 12, textAlign: 'center', fontSize: 16, borderWidth: 1, borderColor: BORDER_COLOR },
  saveBtn: { backgroundColor: '#34C759', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  savedMessage: { color: NEON_GREEN, fontWeight: 'bold', fontSize: 16, marginBottom: 20 },
  recommendationTitle: { color: '#AAA', fontSize: 14, marginBottom: 8 },
  recommendedButton: { backgroundColor: NEON_GREEN, padding: 16, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 10 },
  recommendedBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  
  // Estilos do Modal e Gráfico
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 15 },
  modalContent: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, width: '100%', maxHeight: '90%', borderWidth: 1, borderColor: BORDER_COLOR },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: NEON_GREEN, textAlign: 'center' },
  modalSubTitle: { fontSize: 16, color: '#AAA', textAlign: 'center', marginBottom: 15 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 15 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E1E1E' },
  filterTabActive: { backgroundColor: NEON_GREEN },
  filterTabText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  filterTabTextActive: { color: '#000' },
  chartContainer: { alignItems: 'center', marginVertical: 5 },
  chartLabel: { color: '#AAA', fontSize: 12, marginBottom: 5 },
  emptyText: { color: '#888', textAlign: 'center', marginVertical: 30, fontSize: 14 },
  logCard: { backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8, marginBottom: 8 },
  logDate: { color: '#AAA', fontSize: 11, marginBottom: 2 },
  logDetails: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  closeModalBtn: { backgroundColor: '#FF3B30', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  closeModalText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});