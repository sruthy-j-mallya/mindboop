# Code standards

House rules for this repo, adapted from neeto-auth-web (decisions in `.agents/plans/003-code-standards.md`).
Follow them in all new and changed code.

## Frontend (`app/frontend`, TypeScript + React)

### Layout

```
app/frontend/
├── App.tsx              # Providers only (QueryClientProvider, BrowserRouter)
├── Main.tsx             # Top-level <Routes>
├── routes.ts            # Every client path, as one nested object
├── entrypoints/         # Vite entrypoints
├── apis/                # axios.ts, types.ts + one file per Rails resource (HTTP only)
├── hooks/
│   ├── reactQuery/      # use<Resource>Api.ts: TanStack Query hooks, one file per apis/ file
│   └── useXyz.ts        # Reusable non-query hooks
├── stores/              # Zustand stores, only once needed (see Client state)
├── constants/           # index.ts (app-wide), query.ts (QUERY_KEYS)
├── utils/               # index.ts (pure helpers), queryClient.ts
├── components/
│   ├── commons/         # Shared across features (AuthCard, FormField, PrivateRoute)
│   ├── ui/              # shadcn (generated; leave as is)
│   └── <Feature>/       # PascalCase feature folder with index.tsx
├── styles/
└── test/                # Vitest setup + renderWithProviders
```

- A feature or sub-feature is a folder with an `index.tsx` entry. Its children live next to it:
  `Notes/index.tsx`, `Notes/constants.ts`, `Notes/utils.ts`, `Notes/types.ts`, `Notes/Pane/New.tsx`,
  `Notes/Pane/Edit.tsx`, `Notes/Pane/NoteForm.tsx`. Nest folders by UI hierarchy.
- Split code by kind into co-located files: constants in `constants.ts`, helpers in `utils.ts`, types in
  `types.ts`. Any folder at any level (a feature, a sub-feature, `hooks/`, `apis/`, `components/commons/`)
  can have its own. Put each file in the nearest folder that covers every place that uses its contents.
  Promote them to `constants/` or `utils/`, and a component to `components/commons/`, only when a second
  feature needs them.

### Types

- Declare types in a `types.ts` next to the code that uses them, the same way constants go in `constants.ts`
  and helpers in `utils.ts`. `types.ts` is not limited to `apis/`.
