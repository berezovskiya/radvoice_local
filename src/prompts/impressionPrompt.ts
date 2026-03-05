import type { Template } from '../types/template'
import type { MappingResult } from '../types/mapping'

/** Section IDs that are NOT findings — excluded from impression generation input */
const EXCLUDED_SECTION_IDS = new Set([
  'patient_info', 'patient_name', 'patient_dob', 'patient_id', 'exam_date',
  'clinical_info', 'technique', 'quality', 'comparison',
  'impression', 'recommendations',
])

interface FilledSection {
  title: string
  text: string
}

/**
 * Collects all filled findings from template + mapping result.
 * Resolves text the same way as buildReportOutput: mapping newText > defaultText.
 */
function collectFindings(template: Template, mapping: MappingResult): FilledSection[] {
  const sections: FilledSection[] = []

  for (const section of template.sections) {
    if (EXCLUDED_SECTION_IDS.has(section.id)) continue

    if (section.type === 'group' && section.subsections) {
      for (const sub of section.subsections) {
        if (EXCLUDED_SECTION_IDS.has(sub.id)) continue
        const update = mapping.sectionUpdates.find((u) => u.sectionId === sub.id)
        const text = (update?.action === 'replaced' || update?.action === 'auto_normal')
          ? update.newText
          : sub.defaultText
        if (text) sections.push({ title: sub.title, text })
      }
    } else {
      const update = mapping.sectionUpdates.find((u) => u.sectionId === section.id)
      const text = (update?.action === 'replaced' || update?.action === 'auto_normal')
        ? update.newText
        : (section.defaultText ?? '')
      if (text) sections.push({ title: section.title, text })
    }
  }

  return sections
}

export function buildImpressionPrompt(template: Template, mapping: MappingResult): string {
  const findings = collectFindings(template, mapping)
  const findingsText = findings.map((f) => `  ${f.title}: ${f.text}`).join('\n')

  return `Ти — радіологічний AI-асистент. На основі наданих знахідок сформулюй лаконічний висновок (ВИСНОВОК / IMPRESSION) радіологічного звіту українською мовою.

МОДАЛЬНІСТЬ: ${template.modality}
ОБЛАСТЬ ДОСЛІДЖЕННЯ: ${template.bodyPart}
НАЗВА ШАБЛОНУ: ${template.name}

ЗНАХІДКИ:
${findingsText}

ПРАВИЛА:
1. Висновок має бути стислим та структурованим.
2. Перелічи ключові знахідки, починаючи з найважливіших (патологія першою).
3. Якщо всі знахідки описують норму — напиши: "Патологічних змін не виявлено." або "МР-картина без патологічних змін." (відповідно до модальності).
4. TNM-стадіювання — ЗАВЖДИ ЛАТИНИЦЕЮ (T, N, M, не кирилицею).
5. НЕ вигадуй інформацію, якої немає у знахідках.
6. Якщо є підозра на діагноз — сформулюй як "МР-ознаки можуть відповідати..." або "МР-картина характерна для..."
7. Відповідай ТІЛЬКИ текстом висновку. Без заголовків, без markdown, без нумерації, без лапок.`
}
