// Paleta central do Kilo App.
// Mantém a identidade preto + verde já estabelecida, mas troca o verde "neon
// ácido" plano por um sistema com hierarquia: uma cor de assinatura (usada
// com moderação, em destaques e números-chave) e um verde secundário mais
// contido para ícones e elementos de apoio.

export const COLORS = {
  // Fundos — preto com uma leve nuance quente, não neutro/frio "de estoque"
  bg: '#0B0C09',
  surface: '#15160F',
  surfaceAlt: '#1D1F17',
  border: '#272A1E',

  // Verdes — accent é a cor de assinatura (uso moderado); accentMuted é o
  // apoio, usado em ícones e elementos secundários
  accent: '#C7FF3F',
  accentMuted: '#3E7A4C',
  accentDim: 'rgba(199, 255, 63, 0.12)', // fundo sutil p/ estados selecionados

  // Texto — hierarquia clara, sem branco/cinza genéricos
  textPrimary: '#F4F5EE',
  textSecondary: '#9BA08C',
  textMuted: '#5E6252',

  // Estados
  danger: '#FF5C5C',
  black: '#000000',
};

// Escala tipográfica — pesos e tamanhos com propósito definido, não valores
// arbitrários repetidos em cada tela.
export const TYPE = {
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: COLORS.textPrimary },
  title: { fontSize: 19, fontWeight: '700', letterSpacing: -0.2, color: COLORS.textPrimary },
  subtitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  body: { fontSize: 14, fontWeight: '400', color: COLORS.textPrimary },
  caption: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  statNumber: { fontSize: 32, fontWeight: '800', letterSpacing: -1, color: COLORS.accent },
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const RADIUS = { sm: 8, md: 12, lg: 16, pill: 999 };
