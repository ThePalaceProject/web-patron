---
name: translate
description: Translate untranslated i18next keys into French, Italian, German, and Spanish, or re-check the translations for specific source files. Runs `npm run translations:status` and writes values into public/locales using the project's library-lending termbase. Use when asked to translate a locale, fill in missing translations, finish a language, or verify the translations for a component, file, or directory. Does not add `t(...)` calls, `<Trans />` components, or run extraction — those stay with the developer.
---

# Translate

Fill in the non-English values in `public/locales/`. This app supports **en, fr, it, de, es**
(EFIGS order); English is the source of truth and the other four are translated from it.

## Scope

This skill writes translated values. That is all it does.

- It **never** edits `public/locales/en/` — English is the source, not a target.
- It **never** edits anything under `src/`. Adding `t(...)` calls and `<Trans />` components is
  the developer's job.
- It **never** runs `translations:extract`, `translations:sync`, or `translations:lint`.
- A key that is **missing** rather than empty is a signal to hand back to the developer, not a
  thing to fix by hand.

The only command that decides what work exists is `npm run translations:status`.

## Step 1 — Parse the arguments

Two independent dimensions, both optional, freely combined. An argument matching a supported
locale code (`fr`, `it`, `de`, `es`) is a locale; anything else is a path.

| Invocation                                                    | Meaning                       |
| ------------------------------------------------------------- | ----------------------------- |
| `/translate`                                                  | Locale mode, all four locales |
| `/translate de` / `/translate de es`                          | Locale mode, narrowed         |
| `/translate src/components/BookStatus.tsx`                    | File mode, all four locales   |
| `/translate de src/components/`                               | File mode, German only        |
| `/translate src/components/BookStatus.tsx src/auth/Login.tsx` | File mode, several files      |

`en` is never a target. A directory argument recurses over `.tsx`, `.ts`, and `.jsx`, skipping
`__tests__/`, `src/test-utils/`, and `*.stories.tsx` — the same set `i18next.config.ts` ignores.

## Step 2 — Build the work list

**Locale mode**, per locale:

```bash
npm run translations:status -- <locale> --hide-translated
```

**File mode**, per locale — the same command **without** `--hide-translated`, so already
translated keys are visible and can be re-checked:

```bash
npm run translations:status -- <locale>
```

The `--` is required for npm to forward the arguments. The output looks like this:

```
Key Status for "de":
Overall            [■■■■■□□□□□□□□□□□□□□□] 25% (44/175 keys)
         131 untranslated

Namespace: common
Namespace Progress [□□□□□□□□□□□□□□□□□□□□] 0% (0/34 keys)
  ~ actions.borrow  (untranslated)
  ✓ actions.cancel
  ✗ actions.somethingNew  (absent)

Namespace: translations
  ○ utils.book.more_many  (optional plural form)
```

Read it as:

- The `Namespace: <ns>` header tells you which file the keys below it live in —
  `public/locales/<locale>/<ns>.json`.
- `✓` translated, `~` present but empty, `○` an fr/it/es-only plural variant, `✗` absent from the
  file entirely.
- **The command exits 1 whenever anything is incomplete.** That is the normal case here, not a
  failure. Do not treat a non-zero exit as an error or abort on it.

### Step 2b — File mode only: narrow to the file's keys

Two passes, unioned:

1. **Literal scan.** Read each target file and collect every literal key in a `t("key", ...)`
   call or a `<Trans i18nKey="key">` component. Include `common`-namespace calls, which name
   their namespace explicitly: `t("actions.borrow", "Borrow", { ns: "common" })`.
2. **Prefix cross-check.** Derive the file's key prefix from the naming scheme in the README's
   `## Translations` section — `BookStatus.tsx` → `bookStatus.`, `signed-out.tsx` → `signedOut.`,
   `index.tsx` inherits its parent directory name, Next dynamic segments drop the brackets — and
   collect every matching key from `public/locales/en/translations.json`.

