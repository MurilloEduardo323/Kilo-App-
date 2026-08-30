// Valores nutricionais médios por 100g (estimativas de referência, podem variar
// conforme marca/preparo). Fonte: médias de tabelas nutricionais públicas (TACO/USDA).
export const FOODS = [
  // --- GRÃOS / CARBOIDRATOS ---
  { id: 'arroz_branco', name: 'Arroz branco cozido', calories: 130, carbs: 28, protein: 2.7, fat: 0.3 },
  { id: 'arroz_integral', name: 'Arroz integral cozido', calories: 124, carbs: 25.8, protein: 2.6, fat: 1 },
  { id: 'feijao_carioca', name: 'Feijão carioca cozido', calories: 76, carbs: 13.6, protein: 4.8, fat: 0.5 },
  { id: 'feijao_preto', name: 'Feijão preto cozido', calories: 77, carbs: 14, protein: 4.5, fat: 0.5 },
  { id: 'macarrao', name: 'Macarrão cozido', calories: 158, carbs: 31, protein: 5.8, fat: 0.9 },
  { id: 'pao_frances', name: 'Pão francês', calories: 300, carbs: 58, protein: 8, fat: 3.1 },
  { id: 'pao_forma', name: 'Pão de forma', calories: 265, carbs: 49, protein: 9, fat: 3.3 },
  { id: 'pao_queijo', name: 'Pão de queijo', calories: 349, carbs: 34, protein: 6.6, fat: 21 },
  { id: 'batata_cozida', name: 'Batata cozida', calories: 87, carbs: 20, protein: 1.9, fat: 0.1 },
  { id: 'batata_doce', name: 'Batata doce cozida', calories: 77, carbs: 18, protein: 1.6, fat: 0.1 },
  { id: 'mandioca', name: 'Mandioca cozida', calories: 125, carbs: 30, protein: 0.6, fat: 0.3 },
  { id: 'aveia', name: 'Aveia em flocos', calories: 389, carbs: 66, protein: 17, fat: 7 },
  { id: 'tapioca', name: 'Tapioca (goma hidratada)', calories: 156, carbs: 38.5, protein: 0.2, fat: 0 },
  { id: 'farofa', name: 'Farofa', calories: 365, carbs: 63, protein: 2, fat: 12 },
  { id: 'granola', name: 'Granola', calories: 471, carbs: 64, protein: 10, fat: 20 },
  { id: 'quinoa', name: 'Quinoa cozida', calories: 120, carbs: 21.3, protein: 4.4, fat: 1.9 },
  { id: 'cuscuz', name: 'Cuscuz de milho', calories: 112, carbs: 25, protein: 2.1, fat: 0.4 },
  { id: 'polenta', name: 'Polenta cozida', calories: 85, carbs: 18, protein: 2, fat: 0.5 },
  { id: 'pao_integral', name: 'Pão integral', calories: 253, carbs: 43, protein: 12.5, fat: 3.7 },
  { id: 'pao_pita', name: 'Pão pita', calories: 275, carbs: 55.7, protein: 9.1, fat: 1.2 },
  { id: 'torrada', name: 'Torrada', calories: 407, carbs: 76, protein: 11, fat: 6 },
  { id: 'biscoito_agua_sal', name: 'Biscoito água e sal', calories: 432, carbs: 74, protein: 10, fat: 11 },
  { id: 'biscoito_recheado', name: 'Biscoito recheado', calories: 480, carbs: 70, protein: 5.5, fat: 20 },
  { id: 'nhoque', name: 'Nhoque de batata', calories: 132, carbs: 27, protein: 3.5, fat: 1.2 },
  { id: 'lentilha', name: 'Lentilha cozida', calories: 93, carbs: 16.3, protein: 6.3, fat: 0.4 },
  { id: 'grao_de_bico', name: 'Grão de bico cozido', calories: 121, carbs: 20, protein: 7.3, fat: 1.9 },
  { id: 'milho_verde', name: 'Milho verde cozido', calories: 98, carbs: 21, protein: 3.4, fat: 1.2 },
  { id: 'pipoca', name: 'Pipoca sem manteiga', calories: 375, carbs: 74, protein: 11, fat: 4.5 },

  // --- PROTEÍNAS ---
  { id: 'frango_peito', name: 'Peito de frango grelhado', calories: 165, carbs: 0, protein: 31, fat: 3.6 },
  { id: 'frango_coxa', name: 'Coxa de frango assada', calories: 209, carbs: 0, protein: 26, fat: 10.9 },
  { id: 'carne_moida', name: 'Carne moída cozida', calories: 250, carbs: 0, protein: 26, fat: 15 },
  { id: 'carne_patinho', name: 'Carne bovina (patinho) grelhada', calories: 219, carbs: 0, protein: 35.9, fat: 7.3 },
  { id: 'tilapia', name: 'Filé de tilápia grelhado', calories: 128, carbs: 0, protein: 26, fat: 2.7 },
  { id: 'salmao', name: 'Salmão grelhado', calories: 208, carbs: 0, protein: 20, fat: 13 },
  { id: 'atum_lata', name: 'Atum em lata (água)', calories: 116, carbs: 0, protein: 26, fat: 1 },
  { id: 'ovo_cozido', name: 'Ovo cozido', calories: 155, carbs: 1.1, protein: 13, fat: 11 },
  { id: 'ovo_frito', name: 'Ovo frito', calories: 196, carbs: 0.9, protein: 13.6, fat: 15 },
  { id: 'linguica', name: 'Linguiça', calories: 300, carbs: 3, protein: 13, fat: 27 },
  { id: 'bacon', name: 'Bacon frito', calories: 541, carbs: 1.4, protein: 37, fat: 42 },
  { id: 'whey', name: 'Whey protein (pó)', calories: 400, carbs: 8, protein: 80, fat: 6 },
  { id: 'file_mignon', name: 'Filé mignon grelhado', calories: 200, carbs: 0, protein: 32, fat: 7.5 },
  { id: 'carne_seca', name: 'Carne seca cozida', calories: 250, carbs: 0, protein: 40, fat: 9 },
  { id: 'picanha', name: 'Picanha grelhada', calories: 289, carbs: 0, protein: 27, fat: 20 },
  { id: 'costela_bovina', name: 'Costela bovina assada', calories: 350, carbs: 0, protein: 25, fat: 27 },
  { id: 'lombo_suino', name: 'Lombo suíno assado', calories: 210, carbs: 0, protein: 28, fat: 10 },
  { id: 'peru_peito', name: 'Peito de peru grelhado', calories: 135, carbs: 0, protein: 29, fat: 1.5 },
  { id: 'camarao', name: 'Camarão cozido', calories: 99, carbs: 0.9, protein: 21, fat: 1.1 },
  { id: 'sardinha_lata', name: 'Sardinha em lata (óleo)', calories: 208, carbs: 0.4, protein: 25, fat: 11 },
  { id: 'presunto', name: 'Presunto', calories: 145, carbs: 1.5, protein: 18, fat: 7 },
  { id: 'peito_peru_fatiado', name: 'Peito de peru fatiado (frios)', calories: 90, carbs: 2, protein: 17, fat: 1.5 },
  { id: 'tofu', name: 'Tofu', calories: 76, carbs: 1.9, protein: 8, fat: 4.8 },
  { id: 'proteina_soja', name: 'Proteína de soja (texturizada, hidratada)', calories: 89, carbs: 5.7, protein: 15.6, fat: 0.9 },

  // --- LATICÍNIOS ---
  { id: 'leite_integral', name: 'Leite integral', calories: 61, carbs: 4.8, protein: 3.2, fat: 3.3 },
  { id: 'leite_desnatado', name: 'Leite desnatado', calories: 35, carbs: 5, protein: 3.4, fat: 0.2 },
  { id: 'iogurte_natural', name: 'Iogurte natural', calories: 61, carbs: 4.7, protein: 3.5, fat: 3.3 },
  { id: 'queijo_minas', name: 'Queijo minas', calories: 264, carbs: 3, protein: 17.4, fat: 20 },
  { id: 'queijo_mucarela', name: 'Queijo muçarela', calories: 280, carbs: 3.1, protein: 22, fat: 20 },
  { id: 'requeijao', name: 'Requeijão', calories: 257, carbs: 3, protein: 9, fat: 23 },
  { id: 'queijo_cottage', name: 'Queijo cottage', calories: 98, carbs: 3.4, protein: 11, fat: 4.3 },
  { id: 'queijo_parmesao', name: 'Queijo parmesão', calories: 431, carbs: 3.2, protein: 38, fat: 29 },
  { id: 'iogurte_grego', name: 'Iogurte grego natural', calories: 97, carbs: 4, protein: 9, fat: 5 },
  { id: 'iogurte_desnatado', name: 'Iogurte desnatado', calories: 41, carbs: 5.9, protein: 4.1, fat: 0.2 },
  { id: 'leite_condensado', name: 'Leite condensado', calories: 321, carbs: 54.4, protein: 7.9, fat: 8.6 },
  { id: 'creme_de_leite', name: 'Creme de leite', calories: 239, carbs: 3.5, protein: 2.6, fat: 25 },

  // --- FRUTAS ---
  { id: 'banana', name: 'Banana', calories: 89, carbs: 23, protein: 1.1, fat: 0.3 },
  { id: 'maca', name: 'Maçã', calories: 52, carbs: 14, protein: 0.3, fat: 0.2 },
  { id: 'laranja', name: 'Laranja', calories: 47, carbs: 12, protein: 0.9, fat: 0.1 },
  { id: 'mamao', name: 'Mamão', calories: 43, carbs: 11, protein: 0.5, fat: 0.3 },
  { id: 'abacate', name: 'Abacate', calories: 160, carbs: 8.5, protein: 2, fat: 15 },
  { id: 'manga', name: 'Manga', calories: 60, carbs: 15, protein: 0.8, fat: 0.4 },
  { id: 'uva', name: 'Uva', calories: 69, carbs: 18, protein: 0.7, fat: 0.2 },
  { id: 'melancia', name: 'Melancia', calories: 30, carbs: 7.6, protein: 0.6, fat: 0.2 },
  { id: 'morango', name: 'Morango', calories: 32, carbs: 7.7, protein: 0.7, fat: 0.3 },
  { id: 'acai', name: 'Açaí (polpa com xarope)', calories: 247, carbs: 32, protein: 1.5, fat: 12 },
  { id: 'abacaxi', name: 'Abacaxi', calories: 50, carbs: 13, protein: 0.5, fat: 0.1 },
  { id: 'pera', name: 'Pera', calories: 57, carbs: 15, protein: 0.4, fat: 0.1 },
  { id: 'kiwi', name: 'Kiwi', calories: 61, carbs: 15, protein: 1.1, fat: 0.5 },
  { id: 'goiaba', name: 'Goiaba', calories: 68, carbs: 14.3, protein: 2.6, fat: 0.5 },
  { id: 'maracuja', name: 'Maracujá (polpa)', calories: 68, carbs: 13.4, protein: 2, fat: 2.1 },
  { id: 'tangerina', name: 'Tangerina', calories: 40, carbs: 10, protein: 0.6, fat: 0.2 },
  { id: 'limao', name: 'Limão', calories: 29, carbs: 9.3, protein: 1.1, fat: 0.3 },
  { id: 'ameixa', name: 'Ameixa', calories: 46, carbs: 11.4, protein: 0.7, fat: 0.3 },
  { id: 'coco', name: 'Coco (polpa)', calories: 354, carbs: 15, protein: 3.3, fat: 33 },
  { id: 'figo', name: 'Figo', calories: 74, carbs: 19, protein: 0.8, fat: 0.3 },
  { id: 'caqui', name: 'Caqui', calories: 70, carbs: 18, protein: 0.6, fat: 0.2 },

  // --- VEGETAIS / LEGUMES ---
  { id: 'alface', name: 'Alface', calories: 15, carbs: 2.9, protein: 1.4, fat: 0.2 },
  { id: 'tomate', name: 'Tomate', calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2 },
  { id: 'cenoura', name: 'Cenoura cozida', calories: 35, carbs: 8.2, protein: 0.8, fat: 0.2 },
  { id: 'brocolis', name: 'Brócolis cozido', calories: 35, carbs: 7, protein: 2.4, fat: 0.4 },
  { id: 'abobrinha', name: 'Abobrinha refogada', calories: 20, carbs: 3.4, protein: 1.3, fat: 0.4 },
  { id: 'couve', name: 'Couve refogada', calories: 40, carbs: 5, protein: 2.9, fat: 1.5 },
  { id: 'pepino', name: 'Pepino', calories: 15, carbs: 3.6, protein: 0.7, fat: 0.1 },
  { id: 'beterraba', name: 'Beterraba cozida', calories: 44, carbs: 10, protein: 1.7, fat: 0.2 },
  { id: 'abobora', name: 'Abóbora cozida', calories: 26, carbs: 6.5, protein: 1, fat: 0.1 },
  { id: 'berinjela', name: 'Berinjela refogada', calories: 35, carbs: 8.7, protein: 0.8, fat: 0.2 },
  { id: 'pimentao', name: 'Pimentão', calories: 20, carbs: 4.6, protein: 0.9, fat: 0.2 },
  { id: 'cebola', name: 'Cebola', calories: 40, carbs: 9.3, protein: 1.1, fat: 0.1 },
  { id: 'repolho', name: 'Repolho cozido', calories: 20, carbs: 4.3, protein: 1, fat: 0.2 },
  { id: 'chuchu', name: 'Chuchu cozido', calories: 17, carbs: 4.1, protein: 0.6, fat: 0.1 },
  { id: 'vagem', name: 'Vagem cozida', calories: 25, carbs: 5.7, protein: 1.5, fat: 0.1 },
  { id: 'espinafre', name: 'Espinafre refogado', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },
  { id: 'quiabo', name: 'Quiabo cozido', calories: 26, carbs: 5.5, protein: 2, fat: 0.2 },

  // --- OUTROS / PETISCOS / BEBIDAS ---
  { id: 'pizza', name: 'Pizza (fatia média)', calories: 266, carbs: 33, protein: 11, fat: 10 },
  { id: 'hamburguer', name: 'Hambúrguer (fast food)', calories: 295, carbs: 30, protein: 17, fat: 12 },
  { id: 'batata_frita', name: 'Batata frita', calories: 312, carbs: 41, protein: 3.4, fat: 15 },
  { id: 'coxinha', name: 'Coxinha', calories: 280, carbs: 22, protein: 9, fat: 17 },
  { id: 'pastel', name: 'Pastel frito', calories: 300, carbs: 30, protein: 6, fat: 18 },
  { id: 'refrigerante', name: 'Refrigerante (lata)', calories: 42, carbs: 10.6, protein: 0, fat: 0 },
  { id: 'chocolate', name: 'Chocolate ao leite', calories: 535, carbs: 59, protein: 7.6, fat: 30 },
  { id: 'amendoim', name: 'Amendoim', calories: 567, carbs: 16, protein: 26, fat: 49 },
  { id: 'castanha_para', name: 'Castanha do Pará', calories: 656, carbs: 12, protein: 14, fat: 66 },
  { id: 'azeite', name: 'Azeite de oliva', calories: 884, carbs: 0, protein: 0, fat: 100 },
  { id: 'manteiga', name: 'Manteiga', calories: 717, carbs: 0.1, protein: 0.9, fat: 81 },
  { id: 'cafe_preto', name: 'Café preto (sem açúcar)', calories: 2, carbs: 0, protein: 0.1, fat: 0 },
  { id: 'suco_laranja', name: 'Suco de laranja natural', calories: 45, carbs: 10.4, protein: 0.7, fat: 0.2 },

  // --- BEBIDAS ---
  { id: 'agua_coco', name: 'Água de coco', calories: 19, carbs: 3.7, protein: 0.7, fat: 0.2 },
  { id: 'cerveja', name: 'Cerveja (lata)', calories: 43, carbs: 3.6, protein: 0.5, fat: 0 },
  { id: 'vinho_tinto', name: 'Vinho tinto', calories: 85, carbs: 2.6, protein: 0.1, fat: 0 },
  { id: 'suco_uva', name: 'Suco de uva integral', calories: 54, carbs: 13.5, protein: 0.4, fat: 0 },
  { id: 'refrigerante_zero', name: 'Refrigerante zero/diet (lata)', calories: 1, carbs: 0.2, protein: 0, fat: 0 },
  { id: 'energetico', name: 'Bebida energética (lata)', calories: 45, carbs: 11, protein: 0, fat: 0 },
  { id: 'leite_achocolatado', name: 'Achocolatado pronto', calories: 68, carbs: 11, protein: 3, fat: 1.5 },
  { id: 'isotonico', name: 'Isotônico (bebida esportiva)', calories: 24, carbs: 6, protein: 0, fat: 0 },
  { id: 'cha_sem_acucar', name: 'Chá sem açúcar', calories: 1, carbs: 0.2, protein: 0, fat: 0 },

  // --- DOCES / SOBREMESAS ---
  { id: 'brigadeiro', name: 'Brigadeiro', calories: 380, carbs: 58, protein: 4.5, fat: 15 },
  { id: 'pudim', name: 'Pudim de leite', calories: 156, carbs: 25, protein: 4, fat: 4.5 },
  { id: 'bolo_chocolate', name: 'Bolo de chocolate', calories: 371, carbs: 51, protein: 5, fat: 17 },
  { id: 'sorvete', name: 'Sorvete de massa', calories: 207, carbs: 24, protein: 3.5, fat: 11 },
  { id: 'picole_fruta', name: 'Picolé de fruta', calories: 80, carbs: 20, protein: 0.3, fat: 0.1 },
  { id: 'doce_leite', name: 'Doce de leite', calories: 315, carbs: 55, protein: 6.5, fat: 7.5 },
  { id: 'paçoca', name: 'Paçoca', calories: 469, carbs: 45, protein: 15, fat: 26 },
  { id: 'mel', name: 'Mel', calories: 304, carbs: 82, protein: 0.3, fat: 0 },
  { id: 'acucar', name: 'Açúcar refinado', calories: 387, carbs: 100, protein: 0, fat: 0 },
  { id: 'geleia', name: 'Geleia de frutas', calories: 246, carbs: 61, protein: 0.4, fat: 0.1 },

  // --- TEMPEROS / MOLHOS ---
  { id: 'maionese', name: 'Maionese', calories: 680, carbs: 2.6, protein: 1, fat: 75 },
  { id: 'ketchup', name: 'Ketchup', calories: 112, carbs: 27, protein: 1.2, fat: 0.2 },
  { id: 'molho_tomate', name: 'Molho de tomate', calories: 32, carbs: 6.7, protein: 1.5, fat: 0.3 },
  { id: 'oleo_soja', name: 'Óleo de soja', calories: 884, carbs: 0, protein: 0, fat: 100 },
  { id: 'vinagrete', name: 'Vinagrete', calories: 30, carbs: 5, protein: 0.8, fat: 1 },

  // --- PRATOS PRONTOS / TÍPICOS ---
  { id: 'feijoada', name: 'Feijoada (porção com acompanhamentos)', calories: 220, carbs: 15, protein: 14, fat: 12 },
  { id: 'strogonoff_frango', name: 'Strogonoff de frango', calories: 195, carbs: 8, protein: 15, fat: 11 },
  { id: 'lasanha', name: 'Lasanha à bolonhesa', calories: 195, carbs: 16, protein: 10, fat: 10 },
  { id: 'escondidinho', name: 'Escondidinho de carne seca', calories: 180, carbs: 18, protein: 9, fat: 8 },
  { id: 'moqueca', name: 'Moqueca de peixe', calories: 145, carbs: 5, protein: 15, fat: 8 },
  { id: 'esfiha', name: 'Esfiha de carne', calories: 260, carbs: 30, protein: 11, fat: 10 },
  { id: 'sushi_combinado', name: 'Sushi (peça combinada)', calories: 48, carbs: 8, protein: 2, fat: 0.8 },
  { id: 'salada_caesar', name: 'Salada Caesar com frango', calories: 158, carbs: 5, protein: 14, fat: 9 },
  { id: 'sanduiche_natural', name: 'Sanduíche natural (frango/atum)', calories: 210, carbs: 24, protein: 12, fat: 7 },
  { id: 'tapioca_recheada', name: 'Tapioca recheada (queijo/frango)', calories: 210, carbs: 30, protein: 9, fat: 6 },
];

// Remove acentos para permitir busca mais flexível (ex: "pao" encontra "Pão")
const normalize = (str) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const searchFoods = (query, limit = 5) => {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];

  return FOODS.filter((food) => normalize(food.name).includes(normalizedQuery)).slice(0, limit);
};
