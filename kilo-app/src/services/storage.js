import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@kilo_app:user_data';
const HISTORY_KEY = '@kilo_app:workout_history';
const PROFILE_KEY = '@kilo_app:profile';
const CUSTOM_EXERCISES_KEY = '@kilo_app:custom_exercises';
const CALORIE_SETTINGS_KEY = '@kilo_app:calorie_settings';
const FOOD_LOG_KEY = '@kilo_app:food_log';
const WEIGHT_HISTORY_KEY = '@kilo_app:weight_history';

export const storageService = {
  // --- AUTENTICAÇÃO ---
  async registerUser(userData) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao salvar cadastro.' };
    }
  },

  async getUser() {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      return null;
    }
  },

  async loginWithPassword(inputPassword) {
    try {
      const user = await this.getUser();
      if (user && user.password === inputPassword) {
        return { success: true, user };
      }
      return { success: false, error: 'Senha incorreta!' };
    } catch (error) {
      return { success: false, error: 'Erro ao validar login.' };
    }
  },

  async clearAuth() {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error(error);
    }
  },

  // --- HISTÓRICO DE TREINOS ---
  async saveExerciseLog(exerciseId, weight, reps) {
    try {
      const existingHistory = await this.getWorkoutHistory();
      
      const newLog = {
        id: Date.now().toString(),
        exerciseId,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps, 10) || 0,
        date: new Date().toISOString(),
      };

      const updatedHistory = [newLog, ...existingHistory];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar registro de treino:', error);
      return { success: false };
    }
  },

  async getWorkoutHistory() {
    try {
      const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  },

  // FILTRO POR PERÍODO: 'semana', 'mes', 'ano'
  async getFilteredHistoryForExercise(exerciseId, period = 'mes') {
    try {
      const allHistory = await this.getWorkoutHistory();
      const now = new Date();

      const exerciseLogs = allHistory.filter((log) => log.exerciseId === exerciseId);

      return exerciseLogs.filter((log) => {
        const logDate = new Date(log.date);

        if (period === 'semana') {
          // Últimos 7 dias
          const diffInTime = now.getTime() - logDate.getTime();
          const diffInDays = diffInTime / (1000 * 3600 * 24);
          return diffInDays <= 7;
        } else if (period === 'mes') {
          // Mês e ano atuais
          return (
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear()
          );
        } else if (period === 'ano') {
          // Ano atual
          return logDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    } catch (error) {
      console.error('Erro ao buscar evolução por período:', error);
      return [];
    }
  },

  // --- PERFIL DO USUÁRIO ---
  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      return { success: false, error: 'Erro ao salvar perfil.' };
    }
  },

  async getProfile() {
    try {
      const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  },

  // --- EXERCÍCIOS CUSTOMIZADOS (criados/editados pelo usuário) ---
  async saveCustomExercises(customExercises) {
    try {
      await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar exercícios:', error);
      return { success: false, error: 'Erro ao salvar exercícios.' };
    }
  },

  async getCustomExercises() {
    try {
      const jsonValue = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao buscar exercícios customizados:', error);
      return null;
    }
  },

  // --- CALORIAS: dados corporais + meta diária ---
  async saveCalorieSettings(settings) {
    try {
      await AsyncStorage.setItem(CALORIE_SETTINGS_KEY, JSON.stringify(settings));
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar dados de calorias:', error);
      return { success: false, error: 'Erro ao salvar dados de calorias.' };
    }
  },

  async getCalorieSettings() {
    try {
      const jsonValue = await AsyncStorage.getItem(CALORIE_SETTINGS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao buscar dados de calorias:', error);
      return null;
    }
  },

  // --- CALORIAS: log de alimentos consumidos ---
  async addFoodEntry(mealId, foodData) {
    try {
      const existingLog = await this.getFoodLog();

      const newEntry = {
        id: Date.now().toString(),
        meal: mealId || 'outros',
        name: foodData.name,
        calories: parseFloat(foodData.calories) || 0,
        carbs: parseFloat(foodData.carbs) || 0,
        protein: parseFloat(foodData.protein) || 0,
        fat: parseFloat(foodData.fat) || 0,
        quantity: parseFloat(foodData.quantity) || null,
        date: new Date().toISOString(),
      };

      const updatedLog = [newEntry, ...existingLog];
      await AsyncStorage.setItem(FOOD_LOG_KEY, JSON.stringify(updatedLog));
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar alimento:', error);
      return { success: false };
    }
  },

  async deleteFoodEntry(entryId) {
    try {
      const existingLog = await this.getFoodLog();
      const updatedLog = existingLog.filter((entry) => entry.id !== entryId);
      await AsyncStorage.setItem(FOOD_LOG_KEY, JSON.stringify(updatedLog));
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover alimento:', error);
      return { success: false };
    }
  },

  async getFoodLog() {
    try {
      const jsonValue = await AsyncStorage.getItem(FOOD_LOG_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Erro ao buscar log de alimentos:', error);
      return [];
    }
  },

  async getTodayFoodLog() {
    try {
      const allLog = await this.getFoodLog();
      const now = new Date();
      return allLog.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getDate() === now.getDate() &&
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      });
    } catch (error) {
      console.error('Erro ao buscar log de hoje:', error);
      return [];
    }
  },

  async getTodayWorkoutSetsCount() {
    try {
      const allHistory = await this.getWorkoutHistory();
      const now = new Date();
      return allHistory.filter((log) => {
        const logDate = new Date(log.date);
        return (
          logDate.getDate() === now.getDate() &&
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        );
      }).length;
    } catch (error) {
      console.error('Erro ao buscar séries de hoje:', error);
      return 0;
    }
  },

  // --- HISTÓRICO DE PESO CORPORAL ---
  async addWeightEntry(weight) {
    try {
      const existingHistory = await this.getWeightHistory();

      const newEntry = {
        id: Date.now().toString(),
        weight: parseFloat(weight) || 0,
        date: new Date().toISOString(),
      };

      const updatedHistory = [newEntry, ...existingHistory];
      await AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(updatedHistory));

      // Mantém o peso usado no cálculo de calorias (TDEE) sempre atualizado
      const currentSettings = (await this.getCalorieSettings()) || {};
      await this.saveCalorieSettings({ ...currentSettings, weight: newEntry.weight });

      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar peso:', error);
      return { success: false };
    }
  },

  async deleteWeightEntry(entryId) {
    try {
      const existingHistory = await this.getWeightHistory();
      const updatedHistory = existingHistory.filter((entry) => entry.id !== entryId);
      await AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(updatedHistory));
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover peso:', error);
      return { success: false };
    }
  },

  async getWeightHistory() {
    try {
      const jsonValue = await AsyncStorage.getItem(WEIGHT_HISTORY_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Erro ao buscar histórico de peso:', error);
      return [];
    }
  }
};