import type { CalculatorDefinition } from '../types/calculator'

// ---------------------------------------------------------------------------
// ACR BI-RADS MRI — Breast Imaging Reporting and Data System (MRI)
// Reference: src/calculators/references/birads-mri.md
// ACR BI-RADS Atlas, 5th Edition. American College of Radiology, 2013.
// ---------------------------------------------------------------------------

interface BiRadsCategory {
  label: string
  malignancy: string
  management: string
}

const CATEGORIES: Record<string, BiRadsCategory> = {
  '3': {
    label: 'BI-RADS 3 — Ймовірно доброякісне',
    malignancy: '≤ 2%',
    management: 'Контрольне дослідження через 6 місяців',
  },
  '4A': {
    label: 'BI-RADS 4A — Низька підозрілість',
    malignancy: '> 2–10%',
    management: 'Рекомендована біопсія',
  },
  '4B': {
    label: 'BI-RADS 4B — Помірна підозрілість',
    malignancy: '> 10–50%',
    management: 'Рекомендована біопсія',
  },
  '4C': {
    label: 'BI-RADS 4C — Висока підозрілість',
    malignancy: '> 50–< 95%',
    management: 'Рекомендована біопсія',
  },
  '5': {
    label: 'BI-RADS 5 — Вкрай підозріле',
    malignancy: '≥ 95%',
    management: 'Наполегливо рекомендована біопсія',
  },
}

// Suspicious descriptors for masses
const SUSPICIOUS_MASS: Record<string, Set<string>> = {
  shape: new Set(['irregular']),
  margin: new Set(['irregular', 'spiculated']),
  enhancement: new Set(['heterogeneous', 'rim']),
  kinetics_delayed: new Set(['washout']),
}

// Suspicious descriptors for NME
const SUSPICIOUS_NME: Record<string, Set<string>> = {
  distribution: new Set(['segmental', 'diffuse']),
  pattern: new Set(['clumped', 'clustered_ring']),
  kinetics_delayed: new Set(['washout']),
}

function massCategory(suspiciousCount: number): string {
  if (suspiciousCount === 0) return '3'
  if (suspiciousCount === 1) return '4A'
  if (suspiciousCount === 2) return '4B'
  if (suspiciousCount === 3) return '4C'
  return '5'
}

function nmeCategory(suspiciousCount: number): string {
  if (suspiciousCount === 0) return '3'
  if (suspiciousCount === 1) return '4A'
  if (suspiciousCount === 2) return '4B'
  return '4C' // 3 suspicious → 4C/5
}

export const biradsCalculator: CalculatorDefinition = {
  id: 'birads-mri',
  name: 'BI-RADS MRI',
  fullName: 'ACR BI-RADS MRI — Система звітування та даних візуалізації молочних залоз',
  citation:
    'ACR BI-RADS Atlas: Breast Imaging Reporting and Data System, 5th Edition. American College of Radiology, 2013.',
  modality: ['MRI'],
  bodyPart: ['breast'],

  criteria: [
    {
      id: 'lesion_type',
      title: 'Тип ураження',
      options: [
        { id: 'mass', label: 'Об\'ємне утворення (mass)' },
        { id: 'nme', label: 'Не-мас підсилення (NME)' },
      ],
    },
    // --- Mass descriptors ---
    {
      id: 'shape',
      title: 'Форма (mass)',
      options: [
        { id: 'oval', label: 'Овальна' },
        { id: 'round', label: 'Кругла' },
        { id: 'irregular', label: 'Неправильна' },
      ],
    },
    {
      id: 'margin',
      title: 'Контури (mass)',
      options: [
        { id: 'circumscribed', label: 'Чіткі (circumscribed)' },
        { id: 'irregular', label: 'Нерівні (irregular)' },
        { id: 'spiculated', label: 'Спікулоподібні (spiculated)' },
      ],
    },
    {
      id: 'enhancement',
      title: 'Внутрішнє підсилення (mass)',
      options: [
        { id: 'homogeneous', label: 'Гомогенне' },
        { id: 'heterogeneous', label: 'Гетерогенне' },
        { id: 'rim', label: 'Кільцеподібне (rim)' },
        { id: 'dark_septations', label: 'Темні внутрішні перетинки' },
      ],
    },
    // --- NME descriptors ---
    {
      id: 'distribution',
      title: 'Розподіл (NME)',
      options: [
        { id: 'focal', label: 'Вогнищевий (focal)' },
        { id: 'linear', label: 'Лінійний' },
        { id: 'segmental', label: 'Сегментарний' },
        { id: 'regional', label: 'Регіональний' },
        { id: 'multiple', label: 'Множинні ділянки' },
        { id: 'diffuse', label: 'Дифузний' },
      ],
    },
    {
      id: 'pattern',
      title: 'Патерн підсилення (NME)',
      options: [
        { id: 'homogeneous', label: 'Гомогенний' },
        { id: 'heterogeneous', label: 'Гетерогенний' },
        { id: 'clumped', label: 'Грудкуватий (clumped)' },
        { id: 'clustered_ring', label: 'Кластерно-кільцевий (clustered ring)' },
      ],
    },
    // --- Kinetic curve (both) ---
    {
      id: 'kinetics_delayed',
      title: 'Кінетична крива — відстрочена фаза',
      options: [
        { id: 'persistent', label: 'Персистуючий підйом (Type I)' },
        { id: 'plateau', label: 'Плато (Type II)' },
        { id: 'washout', label: 'Вимивання (Type III / washout)' },
      ],
    },
  ],

  score(selections) {
    const type = selections.lesion_type as string
    if (!type) return null

    let catKey: string
    let suspiciousCount = 0

    if (type === 'mass') {
      const shape = selections.shape as string
      const margin = selections.margin as string
      const enhancement = selections.enhancement as string
      const kinetics = selections.kinetics_delayed as string
      if (!shape || !margin || !enhancement) return null

      if (SUSPICIOUS_MASS.shape.has(shape)) suspiciousCount++
      if (SUSPICIOUS_MASS.margin.has(margin)) suspiciousCount++
      if (SUSPICIOUS_MASS.enhancement.has(enhancement)) suspiciousCount++
      if (kinetics && SUSPICIOUS_MASS.kinetics_delayed.has(kinetics)) suspiciousCount++

      catKey = massCategory(suspiciousCount)
    } else {
      // NME
      const distribution = selections.distribution as string
      const pattern = selections.pattern as string
      const kinetics = selections.kinetics_delayed as string
      if (!distribution || !pattern) return null

      if (SUSPICIOUS_NME.distribution.has(distribution)) suspiciousCount++
      if (SUSPICIOUS_NME.pattern.has(pattern)) suspiciousCount++
      if (kinetics && SUSPICIOUS_NME.kinetics_delayed.has(kinetics)) suspiciousCount++

      catKey = nmeCategory(suspiciousCount)
    }

    const cat = CATEGORIES[catKey]
    return {
      category: `BI-RADS ${catKey}`,
      label: cat.label,
      description: `Кількість підозрілих дескрипторів: ${suspiciousCount}`,
      malignancyRate: cat.malignancy,
      management: cat.management,
      reportText: `BI-RADS ${catKey}. ${cat.management}.`,
    }
  },
}
