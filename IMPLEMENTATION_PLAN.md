# RadReport Local — План реалізації MVP

## Огляд проєкту

Локальний Electron desktop-додаток для радіологів, натхненний [deepcOS® AIR®](https://www.deepc.ai/products/applications/air) та [RADPAIR](https://radpair.com/). Трансформує голосову диктовку в структуровані радіологічні звіти з AI-маппінгом та двонаправленим traceability.

---

## Структура проєкту

```
local_radreporting_project/
├── ARCHITECTURE.md          # Архітектурна документація
├── FEATURES.md              # Функціональні вимоги
├── IMPLEMENTATION_PLAN.md   # Цей файл — план реалізації
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.yml
├── tailwind.config.js
├── postcss.config.js
│
├── electron/                # Electron main process
│   ├── main.ts              # Entry point
│   ├── preload.ts           # Preload script (IPC bridge)
│   └── store.ts             # electron-store (settings, API keys)
│
├── src/                     # React renderer
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Root component + routing
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   └── AppLayout.tsx        # 3-панельний layout
│   │   ├── Toolbar/
│   │   │   └── Toolbar.tsx          # Top toolbar (шаблон, запис, обробка)
│   │   ├── TemplatePanel/
│   │   │   └── TemplatePanel.tsx    # Ліва панель — шаблон з нормою
│   │   ├── ReportPanel/
│   │   │   └── ReportPanel.tsx      # Центральна панель — фінальний звіт
│   │   ├── DictationPanel/
│   │   │   └── DictationPanel.tsx   # Права панель — транскрипція
│   │   ├── UnmappedBar/
│   │   │   └── UnmappedBar.tsx      # Нижня панель — невикористаний текст
│   │   ├── AudioRecorder/
│   │   │   ├── AudioRecorder.tsx    # Кнопка запису + waveform
│   │   │   └── WaveformVisualizer.tsx
│   │   ├── TemplateSelector/
│   │   │   └── TemplateSelector.tsx # Dropdown вибору шаблону
│   │   ├── Settings/
│   │   │   └── SettingsModal.tsx    # Модалка налаштувань
│   │   └── common/
│   │       ├── TracedSection.tsx    # Секція з hover-traceability
│   │       └── TracedFragment.tsx   # Фрагмент диктовки з hover
│   │
│   ├── services/
│   │   ├── whisperService.ts        # Whisper API транскрипція
│   │   ├── llmService.ts            # OpenRouter API маппінг
│   │   ├── templateService.ts       # Завантаження/збереження шаблонів
│   │   └── audioService.ts          # Запис аудіо
│   │
│   ├── store/
│   │   ├── useAppStore.ts           # Zustand: глобальний стан
│   │   ├── useTemplateStore.ts      # Zustand: шаблони
│   │   └── useMappingStore.ts       # Zustand: маппінг результати
│   │
│   ├── types/
│   │   ├── template.ts              # Template, Section, Subsection
│   │   ├── mapping.ts               # MappingResult, SourceFragment, etc.
│   │   ├── dictation.ts             # DictationEntry, DictationHistory
│   │   └── settings.ts              # AppSettings
│   │
│   ├── prompts/
│   │   └── mappingPrompt.ts         # Системний промт для LLM
│   │
│   └── assets/
│       └── styles/
│           └── globals.css          # Tailwind base styles
│
└── templates/                # JSON шаблони радіологічних звітів
    ├── mri-brain-standard.json
    ├── ct-chest-standard.json
    └── ct-abdomen-standard.json
```

---

## Фази реалізації

### Phase 1: Scaffolding (Каркас)
**Мета**: Робочий Electron + React + Tailwind додаток з базовим layout

**Кроки:**
1. Ініціалізація проєкту (package.json, залежності)
2. Налаштування Electron (main.ts, preload.ts)
3. Налаштування Vite для React + TypeScript
4. Налаштування Tailwind CSS
5. Створення базового AppLayout з 3 панелями
6. Створення Toolbar компонента
7. Перевірка: додаток запускається, відображає layout

**Результат**: Порожній додаток з 3-панельним інтерфейсом

---

### Phase 2: Система шаблонів
**Мета**: Завантаження та відображення JSON шаблонів

**Кроки:**
1. Визначення TypeScript типів (Template, Section)
2. Створення 3 початкових шаблонів (JSON файли)
3. Реалізація templateService (читання JSON через IPC)
4. Реалізація TemplateSelector (dropdown)
5. Реалізація TemplatePanel (відображення секцій з дефолтним текстом)
6. Zustand store для шаблонів
7. Перевірка: обираєш шаблон → бачиш секції з текстом норми в лівій панелі

**Результат**: Працюючий вибір та відображення шаблонів

---

### Phase 3: Голосовий запис та транскрипція (Append Mode)
**Мета**: Запис голосу + транскрипція через Whisper API + підтримка множинних диктовок

**Кроки:**
1. Реалізація audioService (Web Audio API + MediaRecorder)
2. Реалізація AudioRecorder компонента з кнопкою запис/стоп
3. WaveformVisualizer — audio level meter
4. Реалізація whisperService (відправка аудіо на Whisper API)
5. Реалізація SettingsModal з полем для API ключа
6. electron-store для збереження ключа
7. **Append Mode в DictationPanel**:
   - Zustand: `dictationHistory: DictationEntry[]` (масив записів)
   - Кожна нова транскрипція додається до масиву (не затирає попередні)
   - Візуальний роздільник між записами (лінія + timestamp)
   - Лічильник "Диктовка N з M"
   - Кнопка "Очистити все" з діалогом підтвердження
8. При "Обробити" — конкатенація всіх записів в один текст для LLM
9. Перевірка: записуєш голос → бачиш текст → записуєш ще → текст додається → всі записи видно

**Результат**: Працюючий голосовий ввід з транскрипцією та підтримкою множинних записів

---

### Phase 4: AI-маппінг (Core)
**Мета**: LLM розподіляє диктовку по секціях шаблону

**Кроки:**
1. Розробка промту для LLM (mappingPrompt.ts)
2. Реалізація llmService (OpenRouter API, structured JSON output)
3. Визначення типів MappingResult, SourceFragment, TargetSection
4. Zustand store для маппінгу (useMappingStore)
5. Кнопка "Обробити" в Toolbar
6. Парсинг відповіді LLM → заповнення ReportPanel
7. Виділення unmapped фрагментів → UnmappedBar
8. Кольорове кодування секцій в ReportPanel
9. Перевірка: обираєш шаблон → диктуєш → "Обробити" → бачиш структурований звіт

**Результат**: Повний pipeline від голосу до звіту

---

### Phase 5: Traceability
**Мета**: Двонаправлена підсвітка між звітом та диктовкою

**Кроки:**
1. Реалізація TracedSection — обгортка для секції звіту з hover
2. Реалізація TracedFragment — обгортка для фрагменту диктовки з hover
3. Zustand: hoveredMappingId state
4. При hover на TracedSection → виділення відповідного TracedFragment
5. При hover на TracedFragment → виділення відповідної TracedSection
6. CSS transitions для плавної підсвітки
7. Tooltip з деталями (source text → target section)
8. Перевірка: hover на секцію звіту ↔ підсвітка фрагменту диктовки

**Результат**: Повна traceability між диктовкою та звітом

---

### Phase 6: Фіналізація звіту та lifecycle пацієнта
**Мета**: Фіналізація звіту → clipboard + цикл "новий пацієнт"

**Кроки:**
1. Inline editing секцій в ReportPanel (contentEditable або textarea)
2. **Кнопка "Фіналізувати звіт"** (яскрава, зелена, в toolbar):
   - Збір тексту з усіх секцій ReportPanel
   - Генерація двох форматів:
     - **Plain text** — заголовки секцій великими літерами
     - **HTML** — заголовки секцій та підсекцій **жирним** (`<b>`)
   - **Dual clipboard** через Electron IPC → `clipboard.write({ text, html })`
     (Word підхоплює HTML з bold заголовками, прості системи — plain text)
   - Toast-повідомлення "Звіт скопійовано в буфер обміну"
3. **Кнопка "Новий звіт"** (з'являється після фіналізації або завжди доступна):
   - Діалог підтвердження: "Почати новий звіт? Поточний буде втрачено."
   - Reset стану: очищення dictationHistory, mappingResults, повернення шаблону до дефолту
   - Шаблон залишається обраним (той самий тип дослідження)
4. Перевірка: повний цикл — диктуєш → обробляєш → редагуєш → фіналізуєш → вставляєш в Word → новий звіт

**Результат**: Повний MVP — від голосу до готового звіту в буфері обміну з підтримкою послідовної роботи з пацієнтами

---

## Технічні деталі

### AI Prompt (скорочений приклад)

```
Ти — радіологічний AI-асистент. Твоє завдання — проаналізувати транскрипцію
голосової диктовки радіолога та розподілити її фрагменти по секціях
радіологічного шаблону.

ВХІДНІ ДАНІ:
1. Шаблон (JSON з секціями та дефолтним текстом норми)
2. Транскрипція голосової диктовки (plain text)

ВИХІДНІ ДАНІ (JSON):
{
  "sectionUpdates": [
    {
      "sectionId": "brain_parenchyma",
      "action": "replaced",
      "newText": "...",
      "sourceFragments": [
        { "text": "...", "startChar": 45, "endChar": 120 }
      ]
    }
  ],
  "unmappedFragments": [
    { "text": "...", "startChar": 200, "endChar": 250, "reason": "..." }
  ]
}

ПРАВИЛА:
- Якщо лікар описав нормальний стан секції — action: "confirmed_normal"
- Якщо лікар описав патологію — action: "replaced", newText з медичною мовою
- Якщо лікар не згадав секцію — action: "not_mentioned"
- Зберігай точні позиції символів (startChar/endChar) в транскрипції
- Медична термінологія повинна бути коректною українською
- Не вигадуй інформацію, яку лікар не сказав
```

### IPC Channels (Electron ↔ React)

| Channel | Напрямок | Опис |
|---------|----------|------|
| `template:list` | renderer → main | Отримати список шаблонів |
| `template:load` | renderer → main | Завантажити конкретний шаблон |
| `template:save` | renderer → main | Зберегти шаблон |
| `settings:get` | renderer → main | Отримати налаштування |
| `settings:set` | renderer → main | Зберегти налаштування |
| `settings:getApiKey` | renderer → main | Отримати API ключ (encrypted) |
| `settings:setApiKey` | renderer → main | Зберегти API ключ (encrypted) |
| `clipboard:writeRich` | renderer → main | Dual clipboard: plain text + HTML (для bold заголовків у Word) |

---

## Залежності (package.json)

### Production
- `electron` — desktop shell
- `react`, `react-dom` — UI
- `zustand` — state management
- `electron-store` — persistent settings
- `tailwindcss` — styling

### Development
- `typescript`
- `vite`
- `@vitejs/plugin-react`
- `vite-plugin-electron`
- `electron-builder`
- `postcss`, `autoprefixer`

---

## Критерії прийняття MVP

1. ✅ Додаток запускається як desktop app на macOS
2. ✅ Можна обрати шаблон з 3 доступних
3. ✅ Шаблон відображається з pre-filled нормою
4. ✅ Можна записати голос і отримати транскрипцію
5. ✅ **Множинні диктовки**: кожен новий запис ДОДАЄТЬСЯ до попередніх
6. ✅ AI розподіляє диктовку (всі накопичені записи) по секціях шаблону
7. ✅ Фінальний звіт відображається з кольоровим кодуванням
8. ✅ Hover traceability працює в обох напрямках
9. ✅ Невикористаний текст підсвічується помаранчевим
10. ✅ Можна вручну відредагувати будь-яку секцію
11. ✅ **Кнопка "Фіналізувати"** копіює форматований звіт в clipboard
12. ✅ **Кнопка "Новий звіт"** скидає стан для наступного пацієнта