- A single small type used only in one file (such as a component's `<Component>Props`) may stay in that file.
  Once a component, hook, `utils.ts` or `constants.ts` file declares more than one or two types, or a type is
  shared by several files, move them to the nearest `types.ts`.
- Export each type by name and import it with `import type { … } from "./types"` (or `@/…/types` from outside
  the feature).
- Types inferred from a value stay beside that value (`type NoteFormValues = z.infer<…>` next to its schema
  in `constants.ts`).

### Imports

- Use the single `@/` alias for anything outside the current feature folder (`@/apis/notes`,
  `@/components/commons/FormField`). Use relative imports only inside the same feature (`./constants`).
- ESLint (`simple-import-sort`) enforces the order, with groups separated by blank lines: side effects,
  `react`, packages, `@/`, relative. Run `pnpm lint --fix` rather than sorting by hand.
- Use `type` for type-only imports (`verbatimModuleSyntax`).

### Components

- One component per file. Name the file after the component in PascalCase. Write it as an arrow function with
  a default export:
  ```tsx
  const NoteCard = ({ note, onDelete }: NoteCardProps) => { … };
  export default NoteCard;
  ```
  The exception is `components/ui`, which keeps the named exports shadcn generates.
- Type props with a `<Component>Props` type next to the component, or in the folder's `types.ts` once the file
  declares several types (see Types).
- Name handlers inside a component `handleX` (`handleSubmit`, `handleLogout`). Name callback props `onX`.
  Don't write inline arrow handlers longer than a call.
- Return early for loading and guard states: `if (isPending) return null;`. Call all hooks before the first
  return.
- New and Edit screens share one form component. Each screen wires up only its mutation and initial values.
- Build large configs that need callbacks (table columns, menus) with a function in `utils.ts`, such as
  `getColumnData({ onDelete })`.
- Prefer small pure helpers and `map`/`filter`/`find` over mutation.

### API layer (`apis/<resource>.ts`)

- Name each file after the Rails resource (`sessions.ts`, `registrations.ts`, `oauth_clients.ts` for
  multi-word resources).
- Import the shared client from `@/apis/axios`. It handles the `/api` base path, the CSRF header,
  camelCase ↔ snake_case conversion, and rejects with `ApiError(status, message)`. Never call `fetch` or
  bare `axios`.
- Write URLs inline. Extract one only when several functions share it: a constant for a static URL
  (`const NOTES_URL = "/notes"`), a helper for a parameterised one
  (`const noteURL = (id: number) => \`/notes/${id}\``). Encode string segments with `encodeURIComponent`. Pass
  query strings through axios `params`, never concatenated by hand.
- Use the standard verb names `fetchList`, `show`, `create`, `update`, `destroy`. Each is a one-liner that
  returns `data`. A function with several arguments takes a single object (`update = ({ id, ...payload })`),
  so it can be passed straight to `useMutation`.
- Default-export one object named after the resource (`export default notesApi;`). Declare and export the
  payload and response types in `apis/types.ts` (this folder's `types.ts`, see Types) and import them with
  `import type { … } from "@/apis/types"`.
- Only HTTP code lives here: no React and no state.

### Server state (`hooks/reactQuery/use<Resource>Api.ts`)

- Server data lives in TanStack Query (v5 object syntax) only. Never copy it into `useState` or a store.
  Read `data` from the query directly.
- Each hook wraps one API function. Name hooks verb-first: `useNotes(filters)`, `useNote(id)`,
  `useCreateNote()`, `useUpdateNote()`, `useDeleteNote()` (existing: `useCurrentUser`, `useLogin`, `useSignup`).
- Destructure what you need from every query and mutation hook. Never keep the result object and read
  properties off it. Rename `mutate` after the action:
  ```tsx
  const { data: notes = [], isPending } = useNotes(filters);
  const { mutate: createNote, isPending: isCreating, error } = useCreateNote();
  createNote(values, { onSuccess: handleClose });
  ```
- Query hooks accept an optional `options` argument (minus `queryKey`/`queryFn`), spread last.
- Mutation hooks own the cache update in `onSuccess` (`invalidateQueries({ queryKey })` or `setQueryData`).
  Callers add their own side effects through `mutate(vars, { onSuccess })`. Never pass `refetch` down as
  a prop.
- Define all query keys in `QUERY_KEYS` (`constants/query.ts`), nested per resource. Use functions for
  parameterised keys (`NOTES: { LIST: (filters) => ["notes", filters] }`). Tests import `QUERY_KEYS` too.
- A non-default `staleTime` is a named constant with the duration in a comment
  (`NOTES_STALE_TIME = 5 * 60_000; // 5 minutes`).
- `utils/queryClient.ts` holds the one `QueryClient` and registers `ApiError` as the default error type, so a
  destructured `error?.message` is typed.

### Client state

- Use component state first, and lift it up when siblings need it.
- When real cross-tree client state appears, add Zustand. Keep one small store per concern in
  `stores/use<Name>Store.ts`, holding state and setters together. Always read from it through a selector:
  `useUserStore((state) => state.setUser)`. Never subscribe to the whole store, and never put server data in a
  store.

### Routing

- Define every client path once in `routes.ts` (`routes.login`, `routes.passwords.edit`). Components never
  hard-code path strings.
- Keep `<Routes>` in `Main.tsx`. Private screens nest under `<PrivateRoute />` from `components/commons`.
- `routes.passwords.edit` must stay in sync with the Rails `edit_password` route that mailers link to.

### Forms

- Use React Hook Form + Zod (`zodResolver`). In the form's `constants.ts`, keep:
  - `<ENTITY>_VALIDATION_SCHEMA`
  - `type <Entity>FormValues = z.infer<…>`
  - `INITIAL_FORM_VALUES`
- Connect fields with `{...register("field")}` on `FormField`, and pass `error={errors.field?.message}`.
  Forms use `noValidate`, so Zod owns client validation.
- Mirror server rules through shared constants (`PASSWORD_MIN_LENGTH`). Server errors still show in the
  form's `role="alert"` slot.
- Send only schema fields. Don't submit raw form state with extra keys.

### Internationalisation

- Not set up yet; plain English strings are fine. If i18n is added later, use react-i18next with
  `t("feature.key")`.

### Naming

| Thing                 | Convention                                         | Example                                   |
| --------------------- | -------------------------------------------------- | ----------------------------------------- |
| Components / folders  | PascalCase                                         | `ResetPassword/index.tsx`, `FormField.tsx` |
| Hooks / stores        | `useCamelCase.ts`                                  | `useSessionsApi.ts`, `useUserStore.ts`    |
| API files             | snake_case, named after the Rails resource         | `apis/oauth_clients.ts`                   |
| Constants             | `SCREAMING_SNAKE_CASE`                             | `QUERY_KEYS`, `PASSWORD_MIN_LENGTH`       |
| Booleans              | `is`/`has`/`show` prefix                           | `isPending`, `hasMore`, `showPane`        |
| Props / JS keys       | camelCase on the client, snake_case on the server  | `emailAddress` ↔ `email_address`          |

The case conversion happens only in `apis/axios.ts` interceptors. Never hand-write snake_case keys in
frontend code.

### Tests

- Put Vitest + Testing Library tests next to the file they cover (`Login/index.test.tsx`). Render through
  `renderWithProviders` from `@/test/utils`.
- Stub the network at the API module (`vi.spyOn(sessionsApi, "create")`), not with `fetch`.
- Query by role, label and text, in both Vitest and Playwright. Use `data-testid` only when there is no
  accessible handle.
- Put Playwright specs in `e2e/`.

## Backend (Rails)

### API controllers

- Put SPA endpoints under `Api::` (no version namespace) in `namespace :api, defaults: { format: :json }`.
  Controllers inherit `Api::BaseController`.
- Keep controllers RESTful and thin. Use only the seven standard actions. For anything else, add a new resource
  controller (`resource :session`, `resources :passwords`). Don't add custom actions.
- Load records in `before_action :set_<resource>` and call `authorize @record` right there.
- Define strong params in a private `<resource>_params` method.
- Errors always use one shape: `{ error: "…" }`.
  - Use `create!`/`update!` and let `BaseController` render validation failures as
    `full_messages.to_sentence` with `:unprocessable_content`. That's the Rack 3 name for 422; don't use
    `:unprocessable_entity`.
  - A Pundit denial renders 403.
- Put search and filtering in small private methods that return early when no filter is given
  (`return scope if params[:search_term].blank?`).
- When `config/routes.rb` grows past one screen, split it into `config/routes/*.rb` loaded with `draw`.

### Authorization (Pundit)

- `Api::BaseController` runs `verify_authorized`, and `verify_policy_scoped` on `index`. Every action must
  call `authorize` (or `policy_scope` on `index`). Only skip with `skip_after_action :verify_authorized` plus
  a comment saying why (as the session, registration and password controllers do).
- Write one policy per model (`NotePolicy < ApplicationPolicy`), with one predicate per action and a nested
  `Scope#resolve`. `pundit_user` is `Current.user`.
- Query collections through `policy_scope(Note)`, never `Note.all`.

### Views (Jbuilder)

- Render JSON with Jbuilder in `app/views/api/<resource>/index|show.json.jbuilder`, through a
  `_<resource>.json.jbuilder` partial. Don't build hashes in controllers.
- `create` and `update` reuse the show view with `render :show, status: …`.
- Paginated lists include a count (`json.notes_count @pagy.count`) once pagination exists.
- Short one-off `{ error }` / `{ message }` responses may stay inline `render json:`.

### Domain logic

| Folder                     | Purpose                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `app/services/<domain>/`   | Service objects (`Notes::ExporterService`), deps passed to `initialize`. Public entry is `#process!` (raises on failure) or `#process` (returns a result). |
| `app/models/concerns/`     | Shared model behaviour, named as adjectives (`Archivable`, `Shareable`)                                 |
| `app/controllers/concerns/`| Shared controller flows (`Authentication`)                                                              |
| `app/policies/`            | Pundit policies                                                                                           |
| `app/jobs/<domain>/`       | `<Action>Job`, mirroring the service folders                                                              |

Keep simple logic on models. Reach for a service when a workflow spans several models or external calls.

### Models

RuboCop's `Layout/ClassStructure` enforces this order:

1. includes and `has_secure_password`
2. constants
3. scopes
4. attributes and `normalizes`
5. enums
6. delegates
7. associations
8. validations
9. callbacks
10. public methods
11. private methods

- App tables use UUID primary keys (generators default to them). Foreign keys need `type: :uuid`. Solid Queue's
  tables stay on `bigint`.
- Soft delete with Discard (`include Discard::Model`), and query those models through `kept`.
- Freeze mutable constants (`KINDS = %w[ a b ].freeze`).
- Use `delegate … prefix: true` instead of wrapper methods.
- Callbacks call private, well-named methods (`after_update :notify_x, if: :y_changed?`).

### Ruby style

`rubocop-rails-omakase`, plus `Rails/TimeZone`, `Rails/Date`, `Layout/ClassStructure` and
`Bundler/OrderedGems` (`.rubocop.yml`). On top of that:

- Use double quotes. Write `%i[ a b ]` with inner spaces. Indent private methods under `private`.
- Leave a blank line after guard clauses.
- Don't write a redundant `return`, and don't use `and`/`or` for control flow.
- Use `Time.current`, `Time.zone` and `Date.current`, never `Time.now` or `Date.today`.
- Keep gems alphabetical within each group, with a comment line above the gem when useful.
- Don't add `# frozen_string_literal: true`.

### Tests (Minitest)

- `test/` mirrors `app/`: `test/models`, `test/controllers/api/<resource>_controller_test.rb`
  (integration tests), `test/policies`, `test/services/<domain>`, `test/jobs`.
- Use FactoryBot factories in `test/factories`. Put shared helpers in `test/support` (for example `sign_in`),
  included from `test/test_helper.rb`.
- Generate test values with Faker (`Faker::Internet.email`, `Faker::Internet.password(min_length: 8)`) in
  factories and tests instead of hard-coding them. Keep literals only where the exact value is the point of
  the test (an expected error message, normalisation input).
- Test names read as sentences: `def test_that_invalid_credentials_are_rejected`. Set up data in `setup`.
- Assert side effects with `assert_difference "Model.count", 1 do … end` and `assert_enqueued_email_with`.
- Every endpoint needs tests for the success path, a validation failure, unauthenticated access and a
  Pundit denial.

## Tooling

- Toolchain is pinned in `mise.toml` and packages are managed with pnpm.
- `.editorconfig`: UTF-8, LF, 2 spaces, final newline.
- The Lefthook pre-commit runs `rubocop -a`, `eslint --fix` and `prettier --write`, re-stages the fixes,
  then typechecks.
- ESLint includes react-hooks, simple-import-sort, sonarjs, security, no-unsanitized and promise. Prettier
  sorts Tailwind classes.
- Docs: put API and architecture notes in `docs/` (`docs/api.md`), update them when endpoints change, and keep
  plans in `.agents/plans/`.
