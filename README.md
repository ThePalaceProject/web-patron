# web-patron

<!-- <div>
<a aria-label="Docker images" href="[https://hub.docker.com/r/thepalaceproject/web-patron/tags](https://hub.docker.com/r/thepalaceproject/web-patron/tags)">
<img alt="Docker Image Version (latest semver)" src="[https://img.shields.io/docker/v/thepalaceproject/web-patron?label=Docker Hub&logo=docker&sort=semver](https://img.shields.io/docker/v/thepalaceproject/web-patron?label=Docker%20Hub&logo=docker&sort=semver)">
</a>
<img alt="GitHub Workflow Status" src="[https://img.shields.io/github/workflow/status/thepalaceproject/web-patron/CI?label=Tests&logo=github](https://img.shields.io/github/workflow/status/thepalaceproject/web-patron/CI?label=Tests&logo=github)">
<img alt="GitHub Workflow Status" src="[https://img.shields.io/github/workflow/status/thepalaceproject/web-patron/Production](https://img.shields.io/github/workflow/status/thepalaceproject/web-patron/Production) Release?label=Build%20%28master%29&logo=github">
<img alt="GitHub Workflow Status" src="[https://img.shields.io/github/workflow/status/thepalaceproject/web-patron/Publish](https://img.shields.io/github/workflow/status/thepalaceproject/web-patron/Publish) beta?label=Build%20%28beta%29&logo=github">
</div> -->

An OPDS web catalog client for library patrons.

This app supports discovery, borrowing, downloading, and returning of material. It does not directly support viewing.

## Background

