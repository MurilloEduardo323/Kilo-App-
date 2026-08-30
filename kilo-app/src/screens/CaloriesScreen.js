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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storageService } from '../services/storage';
import { searchFoods } from '../data/foods';
import { COLORS } from '../theme';

// MET médio para treino de musculação (intensidade moderada/vigorosa)
const WEIGHT_TRAINING_MET = 5;
// Estimativa de minutos por série (execução + descanso)
const MINUTES_PER_SET = 3;

const ACTIVITY_LEVELS = [
  { id: 'sedentario', label: 'Sedentário', multiplier: 1.2 },
  { id: 'leve', label: 'Leve (1-3x/sem)', multiplier: 1.375 },
  { id: 'moderado', label: 'Moderado (3-5x/sem)', multiplier: 1.55 },
  { id: 'intenso', label: 'Intenso (6-7x/sem)', multiplier: 1.725 },
];

// Refeições padrão do dia
const MEALS = [
  { id: 'cafe', label: 'Café da Manhã', icon: '☀️' },
  { id: 'almoco', label: 'Almoço', icon: '🍛' },
  { id: 'lanche', label: 'Lanche da Tarde', icon: '🍎' },
  { id: 'jantar', label: 'Jantar', icon: '🌙' },
  { id: 'ceia', label: 'Ceia', icon: '🌌' },
];

const emptyDraft = () => ({
  name: '',
  quantity: '100',
  calories: '',
  carbs: '',
  protein: '',
  fat: '',
  selectedFood: null, // referência ao alimento da base (valores por 100g)
});

const emptyMealInputs = () =>
  MEALS.reduce((acc, meal) => {
    acc[meal.id] = emptyDraft();
    return acc;
  }, {});

// Escala os valores por 100g para a quantidade informada
const scaleNutrition = (foodBase, quantity) => {
  const factor = (parseFloat(quantity) || 0) / 100;
  return {
    calories: Math.round(foodBase.calories * factor),
    carbs: +(foodBase.carbs * factor).toFixed(1),
    protein: +(foodBase.protein * factor).toFixed(1),
    fat: +(foodBase.fat * factor).toFixed(1),
  };
};

// Título de cartão com ícone vetorial (substitui o antigo emoji solto)
const CardTitle = ({ icon, children }) => (
  <View style={styles.cardTitleRow}>
    <View style={styles.cardTitleIconWrap}>
      <MaterialCommunityIcons name={icon} size={15} color={COLORS.bg} />
    </View>
    <Text style={styles.cardTitle}>{children}</Text>
  </View>
);

