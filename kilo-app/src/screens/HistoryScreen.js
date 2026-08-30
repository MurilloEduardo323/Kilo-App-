import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storageService } from '../services/storage';
import { EXERCISES } from '../data/exercises';
import { COLORS } from '../theme';

const screenWidth = Dimensions.get('window').width;

const SEGMENTS = [
  { id: 'peso', label: 'Peso', icon: 'scale-bathroom' },
  { id: 'treinos', label: 'Treinos', icon: 'dumbbell' },
  { id: 'refeicoes', label: 'Refeições', icon: 'silverware-fork-knife' },
];

const PERIODS = ['semana', 'mes', 'ano', 'tudo'];

const MEAL_LABELS = {
  cafe: '☀️ Café da Manhã',
  almoco: '🍛 Almoço',
  lanche: '🍎 Lanche da Tarde',
  jantar: '🌙 Jantar',
  ceia: '🌌 Ceia',
  outros: '🍴 Outros',
};

// Filtra uma lista de itens com campo .date pelo período selecionado
const filterByPeriod = (items, period) => {
  const now = new Date();
  return items.filter((item) => {
    const d = new Date(item.date);
    if (period === 'semana') {
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }
    if (period === 'mes') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (period === 'ano') {
      return d.getFullYear() === now.getFullYear();
    }
    return true; // 'tudo'
  });
};

// Agrupa itens por dia (yyyy-mm-dd), do mais recente para o mais antigo
const groupByDay = (items) => {
  const groups = {};
  items.forEach((item) => {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, dayItems]) => ({ key, items: dayItems }));
};

const formatDayLabel = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  if (isSameDay(date, today)) return 'Hoje';
  if (isSameDay(date, yesterday)) return 'Ontem';

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Título de cartão com ícone vetorial (mesmo padrão usado em Calorias)
const CardTitle = ({ icon, children }) => (
  <View style={styles.cardTitleRow}>
    <View style={styles.cardTitleIconWrap}>
      <MaterialCommunityIcons name={icon} size={15} color={COLORS.bg} />
    </View>
    <Text style={styles.cardTitle}>{children}</Text>
  </View>
);

