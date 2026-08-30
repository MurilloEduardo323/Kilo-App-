# Kilo App

App de treinos, nutrição e evolução corporal feito em React Native + Expo. Dados salvos localmente (offline-first) via AsyncStorage — sem backend.

## Funcionalidades

- **Treinos** (`HomeScreen` / `ExerciseDetailScreen`): lista de exercícios, registro de séries (peso x repetições), exercícios customizados pelo usuário.
- **Calorias** (`CaloriesScreen`): cálculo de TDEE (fórmula Mifflin-St Jeor), meta diária, log de refeições por accordion, base de ~149 alimentos brasileiros com busca (`src/data/foods.js`).
- **Histórico** (`HistoryScreen`): gráfico de evolução de peso corporal e filtros por período (semana / mês / ano), tanto para peso quanto para exercícios.
- **Perfil** (`ProfileScreen`): dados do usuário e logout.
- **Autenticação** (`AuthScreen`): cadastro/login simples, armazenado localmente (sem senha criptografada — ver Limitações).

## Stack

- Expo ~54 / React Native 0.81 / React 19
- `@react-native-async-storage/async-storage` — persistência local
- `react-native-chart-kit` + `react-native-svg` — gráficos
- `expo-notifications` — notificações (ver aviso abaixo)
- `@notifee/react-native` — notificações locais avançadas

## Como rodar

```bash
npm install
npm start        # abre o Expo Dev Tools / Metro
npm run android  # roda direto num emulador/dispositivo Android
npm run ios      # roda direto num simulador iOS
```

Requer Expo CLI e, para build nativo, Android Studio / Xcode configurados.

## Build (EAS)

```bash
eas build --profile preview --platform android   # gera .apk para teste interno
eas build --profile production --platform android
```

Perfis configurados em `eas.json`: `development`, `preview` (gera APK) e `production`.

⚠️ **Atenção**: `expo-notifications` está no `package.json` mas **não tem o plugin configurado em `app.json`**. Isso pode causar crash em builds standalone (APK/EAS) caso o módulo seja importado sem essa configuração. Adicionar o plugin em `app.json` antes de builds de produção que usem notificações.

## Estrutura

```
App.js                  # navegação por abas (Treinos / Calorias / Histórico / Perfil)
src/
  screens/               # telas do app
  services/storage.js    # camada de persistência (AsyncStorage)
  data/                  # exercicios.js, foods.js (base de alimentos BR)
  theme/                 # cores e estilos centralizados
```

## Limitações conhecidas

- Sem backend: dados ficam só no dispositivo (não há sync entre aparelhos).
- Autenticação armazena a senha em texto puro no AsyncStorage — não usar em produção real sem revisar isso.
- Usuário único por dispositivo (não há multi-conta).

## Licença

Ver `LICENSE`.
