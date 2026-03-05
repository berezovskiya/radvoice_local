import type { CalculatorDefinition, CalculatorResult } from '../types/calculator'

// ---------------------------------------------------------------------------
// PI-RADS v2.1 — Prostate Imaging Reporting & Data System
// Reference: src/calculators/references/pirads-v2.1.md
// Turkbey B et al. Eur Urol. 2019;76(3):340-351. PMID: 30898406
// ---------------------------------------------------------------------------

const CATEGORIES: Record<number, { label: string; description: string; management: string }> = {
  1: {
    label: 'PI-RADS 1 — Дуже низька ймовірність',
    description: 'Клінічно значущий рак вкрай малоймовірний',
    management: 'Додаткове обстеження не потрібне',
  },
  2: {
    label: 'PI-RADS 2 — Низька ймовірність',
    description: 'Клінічно значущий рак малоймовірний',
    management: 'Додаткове обстеження не потрібне',
  },
  3: {
    label: 'PI-RADS 3 — Проміжна ймовірність',
    description: 'Наявність клінічно значущого раку сумнівна',
    management: 'Індивідуальний підхід: моніторинг або біопсія',
  },
  4: {
    label: 'PI-RADS 4 — Висока ймовірність',
    description: 'Клінічно значущий рак ймовірний',
    management: 'Рекомендована біопсія',
  },
  5: {
    label: 'PI-RADS 5 — Дуже висока ймовірність',
    description: 'Клінічно значущий рак дуже ймовірний',
    management: 'Рекомендована біопсія',
  },
}

function scorePZ(dwi: number, dce: string): number {
  if (dwi <= 2) return dwi
  if (dwi === 3) return dce === 'positive' ? 4 : 3
  if (dwi === 4) return 4
  return 5 // dwi === 5
}

function scoreTZ(t2w: number, dwi: number): number {
  if (t2w === 1) return 1
  if (t2w === 2) return dwi >= 4 ? 3 : 2
  if (t2w === 3) return dwi === 5 ? 4 : 3
  if (t2w === 4) return 4
  return 5 // t2w === 5
}

function makeResult(piRads: number, zone: string): CalculatorResult {
  const cat = CATEGORIES[piRads]
  return {
    category: `PI-RADS ${piRads}`,
    label: cat.label,
    description: cat.description,
    management: cat.management,
    reportText: `PI-RADS ${piRads} (${zone === 'PZ' ? 'периферична зона' : 'транзиторна зона'}). ${cat.description}.`,
  }
}

export const piradsCalculator: CalculatorDefinition = {
  id: 'pirads-v2.1',
  name: 'PI-RADS v2.1',
  fullName: 'PI-RADS v2.1 — Система звітування та даних візуалізації простати',
  citation:
    'Turkbey B, Rosenkrantz AB, Haider MA, et al. Prostate Imaging Reporting and Data System Version 2.1. Eur Urol. 2019;76(3):340-351. PMID: 30898406.',
  modality: ['MRI'],
  bodyPart: ['prostate'],

  criteria: [
    {
      id: 'zone',
      title: 'Зона',
      options: [
        { id: 'PZ', label: 'Периферична зона (PZ)' },
        { id: 'TZ', label: 'Транзиторна зона (TZ)' },
      ],
    },
    {
      id: 'dwi',
      title: 'DWI / ADC',
      description: 'Оцінка дифузійно-зваженого зображення',
      options: [
        { id: '1', label: '1 — Без патології на ADC та DWI' },
        { id: '2', label: '2 — Нечітка гіпоінтенсивність на ADC' },
        { id: '3', label: '3 — Вогнище помірно гіпоінтенсивне на ADC, < 1.5 см' },
        { id: '4', label: '4 — Вогнище виражено гіпоінтенсивне на ADC, < 1.5 см' },
        { id: '5', label: '5 — Виражено гіпоінтенсивне ≥ 1.5 см або екстрапростатичне поширення' },
      ],
    },
    {
      id: 't2w',
      title: 'T2W (тільки для TZ)',
      description: 'Оцінка T2-зваженого зображення',
      options: [
        { id: '1', label: '1 — Норма або повністю інкапсульований вузол BPH' },
        { id: '2', label: '2 — Обмежений гіпоінтенсивний інкапсульований вузол' },
        { id: '3', label: '3 — Гетерогенна ділянка з нечіткими межами' },
        { id: '4', label: '4 — Лінзоподібна, помірно гіпоінтенсивна, < 1.5 см' },
        { id: '5', label: '5 — Як 4, але ≥ 1.5 см або екстрапростатичне поширення' },
      ],
    },
    {
      id: 'dce',
      title: 'DCE (тільки для PZ при DWI = 3)',
      description: 'Динамічне контрастне підсилення',
      options: [
        { id: 'negative', label: 'Негативне — немає раннього підсилення' },
        { id: 'positive', label: 'Позитивне — раннє вогнищеве підсилення' },
      ],
    },
  ],

  score(selections) {
    const zone = selections.zone as string
    const dwi = Number(selections.dwi)
    if (!zone || !dwi) return null

    if (zone === 'PZ') {
      const dce = (selections.dce as string) || 'negative'
      return makeResult(scorePZ(dwi, dce), zone)
    }

    // TZ
    const t2w = Number(selections.t2w)
    if (!t2w) return null
    return makeResult(scoreTZ(t2w, dwi), zone)
  },
}
