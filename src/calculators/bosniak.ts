import type { CalculatorDefinition, CalculatorResult } from '../types/calculator'

// ---------------------------------------------------------------------------
// Bosniak Classification v2019 — Cystic Renal Masses
// Reference: src/calculators/references/bosniak-2019.md
// Silverman SG et al. Radiology. 2019;292(2):475-488. PMID: 31210616
// ---------------------------------------------------------------------------

interface BosniakCategory {
  label: string
  malignancy: string
  management: string
}

const CATEGORIES: Record<string, BosniakCategory> = {
  I: {
    label: 'Bosniak I — Проста кіста',
    malignancy: '0%',
    management: 'Спостереження не потрібне',
  },
  II: {
    label: 'Bosniak II — Мінімально складна',
    malignancy: '< 1%',
    management: 'Спостереження не потрібне',
  },
  IIF: {
    label: 'Bosniak IIF — Ймовірно доброякісна',
    malignancy: '~10%',
    management: 'Спостереження: 6 міс, 12 міс, потім щорічно протягом 5 років',
  },
  III: {
    label: 'Bosniak III — Невизначена',
    malignancy: '~50%',
    management: 'Хірургія або активне спостереження',
  },
  IV: {
    label: 'Bosniak IV — Ймовірно злоякісна',
    malignancy: '~85–90%',
    management: 'Рекомендована хірургія',
  },
}

function makeResult(key: string): CalculatorResult {
  const cat = CATEGORIES[key]
  return {
    category: `Bosniak ${key}`,
    label: cat.label,
    description: `Ймовірність малігнізації: ${cat.malignancy}`,
    malignancyRate: cat.malignancy,
    management: cat.management,
    reportText: `Bosniak ${key}. ${cat.management}. Ймовірність малігнізації ${cat.malignancy}.`,
  }
}

export const bosniakCalculator: CalculatorDefinition = {
  id: 'bosniak-2019',
  name: 'Bosniak v2019',
  fullName: 'Bosniak v2019 — Класифікація кістозних утворень нирок',
  citation:
    'Silverman SG, Pedrosa I, Ellis JH, et al. Bosniak Classification of Cystic Renal Masses, Version 2019. Radiology. 2019;292(2):475-488. PMID: 31210616.',
  modality: ['CT', 'MRI'],
  bodyPart: ['kidney'],

  criteria: [
    {
      id: 'wall_thickness',
      title: 'Товщина стінки',
      options: [
        { id: 'thin', label: 'Тонка (≤ 2 мм), рівна' },
        { id: 'minimally_thickened', label: 'Мінімально потовщена (3 мм), рівна' },
        { id: 'thick_smooth', label: 'Потовщена (≥ 4 мм), рівна, з підсиленням' },
        { id: 'irregular', label: 'Нерівна (будь-якої товщини), з підсиленням' },
      ],
    },
    {
      id: 'septa',
      title: 'Перетинки',
      options: [
        { id: 'none', label: 'Немає перетинок' },
        { id: '1_3_thin', label: '1–3 тонкі (≤ 2 мм), рівні' },
        { id: '4plus_thin', label: '≥ 4 тонкі (≤ 2 мм), рівні, з підсиленням' },
        { id: 'minimally_thickened', label: 'Мінімально потовщені (3 мм), рівні, з підсиленням' },
        { id: 'thick_smooth', label: 'Потовщені (≥ 4 мм), рівні, з підсиленням' },
        { id: 'irregular', label: 'Нерівні, з підсиленням' },
      ],
    },
    {
      id: 'nodule',
      title: 'Вузликовий компонент із підсиленням',
      options: [
        { id: 'none', label: 'Немає' },
        { id: 'small_obtuse', label: 'Опуклий виступ ≤ 3 мм, тупі кути' },
        { id: 'large_obtuse', label: 'Опуклий виступ ≥ 4 мм, тупі кути' },
        { id: 'any_acute', label: 'Будь-який розмір, гострі кути' },
      ],
    },
    {
      id: 'fluid',
      title: 'Характер вмісту',
      options: [
        { id: 'simple', label: 'Простий (–9 до 20 HU)' },
        { id: 'high_density', label: 'Гіперденсний (> 20 HU), без підсилення' },
        { id: 'high_density_small', label: 'Гіперденсний ≥ 70 HU, без контрасту, ≤ 3 см' },
      ],
    },
  ],

  score(selections) {
    const wall = selections.wall_thickness as string
    const septa = selections.septa as string
    const nodule = selections.nodule as string
    const fluid = selections.fluid as string

    if (!wall || !septa || !nodule) return null

    // --- Bosniak IV: enhancing nodule ---
    if (nodule === 'large_obtuse' || nodule === 'any_acute') {
      return makeResult('IV')
    }

    // --- Bosniak III: thick smooth wall/septa OR irregular wall/septa OR small obtuse nodule ---
    if (
      wall === 'thick_smooth' ||
      wall === 'irregular' ||
      septa === 'thick_smooth' ||
      septa === 'irregular' ||
      nodule === 'small_obtuse'
    ) {
      return makeResult('III')
    }

    // --- Bosniak IIF: ≥4 thin septa OR minimally thickened wall/septa ---
    if (
      septa === '4plus_thin' ||
      septa === 'minimally_thickened' ||
      wall === 'minimally_thickened'
    ) {
      return makeResult('IIF')
    }

    // --- Bosniak II vs I ---
    // II: 1-3 thin septa, or high-density content
    if (
      septa === '1_3_thin' ||
      fluid === 'high_density' ||
      fluid === 'high_density_small'
    ) {
      return makeResult('II')
    }

    // --- Bosniak I: simple cyst ---
    return makeResult('I')
  },
}