The union is the work list. **Report, but do not act on**, any prefix key the literal scan did not
find: it is either a dynamic call site or a dead key, and both are the developer's call.

Filter the Step 2 status output down to this list before continuing.

## Step 3 — Act on the key states

| State               | Action                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~` untranslated    | Translate it.                                                                                                                                                          |
| `○` optional plural | Translate it. Write real content, never an empty string.                                                                                                               |
| `✗` absent          | **Do not hand-write it.** Report it and tell the developer to run `npm run translations:extract` — an absent key means the locale files are out of sync with the code. |
| `✓` translated      | Locale mode: skip. File mode: audit it (Step 3c).                                                                                                                      |

### Step 3c — File mode only: auditing an already-translated key

The default is to leave it alone. Rewrite **only** when the existing value has a real defect:

- a `{{placeholder}}` that was translated, reordered, case-changed, or dropped;
- a `<Trans>` element tag such as `<2></2>` damaged, dropped, or wrapped around the wrong phrase;
- a glossary term rendered differently from the termbase, or inconsistently with the same term
  elsewhere in the catalogs;
- wrong register — informal where the glossary requires formal, or the Italian
  buttons-take-imperative rule violated;
- an `actions.*` progress form identical to its idle label plus `...`;
- a borrow-vs-lend inversion, where the string tells the patron the library is lending;
- a missing or empty plural category the locale requires;
- drift from a changed English source — compare against the current `en` value.

Anything that is merely "could be phrased better" is **not** a defect. Report it as confirmed and
move on; a quiet diff is worth more than a marginally nicer string.

Finish with a per-locale tally — `N confirmed, M corrected, K reported` — and for each correction
show the before, the after, and which rule it broke.

### Step 3d — The one thing `status` cannot see

`LanguageSelector.tsx` builds its key from a template literal:

```ts
t(`languageSelector.languageName.${lang.toUpperCase()}`);
```

The extractor cannot evaluate that, so those keys never appear in `status` output, in
`translations:ci`, or anywhere else. Nothing in the toolchain will ever tell you one is missing.

Always in locale mode, and in file mode whenever `LanguageSelector.tsx` is among the targets,
check the grid by hand after processing the status output. Every locale file needs a
`languageSelector.languageName.XX` entry for **every** supported language — with five locales that
is 25 entries. Adding a language means adding a row _and_ a column.

Language names are written in the **file's own language**, not as endonyms: `fr` reads
`"Anglais"`, not `"English"`.

## Step 4 — Write the values

Read `references/glossary.md` before writing anything. It fixes the register, the domain
termbase, the do-not-translate list, and the length policy, and consistency across ~800 strings
depends on it.

Then write into `public/locales/<locale>/<namespace>.json`, keeping each file sorted by key.

Non-negotiables — the glossary carries the reasoning:

- Copy every `{{placeholder}}` **verbatim**, including case. Never translate the token name, add
  spaces inside the braces, or reorder its characters.
- Preserve `<Trans>` element tags such as `<2></2>` exactly, wrapped around the equivalent phrase
  in the target language.
- **Never leave a value empty.** `next-i18next.config.js` sets `returnEmptyString: false`, so an
  empty value silently renders the English default — an untranslated locale looks like working
  software.
- Keep `actions.*` and `nav.*` short. They land in buttons and nav items where overflow is a real
  layout bug.
- Write out every plural category the locale requires: en/de need `_one`/`_other`; fr/it/es add
  `_many`. Never scaffold one empty.

## Step 5 — Verify

```bash
npm run translations:status -- <locale> --hide-translated
```

for each locale you touched.

- **Locale mode**: expect `🎉 All keys are translated for "<locale>"`.
- **File mode**: expect no remaining `~` line among the file's keys. Other keys may still be
  untranslated — that is fine and not your concern.

If the language-name grid changed, also run:

```bash
npx jest src/components/__tests__/LanguageSelector.test.tsx
```

Then report: any `✗ absent` keys deliberately left alone, any prefix keys the literal scan did not
find, and the file-mode audit tally from Step 3c.
