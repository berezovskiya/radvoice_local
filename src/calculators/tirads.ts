import type { CalculatorDefinition } from '../types/calculator'

// ---------------------------------------------------------------------------
// ACR TI-RADS — Thyroid Imaging Reporting and Data System
// Reference: src/calculators/references/tirads.md
// Tessler FN et al. JACR. 2017;14(5):587-595. PMID: 28372962
// ---------------------------------------------------------------------------

interface TRLevel {
  level: string
  label: string
  fna: string
  followUp: string
  management: string
}

const LEVELS: Record<string, TRLevel> = {
  TR1: {
    level: 'TR1',
    label: 'TR1 — Доброякісне',
    fna: 'Не потрібна',
    followUp: 'Не потрібне',
    management: 'Біопсія та спостереження не потрібні',
  },
  TR2: {
    level: 'TR2',
    label: 'TR2 — Не підозріле',
    fna: 'Не потрібна',
    followUp: 'Не потрібне',
    management: 'Біопсія та спостереження не потрібні',
  },
  TR3: {
    level: 'TR3',
    label: 'TR3 — Помірно підозріле',
    fna: '≥ 2.5 см',
    followUp: '≥ 1.5 см',
    management: 'ТАБ при ≥ 2.5 см; спостереження при ≥ 1.5 см; < 1.5 см — не потрібне',
  },
  TR4: {
    level: 'TR4',
    label: 'TR4 — Помірно підозріле',
    fna: '≥ 1.5 см',
    followUp: '≥ 1.0 см',
    management: 'ТАБ при ≥ 1.5 см; спостереження при ≥ 1.0 см; < 1.0 см — не потрібне',
  },
  TR5: {
    level: 'TR5',
    label: 'TR5 — Високо підозріле',
    fna: '≥ 1.0 см',
    followUp: '≥ 0.5 см',
    management: 'ТАБ при ≥ 1.0 см; спостереження при ≥ 0.5 см; < 0.5 см — не потрібне',
  },
}

function pointsToLevel(points: number): TRLevel {
  if (points === 0) return LEVELS.TR1
  if (points <= 2) return LEVELS.TR2
  if (points === 3) return LEVELS.TR3
  if (points <= 6) return LEVELS.TR4
  return LEVELS.TR5
}

export const tiradsCalculator: CalculatorDefinition = {
  id: 'tirads',
  name: 'ACR TI-RADS',
  fullName: 'ACR TI-RADS — Система візуалізації та звітування щитоподібної залози',
  citation:
    'Tessler FN, Middleton WD, Grant EG, et al. ACR Thyroid Imaging, Reporting and Data System (TI-RADS). JACR. 2017;14(5):587-595. PMID: 28372962.',
  modality: ['US'],
  bodyPart: ['thyroid'],

  criteria: [
    {
      id: 'composition',
      title: 'Склад (composition)',
      options: [
        { id: 'cystic', label: 'Кістозний або майже повністю кістозний', points: 0 },
        { id: 'spongiform', label: 'Губчастий (spongiform)', points: 0 },
        { id: 'mixed', label: 'Змішаний кістозно-солідний', points: 1 },
        { id: 'solid', label: 'Солідний або майже повністю солідний', points: 2 },
      ],
    },
    {
      id: 'echogenicity',
      title: 'Ехогенність',
      options: [
        { id: 'anechoic', label: 'Анехогенний', points: 0 },
        { id: 'hyper_iso', label: 'Гіперехогенний або ізоехогенний', points: 1 },
        { id: 'hypo', label: 'Гіпоехогенний', points: 2 },
        { id: 'very_hypo', label: 'Виражено гіпоехогенний', points: 3 },
      ],
    },
    {
      id: 'shape',
      title: 'Форма',
      options: [
        { id: 'wider', label: 'Ширший ніж високий (wider-than-tall)', points: 0 },
        { id: 'taller', label: 'Вищий ніж широкий (taller-than-wide)', points: 3 },
      ],
    },
    {
      id: 'margin',
      title: 'Контури',
      options: [
        { id: 'smooth', label: 'Рівні', points: 0 },
        { id: 'ill_defined', label: 'Нечіткі', points: 0 },
        { id: 'lobulated', label: 'Часточкові або нерівні', points: 2 },
        { id: 'ete', label: 'Екстратиреоїдне поширення', points: 3 },
      ],
    },
    {
      id: 'foci',
      title: 'Ехогенні вогнища',
      description: 'Оберіть усі, що застосовуються (адитивно)',
      multiSelect: true,
      options: [
        { id: 'none', label: 'Немає або великі хвостоподібні артефакти', points: 0 },
        { id: 'macro', label: 'Макрокальцинати', points: 1 },
        { id: 'peripheral', label: 'Периферичні (rim) кальцинати', points: 2 },
        { id: 'punctate', label: 'Точкові ехогенні вогнища', points: 3 },
      ],
    },
  ],

  score(selections) {
    const comp = selections.composition as string
    const echo = selections.echogenicity as string
    const shape = selections.shape as string
    const margin = selections.margin as string
    const foci = selections.foci as string[] | string

    if (!comp || !echo || !shape || !margin) return null

    // Find points for single-select criteria
    const findPoints = (criterionId: string, value: string): number => {
      const criterion = tiradsCalculator.criteria.find((c) => c.id === criterionId)!
      return criterion.options.find((o) => o.id === value)?.points ?? 0
    }

    let total = 0
    total += findPoints('composition', comp)
    total += findPoints('echogenicity', echo)
    total += findPoints('shape', shape)
    total += findPoints('margin', margin)

    // Echogenic foci — multi-select, additive
    const fociArr = Array.isArray(foci) ? foci : foci ? [foci] : ['none']
    for (const f of fociArr) {
      total += findPoints('foci', f)
    }

    const level = pointsToLevel(total)
    return {
      category: level.level,
      label: level.label,
      description: `Загальний бал: ${total}`,
      management: level.management,
      reportText: `ACR TI-RADS ${level.level} (${total} балів). ${level.management}.`,
    }
  },
}