export default function CaloriesScreen({ isActive }) {
  const [isLoading, setIsLoading] = useState(true);

  // Dados corporais para cálculo da meta
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('masculino');
  const [activityLevel, setActivityLevel] = useState('leve');
  const [manualGoal, setManualGoal] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Consumo do dia, organizado por refeição
  const [todayFood, setTodayFood] = useState([]);
  const [expandedMeal, setExpandedMeal] = useState('cafe');
  const [mealInputs, setMealInputs] = useState(emptyMealInputs());

  // Gasto estimado no treino de hoje
  const [todaySets, setTodaySets] = useState(0);

  const loadAll = useCallback(async () => {
    const [settings, foodLog, setsCount] = await Promise.all([
      storageService.getCalorieSettings(),
      storageService.getTodayFoodLog(),
      storageService.getTodayWorkoutSetsCount(),
    ]);

    if (settings) {
      setWeight(settings.weight?.toString() || '');
      setHeight(settings.height?.toString() || '');
      setAge(settings.age?.toString() || '');
      setSex(settings.sex || 'masculino');
      setActivityLevel(settings.activityLevel || 'leve');
      setManualGoal(settings.manualGoal?.toString() || '');
    } else {
      setIsEditingGoal(true);
    }

    setTodayFood(foodLog);
    setTodaySets(setsCount);
  }, []);

  // Carga inicial
  useEffect(() => {
    (async () => {
      await loadAll();
      setIsLoading(false);
    })();
  }, [loadAll]);

  // Refresh ao voltar pra essa aba (a tela fica sempre montada, então isso
  // funciona como um "onFocus" pra trazer séries/refeições registradas
  // enquanto o usuário estava em outra aba)
  useEffect(() => {
    if (!isActive || isLoading) return;
    loadAll();
  }, [isActive]);

  // --- CÁLCULOS DA META ---
  const calculateTMB = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a) return null;

    // Fórmula de Mifflin-St Jeor
    const base = 10 * w + 6.25 * h - 5 * a;
    return sex === 'masculino' ? base + 5 : base - 161;
  };

  const tmb = calculateTMB();
  const activityMultiplier =
    ACTIVITY_LEVELS.find((l) => l.id === activityLevel)?.multiplier || 1.2;
  const tdee = tmb ? Math.round(tmb * activityMultiplier) : null;

  const dailyGoal = manualGoal ? parseInt(manualGoal, 10) : tdee;

  // --- TOTAIS DO DIA ---
  const consumedToday = todayFood.reduce((sum, item) => sum + item.calories, 0);
  const remaining = dailyGoal != null ? dailyGoal - consumedToday : null;
  const totalCarbs = todayFood.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalProtein = todayFood.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalFat = todayFood.reduce((sum, item) => sum + (item.fat || 0), 0);

  const trainingMinutesToday = todaySets * MINUTES_PER_SET;
  const bodyWeightForBurn = parseFloat(weight) || 70;
  const caloriesBurnedToday = Math.round(
    WEIGHT_TRAINING_MET * bodyWeightForBurn * (trainingMinutesToday / 60)
  );

  // Agrupa os alimentos de hoje por refeição
  const foodByMeal = MEALS.reduce((acc, meal) => {
    acc[meal.id] = todayFood.filter((item) => (item.meal || 'outros') === meal.id);
    return acc;
  }, {});
  const outrosFood = todayFood.filter(
    (item) => !MEALS.some((m) => m.id === (item.meal || 'outros'))
  );

  const mealTotal = (mealId) =>
    (foodByMeal[mealId] || []).reduce((sum, item) => sum + item.calories, 0);

  // --- AÇÕES DA META ---
  const handleSaveGoalSettings = async () => {
    if ((!weight || !height || !age) && !manualGoal) {
      Alert.alert(
        'Atenção',
        'Preencha peso, altura e idade para calcular automaticamente, ou defina uma meta manual.'
      );
      return;
    }
    const settings = {
      weight: parseFloat(weight) || null,
      height: parseFloat(height) || null,
      age: parseInt(age, 10) || null,
      sex,
      activityLevel,
      manualGoal: manualGoal ? parseInt(manualGoal, 10) : null,
    };
    await storageService.saveCalorieSettings(settings);
    setIsEditingGoal(false);
  };

  const handleToggleMeal = (mealId) => {
    setExpandedMeal((current) => (current === mealId ? null : mealId));
  };

  const updateDraft = (mealId, updates) => {
    setMealInputs((prev) => ({
      ...prev,
      [mealId]: { ...prev[mealId], ...updates },
    }));
  };

  // Usuário digitando o nome do alimento -> limpa seleção anterior (volta ao modo manual/busca)
  const handleNameChange = (mealId, text) => {
    updateDraft(mealId, {
      name: text,
      selectedFood: null,
      calories: '',
      carbs: '',
      protein: '',
      fat: '',
    });
  };

  // Usuário tocou numa sugestão da base de alimentos
  const handleSelectSuggestion = (mealId, food) => {
    const draft = mealInputs[mealId];
    const quantity = draft.quantity || '100';
    const scaled = scaleNutrition(food, quantity);
    updateDraft(mealId, {
      name: food.name,
      selectedFood: food,
      quantity,
      calories: scaled.calories.toString(),
      carbs: scaled.carbs.toString(),
      protein: scaled.protein.toString(),
      fat: scaled.fat.toString(),
    });
  };

  // Usuário mudou a quantidade -> recalcula automaticamente se veio da base
  const handleQuantityChange = (mealId, quantity) => {
    const draft = mealInputs[mealId];
    if (draft.selectedFood) {
      const scaled = scaleNutrition(draft.selectedFood, quantity);
      updateDraft(mealId, {
        quantity,
        calories: scaled.calories.toString(),
        carbs: scaled.carbs.toString(),
        protein: scaled.protein.toString(),
        fat: scaled.fat.toString(),
      });
    } else {
      updateDraft(mealId, { quantity });
    }
  };

  const handleAddFood = async (mealId) => {
    const draft = mealInputs[mealId];
    if (!draft.name.trim() || !draft.calories.toString().trim()) {
      Alert.alert(
        'Atenção',
        'Preencha o nome e as calorias do alimento (selecione da lista ou informe manualmente).'
      );
      return;
    }
    await storageService.addFoodEntry(mealId, {
      name: draft.name.trim(),
      calories: draft.calories,
      carbs: draft.carbs,
      protein: draft.protein,
      fat: draft.fat,
      quantity: draft.quantity,
    });
    updateDraft(mealId, emptyDraft());
    const updatedLog = await storageService.getTodayFoodLog();
    setTodayFood(updatedLog);
  };

  const handleDeleteFood = async (id) => {
    await storageService.deleteFoodEntry(id);
    const updatedLog = await storageService.getTodayFoodLog();
    setTodayFood(updatedLog);
  };

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
      <Text style={styles.screenTitle}>Calorias</Text>

      {/* --- META DIÁRIA --- */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <CardTitle icon="target">Meta Diária</CardTitle>
          {!isEditingGoal && (
            <TouchableOpacity onPress={() => setIsEditingGoal(true)}>
              <Text style={styles.editLink}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditingGoal ? (
          <View>
            <View style={styles.inputsRow}>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="70"
                  placeholderTextColor="#555"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Altura (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="175"
                  placeholderTextColor="#555"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Idade</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  placeholder="25"
                  placeholderTextColor="#555"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Sexo biológico (para o cálculo)</Text>
            <View style={styles.pillRow}>
              {['masculino', 'feminino'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, sex === s && styles.pillActive]}
                  onPress={() => setSex(s)}
                >
                  <Text style={[styles.pillText, sex === s && styles.pillTextActive]}>
                    {s === 'masculino' ? 'Masculino' : 'Feminino'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Nível de atividade</Text>
            <View style={styles.pillWrapRow}>
              {ACTIVITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.pill, activityLevel === level.id && styles.pillActive]}
                  onPress={() => setActivityLevel(level.id)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      activityLevel === level.id && styles.pillTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>
              Ou defina sua meta manualmente (kcal) — opcional
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={manualGoal}
              onChangeText={setManualGoal}
              placeholder="Ex: 2200"
              placeholderTextColor="#555"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoalSettings}>
              <Text style={styles.saveBtnText}>Salvar Meta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {dailyGoal != null ? (
              <>
                <Text style={styles.goalValue}>{dailyGoal} kcal/dia</Text>
                {!manualGoal && tdee != null && (
                  <Text style={styles.goalHint}>
                    Calculado com base no seu gasto de manutenção (TDEE). Ajuste em "Editar" se
                    quiser um valor diferente.
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.goalHint}>
                Preencha seus dados para calcular sua meta diária.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* --- CONSUMO DE HOJE, POR REFEIÇÃO --- */}
      {dailyGoal != null && (
        <View style={styles.card}>
          <CardTitle icon="silverware-fork-knife">Consumo de Hoje</CardTitle>

          <View style={styles.progressRow}>
            <View style={styles.progressBox}>
              <Text style={styles.progressValue}>{Math.round(consumedToday)}</Text>
              <Text style={styles.progressLabel}>Consumido</Text>
            </View>
            <View style={styles.progressBox}>
              <Text style={[styles.progressValue, remaining < 0 && { color: '#FF3B30' }]}>
                {Math.round(remaining)}
              </Text>
              <Text style={styles.progressLabel}>
                {remaining < 0 ? 'Acima da meta' : 'Restante'}
              </Text>
            </View>
          </View>

          {/* Totais de macros do dia */}
          <View style={styles.macroSummaryRow}>
            <View style={styles.macroChip}>
              <Text style={styles.macroChipValue}>{totalCarbs.toFixed(0)}g</Text>
              <Text style={styles.macroChipLabel}>Carboidratos</Text>
            </View>
            <View style={styles.macroChip}>
              <Text style={styles.macroChipValue}>{totalProtein.toFixed(0)}g</Text>
              <Text style={styles.macroChipLabel}>Proteínas</Text>
            </View>
            <View style={styles.macroChip}>
              <Text style={styles.macroChipValue}>{totalFat.toFixed(0)}g</Text>
              <Text style={styles.macroChipLabel}>Gorduras</Text>
            </View>
          </View>

          {MEALS.map((meal) => {
            const isExpanded = expandedMeal === meal.id;
            const items = foodByMeal[meal.id] || [];
            const total = mealTotal(meal.id);
            const draft = mealInputs[meal.id] || emptyDraft();
            const suggestions =
              !draft.selectedFood && draft.name.trim().length >= 2
                ? searchFoods(draft.name)
                : [];

            return (
              <View key={meal.id} style={styles.mealSection}>
                <TouchableOpacity
                  style={styles.mealHeader}
                  onPress={() => handleToggleMeal(meal.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mealHeaderLeft}>
                    <Text style={styles.mealIcon}>{meal.icon}</Text>
                    <View>
                      <Text style={styles.mealLabel}>{meal.label}</Text>
                      <Text style={styles.mealSubLabel}>
                        {items.length} item{items.length === 1 ? '' : 's'} · {Math.round(total)} kcal
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.mealChevron}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.mealBody}>
                    {items.map((item) => (
                      <View key={item.id} style={styles.foodRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.foodName}>{item.name}</Text>
                          {(item.carbs > 0 || item.protein > 0 || item.fat > 0) && (
                            <Text style={styles.foodMacroLine}>
                              C:{item.carbs}g · P:{item.protein}g · G:{item.fat}g
                            </Text>
                          )}
                        </View>
                        <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                        <TouchableOpacity onPress={() => handleDeleteFood(item.id)}>
                          <Text style={styles.deleteText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Campo de busca do alimento */}
                    <TextInput
                      style={styles.input}
                      placeholder="Digite o alimento (ex: arroz, frango...)"
                      placeholderTextColor="#555"
                      value={draft.name}
                      onChangeText={(text) => handleNameChange(meal.id, text)}
                    />

                    {/* Sugestões de autocomplete */}
                    {suggestions.length > 0 && (
                      <View style={styles.suggestionsBox}>
                        {suggestions.map((food) => (
                          <TouchableOpacity
                            key={food.id}
                            style={styles.suggestionRow}
                            onPress={() => handleSelectSuggestion(meal.id, food)}
                          >
                            <Text style={styles.suggestionName}>{food.name}</Text>
                            <Text style={styles.suggestionKcal}>
                              {food.calories} kcal/100g
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {draft.selectedFood && (
                      <Text style={styles.autoFillHint}>
                        ✓ Valores preenchidos automaticamente — ajuste a quantidade abaixo
                      </Text>
                    )}

                    <View style={styles.inputsRow}>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Qtd (g)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          placeholder="100"
                          placeholderTextColor="#555"
                          value={draft.quantity}
                          onChangeText={(text) => handleQuantityChange(meal.id, text)}
                        />
                      </View>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Kcal</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#555"
                          value={draft.calories}
                          onChangeText={(text) => updateDraft(meal.id, { calories: text })}
                        />
                      </View>
                    </View>

                    <View style={styles.inputsRow}>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Carbs (g)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#555"
                          value={draft.carbs}
                          onChangeText={(text) => updateDraft(meal.id, { carbs: text })}
                        />
                      </View>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Prot (g)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#555"
                          value={draft.protein}
                          onChangeText={(text) => updateDraft(meal.id, { protein: text })}
                        />
                      </View>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Gord (g)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#555"
                          value={draft.fat}
                          onChangeText={(text) => updateDraft(meal.id, { fat: text })}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.addFoodBtn}
                      onPress={() => handleAddFood(meal.id)}
                    >
                      <Text style={styles.addFoodBtnText}>+ Adicionar a {meal.label}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {outrosFood.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <View style={styles.mealHeaderLeft}>
                  <Text style={styles.mealIcon}>🍴</Text>
                  <View>
                    <Text style={styles.mealLabel}>Outros</Text>
                    <Text style={styles.mealSubLabel}>
                      {outrosFood.length} item{outrosFood.length === 1 ? '' : 's'} registrado
                      {outrosFood.length === 1 ? '' : 's'} sem refeição
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.mealBody}>
                {outrosFood.map((item) => (
                  <View key={item.id} style={styles.foodRow}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                    <TouchableOpacity onPress={() => handleDeleteFood(item.id)}>
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* --- GASTO NO TREINO --- */}
      <View style={[styles.card, { marginBottom: 30 }]}>
        <CardTitle icon="fire">Gasto Estimado no Treino de Hoje</CardTitle>
        <Text style={styles.burnedValue}>{caloriesBurnedToday} kcal</Text>
        <Text style={styles.goalHint}>
          Estimativa baseada em {todaySets} série{todaySets === 1 ? '' : 's'} registrada
          {todaySets === 1 ? '' : 's'} hoje (~{MINUTES_PER_SET} min/série) e no seu peso corporal.
          É uma aproximação, não uma medição exata.
        </Text>
      </View>
    </ScrollView>
  );
}

const { accent: NEON_GREEN, bg: DARK_BG, surface: CARD_BG, border: BORDER_COLOR } = COLORS;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG, padding: 20 },
  loadingContainer: { flex: 1, backgroundColor: DARK_BG, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: '#FFF', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 16,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
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
  editLink: { color: NEON_GREEN, fontWeight: 'bold', fontSize: 14 },
  inputsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  inputCol: { flex: 1 },
  inputLabel: { color: '#AAA', fontSize: 13, marginBottom: 6, marginTop: 6 },
  input: {
    backgroundColor: '#000',
    color: '#FFF',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  pillWrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  pillActive: { backgroundColor: NEON_GREEN, borderColor: NEON_GREEN },
  pillText: { color: '#AAA', fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#000' },
  saveBtn: {
    backgroundColor: NEON_GREEN,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  goalValue: { fontSize: 32, fontWeight: '800', letterSpacing: -1, color: NEON_GREEN, marginBottom: 6 },
  goalHint: { color: '#888', fontSize: 12, lineHeight: 17 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  progressBox: { alignItems: 'center' },
  progressValue: { fontSize: 26, fontWeight: 'bold', color: NEON_GREEN },
  progressLabel: { fontSize: 12, color: '#AAA', marginTop: 2 },

  macroSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  macroChip: { alignItems: 'center' },
  macroChipValue: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  macroChipLabel: { color: '#888', fontSize: 11, marginTop: 2 },

  mealSection: {
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingVertical: 12,
  },
  mealHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealIcon: { fontSize: 20 },
  mealLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  mealSubLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  mealChevron: { color: NEON_GREEN, fontSize: 12 },
  mealBody: { marginTop: 12 },

  suggestionsBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 10,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  suggestionName: { color: '#FFF', fontSize: 13, flex: 1 },
  suggestionKcal: { color: NEON_GREEN, fontSize: 12, fontWeight: '600' },
  autoFillHint: { color: NEON_GREEN, fontSize: 11, marginBottom: 8 },

  addFoodBtn: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: NEON_GREEN, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  addFoodBtnText: { color: NEON_GREEN, fontWeight: 'bold', fontSize: 13 },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  foodName: { color: '#FFF', fontSize: 13 },
  foodMacroLine: { color: '#888', fontSize: 11, marginTop: 2 },
  foodCalories: { color: NEON_GREEN, fontWeight: 'bold', fontSize: 13, marginRight: 12 },
  deleteText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },
  burnedValue: { fontSize: 32, fontWeight: 'bold', color: '#FF9500', marginBottom: 8 },
});