The `web-patron` application serves as a way for libraries to publish their collections to the web. A library _must_ be part of a [Circulation Manager](https://github.com/ThePalaceProject/circulation) and _can_ be registered to a [Library Registry](https://github.com/ThePalaceProject/library-registry). A Library Registry provides details about a library, and a Circulation Manager provides a library's collection of eBooks and audiobooks in OPDS format. Registering with The Palace Project's Library Registry is how libraries can show up in the Palace mobile application and the [Community Demo](#demo) of this app. In order to have a web version of your library catalog, you can deploy this app.

This app can support many libraries, each at their own url: `http://example.com/library1` can be one library, and `http://example.com/library2` another library. You configure the libraries for the app in the [config file](#configuration-file).

<!-- ## Community Demo

- Community Preview - [https://web.librarysimplified.org](https://web.librarysimplified.org)

In addition to the preview of the production branch, we also have previews of the `qa` and `dev` branches:

- qa - [https://qa-web.librarysimplified.org](https://qa-web.librarysimplified.org)
- dev - [https://dev-web.librarysimplified.org](https://dev-web.librarysimplified.org)

Finally, every PR in this repository has a unique preview deployment so proposed changes can be previewed with any library in the community config file.

__To have your library added to the demo, register it with NYPL's Library Registry.__ -->

# Table of Contents

- [web-patron](#web-patron)
  - [Background](#background)
  <!-- * [Demo](#community-demo) -->
- [Configuring the App](#configuring-the-app)
  - [Configuration File](#configuration-file)
    - [Configuration Options](#configuration-options)
    - [Media Support](#media-support)
  - [Environment Variables](#environment-variables)
  - [Manager, Registry, and Application Configurations](#manager--registry--and-application-configurations)
  - [Libraries and Registries Configuration Settings](#libraries-and-registries-configuration-settings)
  - [Authentication Document Caching](#authentication-document-caching)
- [Development](#development)
  - [Contributing](#contributing)
  - [Installing Dependencies](#installing-dependencies)
  - [Running the Application](#running-the-application)
    - [ENV Vars and Building](#env-vars-and-building)
    - [Useful Scripts](#useful-scripts)
  - [Testing](#testing)
    - [Context and useful spies](#context-and-useful-spies)
    - [Running tests](#running-tests)
    - [Example](#example)
  - [Links and Routing](#links-and-routing)
  - [Translations](#translations)
    - [Packages used for translations](#packages-used-for-translations)
    - [Configuration files](#configuration-files)
    - [JSON structure for translation files](#json-structure-for-translations-files)
    - [Key naming scheme](#key-naming-scheme)
    - [Interpolation](#interpolation)
    - [Translation process](#translation-process)
    - [Changing the app language](#changing-the-app-language)
- [Deploying](#deploying)
  - [Build a docker container](#build-a-docker-container)
    - [Running the docker container](#running-the-docker-container)
    - [From the command line](#from-the-command-line)
    - [Using `docker-compose`](#using--docker-compose-)
    - [Helpful commands](#helpful-commands)
    - [Credits](#credits)

# Configuring the App

## Configuration File

The app is configured with a YAML file. Point the app at it by setting the `CONFIG_FILE` environment variable to a local path or HTTP(S) URL. `./community-config.yml` is a fully-annotated example covering all options.

### Configuration Options

| Key                        | Type                          | Default                | Description                                                                                                                                                    |
| -------------------------- | ----------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instance_name`            | string                        | `"Patron Web Catalog"` | Name used in error tracking and debug output. Not patron-facing.                                                                                               |
| `companion_app`            | `"simplye"` \| `"openebooks"` | `"simplye"`            | Selects which companion mobile app to reference in redirect prompts.                                                                                           |
| `show_medium`              | boolean                       | `true`                 | Whether to display the medium (e-book, audiobook, etc.) label on book cards.                                                                                   |
| `media_support`            | mapping                       | `{}`                   | Per-MIME-type rendering mode. See [Media Support](#media-support) below.                                                                                       |
| `static_libraries`         | mapping                       | —                      | Static library definitions. See [Libraries and Registries Configuration Settings](#libraries-and-registries-configuration-settings).                           |
| `registries`               | list                          | `[]`                   | One or more library registry URLs fetched at runtime. See [Libraries and Registries Configuration Settings](#libraries-and-registries-configuration-settings). |
| `authentication_documents` | mapping                       | —                      | Controls server-side caching of auth documents. See [Authentication Document Caching](#authentication-document-caching).                                       |

#### Deprecated Configuration Options

| Key               | Description                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bugsnag_api_key` | Use the `BUGSNAG_API_KEY` environment variable instead. The value for this key is ignored.                                                                          |
| `gtm_id`          | Use the `GTM_ID` environment variable instead. The value for this key is ignored.                                                                                   |
| `libraries`       | Use `static_libraries` (mapping) or `registries` (string). See [Libraries and Registries Configuration Settings](#libraries-and-registries-configuration-settings). |

### Media Support

Each entry in `media_support` maps a MIME type to one of three rendering modes:

- **`show`** — Read the book in the web app.
- **`redirect`** — Display a prompt directing the patron to the companion mobile app.
- **`redirect-and-show`** — Offer both options.

Any MIME type not listed is treated as unsupported and hidden from patrons. See `community-config.yml` for a full list of common types and their recommended settings.

## Environment Variables

The main app configuration is done in the [config file](#configuration-file), but where to find that file is defined as an environment variable, along with some other optional variables that may be useful for development. These can either be set at the command line when running the application, or in a `.env.local` file.

Setting via the command line:

```
> CONFIG_FILE=config.yml npm run start
```

Setting in a `.env.local` file:

```
CONFIG_FILE=config.yml
```

The app can then be run with `npm run start`, and it will pick up the env from your env file.

The following environment variables can be set to further configure the application.

- Set `BUGSNAG_API_KEY` to your Bugsnag project API key to enable error tracking. If unset, Bugsnag is disabled.
- Set `GTM_ID` to your Google Tag Manager container ID (format: `GTM-XXXXXXXX`) to enable web analytics. If unset, GTM is not loaded.
- Set `PALACE_CPW_FEATURE_OPDS2=true` to request OPDS 2 (JSON) catalogs from the circulation manager via content negotiation, with automatic fallback to OPDS 1 (Atom) when the server does not serve OPDS 2. This is an experimental feature flag; the default is `false`. Boolean values follow the circulation manager's conventions (`true`/`false`, `1`/`0`, `yes`/`no`, `on`/`off`).
- Set `PALACE_CPW_FEATURE_LANGUAGE_SELECTOR=true` to enable patron-facing language support: the language selector in the catalog header, automatic locale detection, and locale-prefixed URLs. While the flag is off (the default, while localization work is in progress), the selector is hidden, locale detection is disabled, and locale-prefixed URLs redirect to English. Boolean values follow the circulation manager's conventions (`true`/`false`, `1`/`0`, `yes`/`no`, `on`/`off`).
- Set `REACT_AXE=true` to run the application with `react-axe` enabled (only works when `NODE_ENV` is "development").
- Set `ANALYZE=true` to generate bundle analysis files inside `.next/analyze` which will show bundle sizes for server and client, as well as composition.

## Manager, Registry, and Application Configurations

Any Circulation Manager you'll be using with the app also needs a configuration setting to turn on CORS headers. In the Circulation Manager interface, go to the Sitewide Settings section under System Configuration (`/admin/web/config/sitewideSettings`) and add a setting for "URL of the web catalog for patrons". For development, you can set this to "\*", but for production it should be the real URL where you will run the catalog.

If you are using a Library Registry, this configuration will automatically be created when you register libraries with the Registry, but you need to configure the URL in the Library Registry by running `bin/configuration/configure_site_setting --setting="web_client_url=http://library.org/{uuid}"` (replace the URL with your web client URL). Otherwise, you'll need to create a sitewide setting for it in the Circulation Manager. Finally, make sure that the libraries are registered to the Library Registry you are using.

## Libraries and Registries Configuration Settings

The application supports three different approaches for configuring which libraries are available:

#### 1. Static Libraries (Fixed Library Lists)

Define libraries directly in your configuration file as a dictionary mapping library slugs to authentication details. Each library will be accessible at `https://yourdomain.com/{slug}/`.

**Simple Format:**

```yaml
static_libraries:
  my-library: https://circulation.example.com/my-library/authentication_document
  another-lib: https://circulation.example.com/another-lib/authentication_document
```

**Extended Format with Custom Titles:**

You can also specify a custom display title for each library that will appear on the multi-library selection page:

```yaml
static_libraries:
  my-library:
    auth_doc_url: https://circulation.example.com/my-library/authentication_document
    title: "My Public Library"
  another-lib:
    auth_doc_url: https://circulation.example.com/another-lib/authentication_document
    title: "Community Reading Center"
```

Both formats can be mixed in the same configuration file. If no `title` is specified, the slug will be used as the display name.

#### 2. Library Registries (Dynamic Library Lists)

Instead of hardcoding libraries, you can configure the app to fetch library information from one or more registry URLs. This approach is beneficial when:

- You have a large number of libraries
- Libraries are frequently added or removed
- You want to centralize library configuration

**Note:** In the current release, registries are fetched at build time. Runtime fetching will be available in a future release.

```yaml
registries:
  - url: https://registry.thepalaceproject.org/libraries/qa
    refresh_min_interval: 60 # Seconds between fetch attempts (default: 60)
    refresh_max_interval: 300 # Seconds before forcing refresh (default: 300)
```

**Multiple Registries:**

You can define multiple registries. If the same library slug appears in multiple registries, the first registry takes precedence:

```yaml
registries:
  - url: https://primary-registry.example.com/libraries
  - url: https://regional-registry.example.com/libraries
```

#### 3. Hybrid Configuration (Static + Registries)

Combine static libraries with registry-based libraries. Static library definitions always take precedence over registry entries when slugs conflict:

```yaml
static_libraries:
  featured-library:
    auth_doc_url: https://circulation.example.com/featured/authentication_document
    title: "Featured Library"
registries:
  - url: https://registry.thepalaceproject.org/libraries/qa
```

In this example, if the registry also contains a library with slug `featured-library`, the static definition will be used instead.

#### Deprecated Formats

**⚠️ The following formats are deprecated, but are temporarily supported for backward compatibility:**

Using an object for `libraries` to define static libraries:

```yaml
# DEPRECATED — rename to static_libraries
libraries:
  my-library: https://circulation.example.com/my-library/authentication_document
```

Using a string for `libraries` to specify a registry URL:

```yaml
# DEPRECATED — use registries array instead
libraries: https://registry.example.com/libraries
```

**Migration from object `libraries`:**

```yaml
# OLD (deprecated):
libraries:
  my-library: https://circulation.example.com/my-library/authentication_document

# NEW (recommended):
static_libraries:
  my-library: https://circulation.example.com/my-library/authentication_document
```

**Migration from string `libraries`:**

```yaml
# OLD (deprecated):
libraries: https://registry.thepalaceproject.org/libraries

# NEW (recommended):
registries:
  - url: https://registry.thepalaceproject.org/libraries
```

## Authentication Document Caching

Each library's authentication document is fetched on demand as pages are generated and cached server-side. The `authentication_documents` section controls how long that cache stays fresh.

```yaml
authentication_documents:
  refresh_min_interval: 60 # Minimum seconds between re-fetch attempts (default: 60)
  refresh_max_interval: 300 # Seconds before a cached auth doc is considered stale (default: 300)
```

Both keys are optional; omitting the section entirely uses the defaults shown above.

| Key                    | Default | Description                                                                                                                                                                                               |
| ---------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `refresh_min_interval` | `60`    | Minimum number of seconds that must pass between successive fetch attempts for the same auth document, even if the cached copy is stale. This prevents hammering a slow or unavailable upstream endpoint. |
| `refresh_max_interval` | `300`   | Number of seconds after the last _successful_ fetch before the cached auth document is considered stale and a new fetch is attempted.                                                                     |

These settings mirror the `refresh_min_interval` / `refresh_max_interval` fields available on each entry in the `registries` list.

# Development

We use [Next.js](https://nextjs.org/) as our react framework. This handles build configuration as well as server management, providing simple APIs to allow server-rendering or even static-rendering.

## Contributing

The default branch of the repository is `main`. This is where PRs with development work should be made. PRs to `main` should include:

- An entry in the `CHANGELOG` under `UNRELEASED CHANGES`
- New/updated tests as appropriate

<!-- - A link to the associated ticket in [NYPL's JIRA](https://nypl.jira.org) when possible -->

## Installing Dependencies

Run `npm install` in this repository to install the dependencies. If you get errors, you may be using the wrong Node version. We define our node version in `.nvmrc`. You can use [Node Version Manager](https://github.com/nvm-sh/nvm) to pick that up or manually install that version. It's possible that older versions will work, but the version in `.nvmrc` is the version all our tests and QA are run on.

## Running the Application

Once the dependencies are installed and application environments configured, the following two base commands can be used to start the application:

- `npm run dev` - This command will start the development server, which builds pages lazily (when you request them) to shorten the startup time.
- `npm run dev:https` - This will run the app in development with https enabled. This uses the `dev-server.js` script to load https keys. It's useful when developing features that require https to be enabled.
- `npm run build` - This will build both the server and the client code into `./next`. You can then run `npm run start` to start the server.
- `npm run storybook` - This will run the storybook application to preview and develop components in isolation.

The application will start at the base URL of `localhost:3000`. (NOTE: `npm run dev:https` will also make the site available using your computer's IP address. For example, https://192.168.1.15:3000.)

### ENV Vars and Building

When building for production using `npm run build`, the env vars are set at build time. This means whatever you have in your `.env` or `.env.local` or set in the command line when running `npm run build` will be taken as the env for the app when you run it. Overriding env vars like this `CONFIG_FILE=config.yml npm run start` will not work, you have to set them at build time.

### Theme UI

This project uses [Theme UI](https://theme-ui.com/) which provides a simple JavaScript-based method with which to apply visual styles to your components. During development, you should use preset values from the site's theme (src/theme/theme.ts) whenever possible. [Learn more](https://theme-ui.com/getting-started) about Theme UI.

### Useful Scripts

- `npm run test` - This will launch the test runner (jest) and run all tests.
- `npm run dev:axe` - Will run the dev script with react-axe enabled for viewing accessibility issues.
- `npm run lint` - Will lint all code and show errors/warnings in the console.
- `npm run lint:ts:fix` - Will lint the ts and tsx files and apply automatic fixes where possible.
- `npm run generate-icons` - You can place svg files in `src/icons` and then run this command, and it will generate react components that can be imported and rendered normally.

## Testing

The code is tested using Jest as a test runner and mocking library, and a combination of [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) and [Enzyme](https://enzymejs.github.io/enzyme/). New tests are generally written with React Testing Library while the legacy tests were written with Enzyme. React Testing Library is good because it encourages devs not to test implementation details, but instead test the expected user experience. This results in tests that provide more confidence and change less frequently (they are implementation agnostic), therefore requiring less maintenance. In general, we have favored integration over unit tests, and testing components higher up the tree instead of in complete isolation. Similarly we have chosen to mock as few values and modules as possible. Both of these decisions will lead to higher confidence that the app works as expected for users.

We do use snapshot testing in a few places. The general idea is to limit usage of snapshot testing to relatively small UI components where you essentially want to just make sure the UI doesn't change unexpectedly. When a snapshot test fails, the diff will be shown in the terminal. If the diff is the expected result of a change you made, you can update the failing snapshots to the new value by pressing `u` in the CLI.

### Context and useful spies

Because many components depend on context values, such as the redux store or the theme, the `src/test-utils/index.tsx` file augments React Testing Library's `render` function to wrap the passed in component with our standard context providers. The custom `render` function also provides a way to pass in an `initialState` so you can set the redux state at the time of render in the test. We also mock and/or spy on some values, such as `pathFor`, and redux's `dispatch`, the latter of which is passed to the test in the `render` result so it can be asserted on.

Inside of `src/test-utils/fixtures` are some useful data fixtures. Typically they are used to create an initial state for the application which is passed as an option to the render function.

### Running tests

You can run `npm run test` to run the test suite once. The CLI output for that function will also provide instructions to filter the tests to a specific file for speed, if you'd like.

### Example

An annotated example from `Search.test.tsx`:

```
/**
 *  our custom render, our fixtures, the actions creator, and
 *  all other react-testing-library exports can be imported from test-utils
 */
import { render, fixtures, fireEvent, actions } from "../../test-utils";

test("fetches search description", async () => {
  /**
   * First mock the SWR data, which effectively mocks the network call to fetch
   * the search description. You can see details of how this works in the
   * mockSwr function.
   */
  mockSwr({ data: fixtureData });

  // then render the app. utils will contain the query functions provided by
  // react-testing-library
  const utils = render(<Search />, {
    router: {
      query: { collectionUrl: "/collection" }
    }
  });
  // we can then make sure that the mocked `useSWR` function was called as
  // expected. In this case once for the collection, then for it's search
  // description.
  expect(mockedSWR).toHaveBeenCalledWith(
    ["/collection", "user-token"],
    expect.anything()
  );
  expect(mockedSWR).toHaveBeenCalledWith("/search-data-url", expect.anything());
});

```

## Links and Routing

When creating links using `<Link>`, you don't need to worry about whether it is for a single or multi-library route config. Write the `as` and `href` like you would if the package only supported one-library setups, and the `<Link>` will prepend `/[libraryId]` to your routes if needed.

## Translations

Overview of the translation setup for the `web-patron` application

### Packages used for translations

The `web-patron` application utilizes the following packages for internationalization (i18n):

- **next-i18next**: a plugin for Next.js that integrates i18next for server-side translations
- **i18next-cli**: a command-line tool for managing translations (development dependency)
- **i18n-unused**: a command-line tool that flags unused translations (development dependency)
- **i18next**: an internationalization framework for JavaScript (peer dependency required by `next-i18next`)
- **react-i18next**: React bindings for i18next (peer dependency required by `next-i18next`)
- **eslint-plugin-18next** ESLint plugin that warns about hardcoded strings (development dependency)

### Configuration files

#### `next-i18next.config.js`

This file contains the configuration for the `next-i18next` library, which manages translations in the application.

Key settings:

- **Supported languages**: English (`en`), French (`fr`), Italian (`it`), and Spanish (`es`).
- **Default language**: English (`en`) is the default and fallback language.
- **Namespaces**: Two namespaces are used. `translations` is the default and holds keys used by a single component; `common` holds strings shared by more than one component. See [Shared strings and the `common` namespace](#shared-strings-and-the-common-namespace)
- **Translation files path**: Translation files are stored in the `public/locales` directory.

#### `i18next.config.ts`

This file configures the `i18next-cli` for extracting translation keys from the source code.

Key settings:

- **Input files**: The configuration specifies that `.tsx` and `.jsx` files in the `src/components` and `src/pages` directories should be scanned for translation keys
- **Output path**: Extracted translation files are saved in the `public/locales` directory, organized by language and namespace
- **Commands**: Use the following scripts to manage translations:
  - `translations:status` Overview of project translations
  - `translations:lint` List of hardcoded strings needing translation
  - `translations:extract` Extract translation keys and update translation files
    - `--sync-primary` Use default value provided in `t(translation_key, default_value)` as translation
    - `--watch` Update translation file on file save
  - `translations:sync` Sync non-English files with the English file
    - **Note**: `i18next` generates locale-specific plural forms that might result in more plural keys being generated for other languages than the default language (`en`). For example `en` might only have `key_other` while a different locale could have `key_other` and `key_many`. Running `translations:sync` when locale-specific plural forms exist in translations files other than the default language _and the non-default locales have yet to be translated_ will cause those keys to be removed.
  - `translations:ci` Fail builds when translations are outdated

#### `i18n-unused.config.js`

- **Commands**:
  - `translations:unused` Lists unused translation keys
    - `i18next.config.js` sets `removedUnusedKeys: false` so unused keys are not removed upon extraction (`npm run translations:extract`). This command surfaces any unused keys to help with manual removal.

### JSON structure for translations files

Translations are stored in flat JSON files, one per language per namespace: `translations.json` and `common.json` under `public/locales/{language}/`. The JSON files consist of key-value pairs, where the key is a unique identifier for the translation and the value is the actual translated string. The translation keys within these files are structured using dot notation, like `bookDetails.publisher`. Nesting is not used, which makes it easier to retrieve and sort the translations.

### Key naming scheme

Every key in the default `translations` namespace should begin with the camelCase name of the file that uses it. A key in `ReportProblem.tsx` starts with `reportProblem.`, a key in `SignOut.tsx` starts with `signOut.`, and so on. Keys in the `common` namespace are the exception — they are shared across files and are grouped by domain.

The prefix is derived from the file path like this:

| File                                     | Prefix        | Rule                                       |
| ---------------------------------------- | ------------- | ------------------------------------------ |
| `src/components/SignOut.tsx`             | `signOut`     | PascalCase → camelCase                     |
| `src/pages/[library]/signed-out.tsx`     | `signedOut`   | kebab-case → camelCase                     |
| `src/components/bookDetails/index.tsx`   | `bookDetails` | `index` files inherit the parent directory |
| `src/pages/[library]/book/[bookUrl].tsx` | `bookUrl`     | Next.js dynamic segments are unbracketed   |

Examples:

```tsx
// src/components/SignOut.tsx
t("signOut.cancel", "Cancel");

// src/components/bookDetails/index.tsx
t("bookDetails.publisher", "Publisher");

// src/pages/[library]/signed-out.tsx — keys may have more than two segments
t("signedOut.securityNotice.body1", "…");
```

For an interpolated key, the **full prefix including the dot** must appear in the literal text before the first `${...}`, so that no interpolated value can change which namespace the key lands in:

```tsx
// good
t(`languageSelector.languageName.${code}`);

// bad — different namespace
t(`languageName.${code}`);

// bad — `${suffix}` could produce the key "languageSelectorFoo"
t(`languageSelector${suffix}`);
```

#### Shared strings and the `common` namespace

The file-prefix scheme gives each component its own keys, which means a string used by several components would otherwise be duplicated once per component. When that happens, duplicates might drift apart per language over time.

**A string rendered by more than one component belongs in `common.json`**, keyed by domain rather than by file. Read it by naming the namespace explicitly:

```tsx
// src/components/SignOut.tsx and src/components/bookDetails/ReportProblem.tsx
// both render the same button label, so it lives in common.json
t("actions.cancel", "Cancel", { ns: "common" });
```

The domain prefixes currently in use:

| Prefix     | Holds                                     | Example                        |
| ---------- | ----------------------------------------- | ------------------------------ |
| `actions.` | Button labels and their loading states    | `actions.cancelReservation`    |
| `alt.`     | Alternative text                          | `alt.bookCover`                |
| `auth.`    | Sign-in copy shared by the auth handlers  | `auth.loggingInWithMethod`     |
| `error.`   | General error messages                    | `error.unknown`                |
| `library.` | Copy about the library list               | `library.noLibrariesAvailable` |
| `nav.`     | Navigation destinations and app-wide CTAs | `nav.myBooks`                  |
| `status.`  | Loading and status text                   | `status.loading`               |

Two rules keep this working:

1. **The `ns` option is what routes the key.** `i18next-cli` reads it during extraction and writes the key to `common.json` instead of `translations.json`. Forget it and the key silently lands in the default namespace, where the other components cannot share it.
2. **A new namespace must be registered in three places**: the `ns` array in [next-i18next.config.js](next-i18next.config.js), `translationNamespaces` in [src/dataflow/withAppProps.ts](src/dataflow/withAppProps.ts) (both the static and the server-side variant), and the namespace map in [src/test-utils/mockUseTranslation.ts](src/test-utils/mockUseTranslation.ts). A namespace missing from `withAppProps.ts` is never serialized to the client.

### Interpolation

**Do not overly rely on interpolation**: Opt for interpolation when using user-provided data or strings that won't likely change context when translated. In other cases, it can be difficult to properly translate context when many of the words or phrases within a sentence are translated prior.

E.g. The meaning of the sentence `"Also available to {{action}} in {{app}}"` might change if an action (`read` or `listen to`) is translated outside the context of the sentence. It is better to have separate translations:

```json
"fulfillmentCard.alsoAvailableToReadIn": "Also available to read in {{app}}",
"fulfillmentCard.alsoAvailableToListenToIn": "Also available to listen to in {{app}}"
```

### Translation process

To extract translation keys from your component source code and to update the `translations.json` files, follow these steps:

0. **Run `npm run lint`**

   ```bash
   npm run lint
   ```

   This confirms that any new keys are namespaced correctly for the file they live in. Do this before extracting, so that a mis-prefixed key never reaches the `translations.json` files.

1. **Run the `lint` command (optional)**

   ```bash
   npm run translations:lint
   ```

   This command prints a list of hardcoded strings, that are not yet wrapped in the translation function (`t`). These strings probably need to be translated, too.

2. **Run the `extract` command**

   ```bash
   npm run translations:extract
   ```

   This command will scan the specified directories for translation keys used in your components and update the `translations.json` files in the `public/locales` directory.

3. **Run the `sync` command (optional)**

   ```bash
   npm run translations:sync
   ```

   This command will compare the non-English translation files against the English (`en`) file. It will add any missing keys from the English file to the non-English files and remove any extra keys that are not present in the English file.

4. **Check the output**  
   After running the commands, check the `translations.json` files that the new translation keys have been added correctly.

5. **Add translations**  
   Collaborate with the translators and add the translations for the keys in the non-English files, and English (`en`) to the `translations.json` files.
   **Note**: Transifex and `@transifex/cli` will likely be leveraged for automated translation.

6. **Save changes**  
   Verify that the translations are correct and functioning as expected in the application. Then commit the updated translation files.

### Changing the app language

The LanguageSelector component lets users change the language of the application.
Note that the language code in the URL is only visible when a language other than English is selected:

- **English (default)**: `https://example.com/books` (no language code `en`)
- **non-English language** `https://example.com/{localeCode}/books

The component uses Next.js's Router to handle the current language through `router.locale`. When user selects a language, the component updates the locale using `router.push`. This means the URL is updated creating a new entry in the browser's history, so users can always navigate back and see the language switch as a separate step.

# Deploying

This repository includes a Dockerfile, and the master branch is built as an image in Docker Hub in the Hub repository [thepalaceproject/web-patron](https://hub.docker.com/r/thepalaceproject/web-patron). You can deploy the application simply by running the image from Docker Hub. You can either use the `latest` tag in Docker Hub, or a specific version tagged with the version number. There will also be an image tagged `beta` for the most recent code on the `beta` branch.

Alternatively, you can build your own container from local changes as described below. If you would like to deploy from Docker Hub, skip to [Running a container from the image](#running-a-container-from-the-image).

## Build a docker container

When you have code changes you wish to review locally, you will need to build a local Docker image with your changes included. There are a few steps to get a working build:

1. Clone this repository and make some changes.
2. Build the image

   ```
   docker build -t webpatron  .

   ```

If you wanted to customize the image, you could create an additional Dockerfile (e.g., Dockerfile.second) and simply specify its name in the docker build commands. The Docker file you specify will guide the image build. For this image, the build takes about 4-6 minutes, depending on your Internet speed and load on the Node package servers, to complete the final image. Eg: `docker build -f Dockerfile.second -t webpatron .`

### Running the docker container

Whether running the container from a Docker Hub image, or a local one, you will need to provide at least one environment variable to specify the circulation manager backend, as described in [Application Startup Configurations](#Application-Startup-Configurations). You can also provide the other optional environment variables when running your docker container. There are two ways to run the container: (1) via the command line, and (2) via `docker-compose` with a `docker-compose.yml` file.

When running the image with the `CONFIG_FILE` option, you will want to provide the file's directory to the container as a volume, so the container can access the file on your host machine. When doing this, replace `$PATH_TO_LOCAL_VOLUME` with the absolute path to the `/config` directory on the host machine.

### From the command line

This command will download the image from The Palace Project's Docker Hub repo, and then run it with the `CONFIG_FILE` option (using a file named `cm_libraries.txt`) and the name `webpatron`. If you would like to run your locally built image, substitute `thepalaceproject/web-patron` with the tag of the image you built previously (just `webpatron` in the example above).

```
docker run -d --name webpatron -p 3000:3000\\
  --restart=unless-stopped \\
  -e "CONFIG_FILE=/config_volume/config.yml" \\
  -v $PATH_TO_LOCAL_VOLUME:/config_volume \\
  thepalaceproject/web-patron

```

What are these commands doing?

- `-name` - allows you to name your docker container
- `d` - detatches the docker container from the terminal. If running locally, you can still view the container with Docker Desktop.
- `p 3000:3000` - the default port exposed in the image during the build is 3000. This command maps that to port 3000 on the host machine so it can be accessed there.
- `-restart=unless-stopped` - this will make the container restart if it exits erroneously.
- `e` - define environment variable(s).
- `v $PATH_TO_LOCAL_VOLUME:/config` - allows you to specify which directory on the host machine will contain your config.

### Using `docker-compose`

Instead of using the `docker run` command at the command line, it's also possible to use the `docker-compose` utility to create the container. Using docker-compose provides the advantage of encapsulating the run parameters in a configuration file that can be committed to source control. We've added an example `docker-compose.yml` file in this repository, which you can adjust as needed with parameters that fit your development.

To create the container using the `docker-compose.yml` file in this repository, simply run `docker-compose up`. This will build the image and start the container. To stop the container and remove it, run `docker-compose down`. Similarly you can run `docker-compose stop` to stop the container without removing it, and `docker-compose start` to restart a stopped container.

If you would like to use a `SIMPLIFIED_CATALOG_BASE` or `REGISTRY_BASE`, or provide any of the other documented [ENV vars](#Application-Startup-Configurations), simply replace the `CONFIG_FILE` setting in `docker-compose.yml`.

### Helpful commands

- For debugging purposes, you can run the container and skip the command to start the app, instead launching it directly into a shell. To do so, use this command:
  ```
  docker run -it --name webpatron -v $PATH_TO_LOCAL_VOLUME:/config --rm --entrypoint=/bin/sh webpatron
  ```

### Credits

<img alt="Bugsnag logo" src="https://global-uploads.webflow.com/5c741219fd0819540590e785/5e29d884752bb0072e2a0e6d_bugsnag-logo-full.png" width="200px"/>