export default function HistoryScreen({ isActive }) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState('peso');
  const [period, setPeriod] = useState('mes');

  const [weightHistory, setWeightHistory] = useState([]);
  const [weightInput, setWeightInput] = useState('');

  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseNameMap, setExerciseNameMap] = useState({});

  const [foodLog, setFoodLog] = useState([]);

  const [expandedDay, setExpandedDay] = useState(null);

  const loadAll = useCallback(async () => {
    const [weights, workouts, foods, customExercises] = await Promise.all([
      storageService.getWeightHistory(),
      storageService.getWorkoutHistory(),
      storageService.getFoodLog(),
      storageService.getCustomExercises(),
    ]);

    setWeightHistory(weights);
    setWorkoutHistory(workouts);
    setFoodLog(foods);

    const source = customExercises || EXERCISES;
    const nameMap = {};
    Object.values(source)
      .flat()
      .forEach((ex) => {
        nameMap[ex.id] = ex.name;
      });
    setExerciseNameMap(nameMap);
  }, []);

  useEffect(() => {
    (async () => {
      await loadAll();
      setIsLoading(false);
    })();
  }, [loadAll]);

  // Refresh ao focar a aba (fica sempre montada)
  useEffect(() => {
    if (!isActive || isLoading) return;
    loadAll();
  }, [isActive]);

  // --- AÇÕES: PESO ---
  const handleAddWeight = async () => {
    if (!weightInput.trim() || isNaN(parseFloat(weightInput))) {
      Alert.alert('Atenção', 'Informe um peso válido.');
      return;
    }
    await storageService.addWeightEntry(weightInput.trim());
    setWeightInput('');
    const updated = await storageService.getWeightHistory();
    setWeightHistory(updated);
  };

  const handleDeleteWeight = async (id) => {
    await storageService.deleteWeightEntry(id);
    const updated = await storageService.getWeightHistory();
    setWeightHistory(updated);
  };

  // --- DADOS DERIVADOS ---
  const filteredWeights = filterByPeriod(weightHistory, period)
    .slice()
    .reverse(); // ordem cronológica para o gráfico

  const weightChartData =
    filteredWeights.length >= 2
      ? {
          labels: filteredWeights.slice(-6).map((entry) => {
            const d = new Date(entry.date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }),
          datasets: [
            {
              data: filteredWeights.slice(-6).map((entry) => entry.weight),
              color: (opacity = 1) => `rgba(199, 255, 63, ${opacity})`,
              strokeWidth: 3,
            },
          ],
        }
      : null;

  const filteredWorkouts = filterByPeriod(workoutHistory, period);
  const workoutsByDay = groupByDay(filteredWorkouts);

  const filteredFood = filterByPeriod(foodLog, period);
  const foodByDay = groupByDay(filteredFood);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={NEON_GREEN} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.screenTitle}>Histórico</Text>

      {/* Seletor de segmento */}
      <View style={styles.segmentRow}>
        {SEGMENTS.map((seg) => (
          <TouchableOpacity
            key={seg.id}
            style={[styles.segmentBtn, activeSegment === seg.id && styles.segmentBtnActive]}
            onPress={() => {
              setActiveSegment(seg.id);
              setExpandedDay(null);
            }}
          >
            <MaterialCommunityIcons
              name={seg.icon}
              size={16}
              color={activeSegment === seg.id ? COLORS.bg : COLORS.textMuted}
              style={{ marginBottom: 2 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeSegment === seg.id && styles.segmentTextActive,
              ]}
            >
              {seg.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtro de período */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodPill, period === p && styles.periodPillActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- SEGMENTO: PESO --- */}
      {activeSegment === 'peso' && (
        <View style={styles.card}>
          <CardTitle icon="scale-bathroom">Peso Corporal</CardTitle>

          <View style={styles.inputsRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Peso de hoje (kg)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={weightInput}
              onChangeText={setWeightInput}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddWeight}>
              <Text style={styles.addBtnText}>Registrar</Text>
            </TouchableOpacity>
          </View>

          {weightChartData ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={weightChartData}
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
                  propsForDots: { r: '5', strokeWidth: '2', stroke: NEON_GREEN },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 12 }}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Registre pelo menos 2 pesagens neste período para ver o gráfico.
            </Text>
          )}

          {filteredWeights.length > 0 ? (
            filteredWeights
              .slice()
              .reverse()
              .map((entry) => {
                const d = new Date(entry.date);
                return (
                  <View key={entry.id} style={styles.listRow}>
                    <Text style={styles.listRowDate}>
                      {d.toLocaleDateString('pt-BR')} · {d.getHours()}:
                      {d.getMinutes().toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.listRowValue}>{entry.weight} kg</Text>
                    <TouchableOpacity onPress={() => handleDeleteWeight(entry.id)}>
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
          ) : (
            <Text style={styles.emptyText}>Nenhuma pesagem registrada neste período.</Text>
          )}
        </View>
      )}

      {/* --- SEGMENTO: TREINOS --- */}
      {activeSegment === 'treinos' && (
        <View style={styles.card}>
          <CardTitle icon="dumbbell">Histórico de Treinos</CardTitle>

          {workoutsByDay.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum treino registrado neste período.</Text>
          ) : (
            workoutsByDay.map((day) => {
              const isExpanded = expandedDay === day.key;
              const uniqueExercises = new Set(day.items.map((i) => i.exerciseId)).size;

              // Agrupa séries por exercício dentro do dia
              const byExercise = {};
              day.items.forEach((item) => {
                if (!byExercise[item.exerciseId]) byExercise[item.exerciseId] = [];
                byExercise[item.exerciseId].push(item);
              });

              return (
                <View key={day.key} style={styles.daySection}>
                  <TouchableOpacity
                    style={styles.dayHeader}
                    onPress={() => setExpandedDay(isExpanded ? null : day.key)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text style={styles.dayLabel}>{formatDayLabel(day.key)}</Text>
                      <Text style={styles.daySubLabel}>
                        {uniqueExercises} exercício{uniqueExercises === 1 ? '' : 's'} ·{' '}
                        {day.items.length} série{day.items.length === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <Text style={styles.dayChevron}>{isExpanded ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.dayBody}>
                      {Object.entries(byExercise).map(([exerciseId, sets]) => (
                        <View key={exerciseId} style={styles.exerciseBlock}>
                          <Text style={styles.exerciseBlockName}>
                            {exerciseNameMap[exerciseId] || 'Exercício removido'}
                          </Text>
                          {sets.map((set) => (
                            <Text key={set.id} style={styles.exerciseSetLine}>
                              🔸 {set.weight}kg × {set.reps} reps
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* --- SEGMENTO: REFEIÇÕES --- */}
      {activeSegment === 'refeicoes' && (
        <View style={[styles.card, { marginBottom: 30 }]}>
          <CardTitle icon="silverware-fork-knife">Histórico de Refeições</CardTitle>

          {foodByDay.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma refeição registrada neste período.</Text>
          ) : (
            foodByDay.map((day) => {
              const isExpanded = expandedDay === day.key;
              const totalKcal = day.items.reduce((sum, i) => sum + i.calories, 0);

              const byMeal = {};
              day.items.forEach((item) => {
                const mealId = item.meal || 'outros';
                if (!byMeal[mealId]) byMeal[mealId] = [];
                byMeal[mealId].push(item);
              });

              return (
                <View key={day.key} style={styles.daySection}>
                  <TouchableOpacity
                    style={styles.dayHeader}
                    onPress={() => setExpandedDay(isExpanded ? null : day.key)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text style={styles.dayLabel}>{formatDayLabel(day.key)}</Text>
                      <Text style={styles.daySubLabel}>
                        {day.items.length} item{day.items.length === 1 ? '' : 's'} ·{' '}
                        {Math.round(totalKcal)} kcal
                      </Text>
                    </View>
                    <Text style={styles.dayChevron}>{isExpanded ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.dayBody}>
                      {Object.entries(byMeal).map(([mealId, items]) => (
                        <View key={mealId} style={styles.exerciseBlock}>
                          <Text style={styles.exerciseBlockName}>
                            {MEAL_LABELS[mealId] || MEAL_LABELS.outros}
                          </Text>
                          {items.map((item) => (
                            <Text key={item.id} style={styles.exerciseSetLine}>
                              🔸 {item.name} — {item.calories} kcal
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const { accent: NEON_GREEN, bg: DARK_BG, surface: CARD_BG, border: BORDER_COLOR } = COLORS;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG, padding: 20 },
  loadingContainer: { flex: 1, backgroundColor: DARK_BG, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: '#FFF', textAlign: 'center', marginTop: 10, marginBottom: 16 },

  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  segmentBtn: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  segmentBtnActive: { backgroundColor: NEON_GREEN, borderColor: NEON_GREEN },
  segmentText: { color: '#AAA', fontSize: 11, fontWeight: '600' },
  segmentTextActive: { color: '#000' },

  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  periodPillActive: { backgroundColor: NEON_GREEN, borderColor: NEON_GREEN },
  periodText: { color: '#888', fontSize: 11, fontWeight: 'bold' },
  periodTextActive: { color: '#000' },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 16,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: NEON_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  inputsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  input: {
    backgroundColor: '#000',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  addBtn: {
    backgroundColor: NEON_GREEN,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },

  chartContainer: { alignItems: 'center', marginBottom: 10 },
  emptyText: { color: '#888', textAlign: 'center', marginVertical: 20, fontSize: 13 },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  listRowDate: { color: '#AAA', fontSize: 12, flex: 1 },
  listRowValue: { color: NEON_GREEN, fontWeight: 'bold', fontSize: 13, marginRight: 12 },
  deleteText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },

  daySection: { borderTopWidth: 1, borderTopColor: BORDER_COLOR, paddingVertical: 12 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 15, textTransform: 'capitalize' },
  daySubLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  dayChevron: { color: NEON_GREEN, fontSize: 12 },
  dayBody: { marginTop: 12 },

  exerciseBlock: { marginBottom: 12 },
  exerciseBlockName: { color: NEON_GREEN, fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  exerciseSetLine: { color: '#CCC', fontSize: 13, marginLeft: 8, marginBottom: 2 },
});
