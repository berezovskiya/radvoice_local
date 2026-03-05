import type { Template } from '../types/template'

export function buildMappingPrompt(template: Template, transcript: string): string {
  const sectionsDescription = template.sections
    .map((s) => {
      if (s.type === 'group' && s.subsections) {
        const subs = s.subsections
          .map((sub) => `    - id: "${sub.id}", title: "${sub.title}", defaultText: "${sub.defaultText}"`)
          .join('\n')
        return `  - id: "${s.id}", title: "${s.title}", type: "group"\n    subsections:\n${subs}`
      }
      return `  - id: "${s.id}", title: "${s.title}", type: "${s.type}", defaultText: "${s.defaultText ?? ''}"`
    })
    .join('\n')

  return `Ти — радіологічний AI-асистент. Твоє завдання — проаналізувати транскрипцію голосової диктовки радіолога та розподілити її фрагменти по секціях радіологічного шаблону.

ШАБЛОН:
Назва: ${template.name}
Модальність: ${template.modality}
Секції:
${sectionsDescription}

ТРАНСКРИПЦІЯ:
"""
${transcript}
"""

ПРАВИЛА:
1. Проаналізуй транскрипцію та визнач, які секції шаблону згадуються.
2. Для кожної згаданої секції визнач action:
   - "replaced" — лікар описав патологію або інші знахідки, що замінюють дефолтний текст норми. В newText запиши медично коректний текст українською.
   - "confirmed_normal" — лікар явно підтвердив норму для цієї секції. В newText залиш дефолтний текст без змін.
   - "not_mentioned" — лікар не згадав цю секцію. В newText залиш дефолтний текст.
3. Для секцій типу "group" — маппінг виконується на рівні subsections (використовуй id підсекції).
4. Для секцій "clinical_info" та "recommendations" — маппінг тільки якщо лікар явно їх озвучив.
5. Зберігай sourceFragments з точними позиціями startChar/endChar відносно початку транскрипції.
6. Фрагменти тексту, які не вдалося прив'язати до жодної секції, додай в unmappedFragments з reason.
7. Медична термінологія повинна бути коректною українською.
8. НЕ вигадуй інформацію, яку лікар не сказав.
9. НЕ дублюй один фрагмент транскрипції в кількох секціях.
10. TNM-стадіювання ЗАВЖДИ писати ЛАТИНИЦЕЮ: T, N, M (не кирилицею Т, Н, М). Приклади: cT3bN1M0, T2, N0, M1. Це стосується всіх секцій, включаючи висновок.

ВИХІДНИЙ ФОРМАТ (строго JSON, без коментарів):
{
  "sectionUpdates": [
    {
      "sectionId": "brain_parenchyma",
      "action": "replaced",
      "newText": "...",
      "sourceFragments": [
        { "text": "...", "startChar": 0, "endChar": 50 }
      ]
    }
  ],
  "unmappedFragments": [
    { "text": "...", "startChar": 200, "endChar": 250, "reason": "..." }
  ]
}

Відповідай ТІЛЬКИ валідним JSON. Без пояснень, без markdown.`
}
