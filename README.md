# RadReport Local

Локальний desktop-додаток для радіологів — AI-driven структуроване радіологічне репортування з голосовою диктовкою.

## Що це?

RadReport Local трансформує голосову диктовку радіолога в структурований радіологічний звіт за допомогою AI. Додаток використовує pre-filled шаблони з описом норми та інтелектуально розподіляє надиктований текст по відповідних секціях.

## Ключові можливості

- **Голосова диктовка** — вбудований запис з мікрофона + транскрипція (Whisper API)
- **Система шаблонів** — JSON шаблони з pre-filled нормою для різних модальностей
- **AI-маппінг** — LLM розподіляє фрагменти диктовки по секціях шаблону
- **Traceability** — hover на секцію звіту показує джерельний фрагмент диктовки
- **Unmapped text** — невикористані фрагменти підсвічуються помаранчевим
- **Inline editing** — можливість ручного редагування кожної секції

## Tech Stack

- Electron + React + TypeScript
- Tailwind CSS
- Zustand (state management)
- OpenRouter API (LLM)
- OpenAI Whisper API (транскрипція)

## Документація

- [ARCHITECTURE.md](./ARCHITECTURE.md) — архітектура додатку
- [FEATURES.md](./FEATURES.md) — функціональні вимоги
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — план реалізації

## Натхнення

- [deepcOS® AIR®](https://www.deepc.ai/products/applications/air)
- [RADPAIR](https://radpair.com/)
- [VoxRad](https://github.com/drankush/VoxRad)

## Ліцензія

Private — для особистого використання.
