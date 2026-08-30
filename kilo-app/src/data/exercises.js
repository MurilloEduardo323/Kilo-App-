export const MUSCLE_GROUPS = [
  { id: 'peito', name: 'Peito', icon: '🏋️‍♂️' },
  { id: 'costas', name: 'Costas', icon: '🛡️' },
  { id: 'ombros', name: 'Ombros', icon: '📐' },
  { id: 'bracos', name: 'Braços', icon: '⚡' },
  { id: 'pernas', name: 'Pernas', icon: '🦵' },
  { id: 'abdomen', name: 'Abdômen', icon: '🧘' },
];

export const EXERCISES = {
  peito: [
    { id: 'supino_reto', name: 'Supino Reto', recommendedNext: 'supino_inclinado' },
    { id: 'supino_inclinado', name: 'Supino Inclinado', recommendedNext: 'crucifixo' },
    { id: 'crucifixo', name: 'Crucifixo com Halteres', recommendedNext: 'crossover' },
    { id: 'crossover', name: 'Crossover na Polia', recommendedNext: 'supino_reto' },
  ],
  costas: [
    { id: 'puxada_frente', name: 'Puxada Alta pela Frente', recommendedNext: 'remada_curvada' },
    { id: 'remada_curvada', name: 'Remada Curvada', recommendedNext: 'remada_baixa' },
    { id: 'remada_baixa', name: 'Remada Baixa Triângulo', recommendedNext: 'pulldown' },
    { id: 'pulldown', name: 'Pulldown na Polia', recommendedNext: 'puxada_frente' },
  ],
  ombros: [
    { id: 'desenvolvimento', name: 'Desenvolvimento c/ Halteres', recommendedNext: 'elevacao_lateral' },
    { id: 'elevacao_lateral', name: 'Elevação Lateral', recommendedNext: 'elevacao_frontal' },
    { id: 'elevacao_frontal', name: 'Elevação Frontal', recommendedNext: 'crucifixo_inverso' },
    { id: 'crucifixo_inverso', name: 'Crucifixo Inverso', recommendedNext: 'desenvolvimento' },
  ],
  bracos: [
    { id: 'rosca_direta', name: 'Rosca Direta (Bíceps)', recommendedNext: 'triceps_testa' },
    { id: 'triceps_testa', name: 'Tríceps Testa', recommendedNext: 'rosca_martelo' },
    { id: 'rosca_martelo', name: 'Rosca Martelo', recommendedNext: 'triceps_corda' },
    { id: 'triceps_corda', name: 'Tríceps Corda', recommendedNext: 'rosca_direta' },
  ],
  pernas: [
    { id: 'agachamento', name: 'Agachamento Livre', recommendedNext: 'leg_press' },
    { id: 'leg_press', name: 'Leg Press 45°', recommendedNext: 'cadeira_extensora' },
    { id: 'cadeira_extensora', name: 'Cadeira Extensora', recommendedNext: 'mesa_flexora' },
    { id: 'mesa_flexora', name: 'Mesa Flexora', recommendedNext: 'agachamento' },
  ],
  abdomen: [
    { id: 'infra', name: 'Abdominal Infra', recommendedNext: 'supra' },
    { id: 'supra', name: 'Abdominal Supra', recommendedNext: 'prancha' },
    { id: 'prancha', name: 'Prancha Isométrica', recommendedNext: 'infra' },
  ],
};