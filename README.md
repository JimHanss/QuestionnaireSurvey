# QuestionnaireSurvey

A pure front-end Software Development Requirements Collection demo built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- Formik
- Yup
- Vitest
- Apache ECharts
- ESLint
- Prettier

## Features

- Dynamic questionnaire with 3 sections and 13 simulated questions
- Conditional decision paths based on previous answers
- Configurable required and optional questions
- Skip support for optional questions
- Local draft autosave and restore
- Delivery readiness summary and open follow-up tracking
- Generated report that marks answered, skipped, unanswered, and not-applicable items
- Markdown export and print-friendly report actions
- ECharts summary for section completion
- Unit tests for flow logic and questionnaire component behavior

## Directory Structure

```text
QuestionnaireSurvey/
├─ src/
│  ├─ App.tsx
│  └─ features/
│     └─ questionnaire/
│        ├─ components/
│        ├─ data/
│        ├─ utils/
│        └─ types.ts
├─ README.md
├─ INTERVIEW_GUIDE_ZH.md
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js
├─ eslint.config.js
└─ prettier.config.cjs
```

### `src/`

The main application source directory.

- `App.tsx`: the top-level orchestration layer. It wires Formik, questionnaire flow state, session draft persistence, and report generation together.
- `features/`: feature-oriented code organization. The current app is centered around the questionnaire feature.

### `src/features/questionnaire/`

Contains all questionnaire-related business logic and UI.

- `components/`: presentational and interactive UI components used by the questionnaire flow.
- `data/`: static questionnaire configuration, including sections, questions, option lists, and conditional visibility rules.
- `utils/`: pure utility logic such as flow derivation, report building, and draft persistence.
- `types.ts`: shared TypeScript types for questions, sections, answers, report rows, summaries, and draft state.

### `src/features/questionnaire/components/`

UI building blocks for the questionnaire experience.

- `QuestionnaireHeader.tsx`: header area with the app title and session draft status.
- `DraftStatusBadge.tsx`: isolated draft-saving status badge so header updates do not force unrelated UI work.
- `JourneyProgress.tsx`: top “bus line” progress component that shows the current section and completed stops.
- `QuestionnaireSectionPanel.tsx`: the main question area for the active section, including navigation buttons and section summary.
- `QuestionCard.tsx`: reusable card for rendering a single question, including field input, status badges, skip action, and validation feedback.
- `ReportPanel.tsx`: final report view with summary cards, follow-up queue, detailed section results, export, and print actions.

### `src/features/questionnaire/data/`

Questionnaire definitions live here.

- `questionnaire.ts`: section metadata and all simulated questions. This is the main place to update wording, options, required flags, and branching conditions.

### `src/features/questionnaire/utils/`

Reusable business and infrastructure helpers.

- `questionFlow.ts`: derives visible questions, section stats, follow-up items, report rows, and questionnaire summary from the current answers.
- `draftStorage.ts`: saves, loads, and clears the questionnaire draft in `sessionStorage`.
- `reportExport.ts`: formats the final report as Markdown and supports report download/export actions.
- `*.test.ts`: unit tests for the corresponding utility modules.

### Root files

- `README.md`: project overview, commands, and usage notes.
- `INTERVIEW_GUIDE_ZH.md`: Chinese interview walkthrough and Q&A notes for presenting the project.
- `package.json`: dependency list and npm scripts.
- `vite.config.ts`: Vite build and development configuration.
- `tailwind.config.js`: Tailwind CSS theme and scanning configuration.
- `eslint.config.js`: linting rules and code quality checks.
- `prettier.config.cjs`: formatting rules for consistent code style.

## How To Customize Questions

The main questionnaire content lives in:

- `src/features/questionnaire/data/questionnaire.ts`

You can update this file to:

- add or remove sections
- add or remove questions
- change question wording
- mark questions as required or optional
- allow or disable skipping
- configure option lists for radio, select, and checkbox questions
- define conditional visibility rules with `visibleWhen`

Each question is configuration-driven. A typical question includes:

- `id`: unique key for the answer model
- `sectionId`: which section the question belongs to
- `type`: `text`, `textarea`, `radio`, `checkbox`, or `select`
- `title`: question title shown in the UI
- `helperText`: supporting explanation under the title
- `required`: whether the question must be answered
- `skippable`: whether the user can defer it
- `options`: option list for selection-based questions
- `visibleWhen`: rule for conditional branching

## How The Dynamic Flow Works

The dynamic questionnaire behavior is driven by the current answer state.

Flow logic is implemented in:

- `src/features/questionnaire/utils/questionFlow.ts`

At runtime, the app:

1. reads the questionnaire configuration
2. checks which questions are visible based on prior answers
3. validates only the visible questions in the active section
4. tracks answered, skipped, unanswered, and hidden questions
5. derives the final report and follow-up queue from the same answer state

This means the form view and the report view stay consistent, because both are generated from the same derived questionnaire state.

## How To Extend With New Question Types

If you want to introduce a new question type, the main places to update are:

1. `src/features/questionnaire/types.ts`
   Add the new value to `QuestionType`.
2. `src/features/questionnaire/components/QuestionCard.tsx`
   Add rendering and change handling for the new field type.
3. `src/features/questionnaire/utils/questionFlow.ts`
   Confirm answer formatting and answer detection still behave correctly.
4. `src/features/questionnaire/data/questionnaire.ts`
   Add questions that use the new type.
5. Optional: add tests in `QuestionCard.test.tsx` or utility tests

For example, if you add a `date` type, you would:

- extend `QuestionType` with `date`
- render a date input in `QuestionCard.tsx`
- make sure the answer is stored in the expected string format
- verify required validation still works
- add a small test to confirm the new field renders and updates correctly

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:coverage`

## Suggested coverage focus

- `src/features/questionnaire/utils/questionFlow.ts`
- `src/features/questionnaire/components/QuestionCard.tsx`
- `src/features/questionnaire/utils/draftStorage.ts`
- `src/features/questionnaire/utils/reportExport.ts`

Running `npm run test:coverage` will generate a console summary and an HTML report in `coverage/index.html`.