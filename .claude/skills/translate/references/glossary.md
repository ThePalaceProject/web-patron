# Translation glossary and register

The termbase for `public/locales/`. Consult this before translating any key. Consistency
across ~800 strings depends on every occurrence of a domain term resolving the same way.

**This table lists dictionary forms.** Call sites inflect them. `restituire` is the lemma for
"return"; the button renders `Restituisci`. Never paste a cell from the termbase into a locale
file without first deciding what role the string plays — see
[Rendered forms by role](#rendered-forms-by-role).

## The product and its readers

**Everything lent here is digital.** The app circulates ebooks and audiobooks; nothing is
physical, and no one visits a desk. Two consequences that change word choice:

- "Copies" are concurrent-license slots, not objects on a shelf. Italian takes **`copie`**, never
  `esemplari` (a physical specimen of an edition). German `Exemplare` and Spanish `ejemplares` are
  established in digital lending and stay.
- "Return" is an early check-in — the patron gives the license back before it expires. Avoid
  wording that implies carrying an item back or handing it over.

**The readers are public-library patrons**, not software users. Where a generic translation and a
library-domain term are both correct, use the one a patron already meets in their own library's
catalogue. That is the tiebreaker throughout this document.

## Register: formal

| Language | Address form | Example                                            |
| -------- | ------------ | -------------------------------------------------- |
| German   | **Sie**      | "Sind Sie sicher…", `Ihre Ausleihen`               |
| French   | **vous**     | "Vous devez vous connecter…"                       |
| Spanish  | **usted**    | "Debe iniciar sesión…"                             |
| Italian  | **Lei**      | "Deve effettuare l'accesso…", "Aggiorni la pagina" |

Prefer impersonal or nominal constructions where they read naturally — `Anmelden`,
`Se connecter`, `Iniciar sesión` — and fall back to the formal pronoun only when direct address
is unavoidable. This keeps button and nav strings short, which matters for layout (see Length
policy).

**Italian splits register by role, and this is correct.** Prose addresses the reader with _Lei_
(`Aggiorni la pagina e riprovi`), while buttons take the second-person imperative
(`Accedi`, `Esci`, `Annulla`, `Restituisci`). A button is a label, not an address, and Italian
UI convention is overwhelmingly tu-imperative even in formally-registered products. Do **not**
"correct" `Accedi` to `Acceda`.

## Never translate

- **Palace** — product name. `the Palace App` → `die Palace App` / `l'app Palace` /
  `la aplicación Palace` / `l'app Palace`. (For the inflected form this string actually needs,
  see [Fulfillment and companion apps](#fulfillment-and-companion-apps).)
- **Open eBooks**, **Clever**, **FirstBook** — product/partner names.
- **Google Play**, **App Store**, **iOS**, **Android**.
- **ePub**, **PDF** — format identifiers rendered as-is.
- Any `{{placeholder}}` token — copy verbatim, including case. Never translate, reorder the
  characters inside, or add spaces inside the braces.
- HTML-ish tags inside `<Trans>` values, e.g. `<2></2>` — preserve exactly and keep them
  wrapped around the equivalent phrase in the target language.
- Login field labels. `method.labels.login` / `method.labels.password` arrive from the library's
  own auth document (`src/auth/BasicAuthHandler.tsx`), so "Barcode" and "PIN" are the library's
  words, not ours. They are interpolated into `auth.fieldRequired` untranslated.

## Core termbase — nouns

Used as written; inflect for number where the call site is plural.

| English        | German                  | French                | Spanish                  | Italian                  |
| -------------- | ----------------------- | --------------------- | ------------------------ | ------------------------ |
| library        | Bibliothek              | bibliothèque          | biblioteca               | biblioteca               |
| library card   | Bibliotheksausweis      | carte de bibliothèque | tarjeta de la biblioteca | tessera della biblioteca |
| catalog        | Katalog                 | catalogue             | catálogo                 | catalogo                 |
| book           | Buch                    | livre                 | libro                    | libro                    |
| ebook / eBook  | E-Book                  | livre numérique       | libro electrónico        | ebook                    |
| audiobook      | Hörbuch                 | livre audio           | audiolibro               | audiolibro               |
| loan / on loan | Ausleihe / ausgeliehen  | emprunt / emprunté    | préstamo / prestado      | prestito / in prestito   |
| hold / on hold | Vormerkung / vorgemerkt | réservation / réservé | reserva / reservado      | prenotazione / prenotato |
| copies         | Exemplare               | exemplaires           | ejemplares               | copie                    |
| queue          | Warteliste              | file d'attente        | lista de espera          | lista d'attesa           |
| My Books       | Meine Bücher            | Mes livres            | Mis libros               | I miei libri             |
| series         | Reihe                   | série                 | serie                    | serie                    |
| audience       | Zielgruppe              | public                | público                  | pubblico                 |
| summary        | Zusammenfassung         | résumé                | resumen                  | riassunto                |
| preview        | Vorschau                | aperçu                | vista previa             | anteprima                |

### Bibliographic role labels

These render as `<dt>` field labels beside a value (`BookMetaDetail.tsx`), and the keys are
plural (`bookDetails.narrators` → "Narrators"). A label names a _role_, not a person, so it takes
the bare institutional form in every language — no dual forms, no slashes, no midpoints. See
[Gender agreement](#gender-agreement).

| English     | German   | French       | Spanish      | Italian      |
| ----------- | -------- | ------------ | ------------ | ------------ |
| author      | Autor    | auteur       | autor        | autore       |
| narrator    | Sprecher | narrateur    | narrador     | narratore    |
| publisher   | Verlag   | éditeur      | editorial    | editore      |
| distributor | Vertrieb | distributeur | distribuidor | distributore |

## Rendered forms by role

The verbs below change shape depending on where they land. Pick the row that matches the call
site, not the lemma.

**Button convention:** German, French, and Spanish use the infinitive. Italian uses the
second-person imperative (see Register, above).

| Action   | Role     | German        | French            | Spanish              | Italian            |
| -------- | -------- | ------------- | ----------------- | -------------------- | ------------------ |
| borrow   | button   | Ausleihen     | Emprunter         | Pedir prestado       | Prendi in prestito |
|          | progress | Ausleihe...   | Emprunt...        | Pidiendo prestado... | Prestito...        |
| reserve  | button   | Vormerken     | Réserver          | Reservar             | Prenota            |
|          | progress | Vormerkung... | Réservation...    | Reservando...        | Prenotazione...    |
| return   | button   | Zurückgeben   | Rendre            | Devolver             | Restituisci        |
|          | progress | Rückgabe...   | Retour...         | Devolviendo...       | Restituzione...    |
| cancel   | button   | Abbrechen     | Annuler           | Cancelar             | Annulla            |
|          | progress | Abbruch...    | Annulation...     | Cancelando...        | Annullamento...    |
| sign in  | button   | Anmelden      | Se connecter      | Iniciar sesión       | Accedi             |
|          | progress | Anmeldung...  | Connexion...      | Iniciando sesión...  | Accesso...         |
| sign out | button   | Abmelden      | Se déconnecter    | Cerrar sesión        | Esci               |
| read     | button   | Lesen         | Lire              | Leer                 | Leggi              |
| listen   | button   | Hören         | Écouter           | Escuchar             | Ascolta            |
| download | button   | Laden         | Télécharger       | Descargar            | Scarica            |
|          | progress | Download...   | Téléchargement... | Descargando...       | Download...        |
| open     | progress | Öffnen...     | Ouverture...      | Abriendo...          | Apertura...        |
| search   | button   | Suchen        | Rechercher        | Buscar               | Cerca              |
|          | noun     | Suche         | Recherche         | Búsqueda             | Ricerca            |
| filter   | button   | Filtern       | Filtrer           | Filtrar              | Filtra             |
|          | noun     | Filter        | Filtre            | Filtro               | Filtro             |

### Progress strings

German, French, and Italian use a **deverbal noun** plus `...`; Spanish uses a **gerund**. Each
matches its own UI convention — German's `Anmeldung...` is the pattern to follow, not
`Wird abgebrochen...`.

Two hard requirements:

- **The progress form must differ from the idle label.** `Zurückgeben` → `Zurückgeben...` fails:
  the patron cannot tell the button did anything. Hence `Rückgabe...`.
- **Never mix patterns inside one language.** All of `actions.*` follows one shape.

The nominal progress form deliberately collides with the loan noun (`Ausleihe...` / `Emprunt...` /
`Prestito...` sit beside `Ausleihe` / `emprunt` / `prestito`). That is fine — the progress form
only ever appears inside a button mid-action, where context disambiguates.

### Borrow is not lend

The patron **takes**; the library **gives**. Every language has a verb pair here and picking the
wrong side inverts the meaning:

| Language | Patron's verb (use this) | Library's verb (never) |
| -------- | ------------------------ | ---------------------- |
| German   | ausleihen                | verleihen              |
| French   | emprunter                | prêter                 |
| Spanish  | **pedir prestado**       | **prestar**            |
| Italian  | prendere in prestito     | prestare               |

Spanish is the easiest one to get wrong, because the short form is the wrong one.
`actions.borrowing` is **`Pidiendo prestado...`**, never `Prestando...` — the latter is the gerund
of _prestar_ and tells the patron the library is lending.

### Return is not always "return"

`actions.return` (give the loan back) and `signedOut.returnToCatalog` (navigate back) are
different verbs everywhere but English. The navigation sense never takes the circulation verb:

| Key                         | German             | French              | Spanish            | Italian           |
| --------------------------- | ------------------ | ------------------- | ------------------ | ----------------- |
| `actions.return`            | Zurückgeben        | Rendre              | Devolver           | Restituisci       |
| `signedOut.returnToCatalog` | Zurück zum Katalog | Retour au catalogue | Volver al catálogo | Torna al catalogo |

## Availability states

English distinguishes three hold-related states; all four target languages collapse _reserve_ and
_hold_ into a single verb, so the distinction has to be carried by the noun or the adjective.
These are the `BookStatus.tsx` labels.

| English (status)    | Meaning                          | German            | French             | Spanish            | Italian             |
| ------------------- | -------------------------------- | ----------------- | ------------------ | ------------------ | ------------------- |
| Available to borrow | copies free, no hold needed      | Verfügbar         | Disponible         | Disponible         | Disponibile         |
| Unavailable         | all copies out, hold placeable   | Nicht verfügbar   | Indisponible       | No disponible      | Non disponibile     |
| Reserved            | hold placed, patron is in queue  | Vorgemerkt        | Réservé            | Reservado          | Prenotato           |
| Ready to Borrow     | hold came in, waiting for patron | Jetzt ausleihbar  | Prêt à emprunter   | Reserva disponible | Prenotazione pronta |
| Unsupported         | format the app cannot open       | Nicht unterstützt | Non pris en charge | No compatible      | Non supportato      |

The constraint that matters: **"Ready to Borrow" must be distinguishable from both "Available to
borrow" and "Reserved."** A patron seeing the same word for "anyone can borrow this" and "your
hold is waiting" has lost the only information the status carries. If a layout forces a shorter
rendering, preserve that distinction over brevity.

## Fulfillment and companion apps

`FulfillmentCard.tsx` tells the patron where they can actually open the title. The read/listen
split is expressed as separate whole-sentence keys rather than an interpolated verb, so translate
each variant as a complete sentence — never assemble one from parts.

| English                                 | German                                | French                                          | Spanish                                       | Italian                                       |
| --------------------------------------- | ------------------------------------- | ----------------------------------------------- | --------------------------------------------- | --------------------------------------------- |
| Available to read.                      | Zum Lesen verfügbar.                  | Disponible à la lecture.                        | Disponible para leer.                         | Disponibile per la lettura.                   |
| Available to listen to.                 | Zum Hören verfügbar.                  | Disponible à l'écoute.                          | Disponible para escuchar.                     | Disponibile per l'ascolto.                    |
| Available to read in {{app}}.           | Zum Lesen mit {{app}} verfügbar.      | Disponible à la lecture avec {{app}}.           | Disponible para leer con {{app}}.             | Disponibile per la lettura con {{app}}.       |
| Available to listen to in {{app}}.      | Zum Hören mit {{app}} verfügbar.      | Disponible à l'écoute avec {{app}}.             | Disponible para escuchar con {{app}}.         | Disponibile per l'ascolto con {{app}}.        |
| Also available to read in {{app}}.      | Auch zum Lesen mit {{app}} verfügbar. | Également disponible à la lecture avec {{app}}. | También disponible para leer con {{app}}.     | Disponibile anche per la lettura con {{app}}. |
| Also available to listen to in {{app}}. | Auch zum Hören mit {{app}} verfügbar. | Également disponible à l'écoute avec {{app}}.   | También disponible para escuchar con {{app}}. | Disponibile anche per l'ascolto con {{app}}.  |

### `{{app}}` carries its own article, so inflect it for the slot

`fulfillmentCard.companionAppPalace` and `companionAppOpenEbooks` are **only ever** used as the
`{{app}}` value ([FulfillmentCard.tsx:125-156](src/components/bookDetails/FulfillmentCard.tsx#L125-L156)) —
they never render standalone. The English carrier supplies the preposition (`in {{app}}`) and the
app-name string supplies the article (`the Palace App`), which means the target language has to
make preposition and article agree across a boundary the translator does not control.

Two rules keep that from breaking:

1. **Choose a carrier preposition that does not contract with a following article** — German
   `mit`, French `avec`, Spanish `con`, Italian `con`. The tables above already do this. Do not
   use French `dans` + `le`, Italian `su` + `l'`, or Spanish `en` + `el`; those contract, and the
   contraction cannot happen because the article is inside the placeholder.
2. **Write the app-name string in the form that slot requires**, including case:

| Key                      | German         | French       | Spanish              | Italian      |
| ------------------------ | -------------- | ------------ | -------------------- | ------------ |
| `companionAppPalace`     | der Palace App | l'app Palace | la aplicación Palace | l'app Palace |
| `companionAppOpenEbooks` | Open eBooks    | Open eBooks  | Open eBooks          | Open eBooks  |

German `der` is dative, governed by `mit` — the only slot the string ever lands in. Check the
result end to end before finishing: `mit der Palace App`, `mit Open eBooks`, `avec l'app Palace`,
`con la aplicación Palace`, `con l'app Palace`.

### Other fulfillment strings

| English                                                              | German                                                                                   | French                                                                                 | Spanish                                                            | Italian                                                                   |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| This title is not supported in this application, please try another. | Dieser Titel wird in dieser Anwendung nicht unterstützt. Bitte wählen Sie einen anderen. | Ce titre n'est pas pris en charge par cette application. Veuillez en essayer un autre. | Este título no es compatible con esta aplicación. Pruebe con otro. | Questo titolo non è supportato da questa applicazione. Ne provi un altro. |
| If you would rather read on your computer, you can:                  | Wenn Sie lieber am Computer lesen möchten, können Sie:                                   | Si vous préférez lire sur votre ordinateur, vous pouvez :                              | Si prefiere leer en su computadora, puede:                         | Se preferisce leggere sul computer, può:                                  |

The French colon takes a non-breaking space (U+00A0) — see
[Ellipsis and punctuation](#ellipsis-and-punctuation).

## Media and format labels

`utils.book.medium*` names what the title _is_ and translates. `utils.book.format*` names the
file format and does not — `ePub` and `PDF` are identifiers, rendered as-is in every locale.
`formatAudiobook` is the exception in that group: it is a medium name in a format slot, so it
translates like the medium.

| English   | German  | French          | Spanish           | Italian    |
| --------- | ------- | --------------- | ----------------- | ---------- |
| Book      | Buch    | Livre           | Libro             | Libro      |
| eBook     | E-Book  | Livre numérique | Libro electrónico | Ebook      |
| Audiobook | Hörbuch | Livre audio     | Audiolibro        | Audiolibro |
| Duration  | Dauer   | Durée           | Duración          | Durata     |
| Format    | Format  | Format          | Formato           | Formato    |

Durations and dates are **not** translated — `formatDuration` and `formatDate`
(`src/utils/duration.ts`, `date.ts`) render them from ICU data for the active locale. Nothing in
the catalogs controls how "2 hours, 15 minutes" reads.

## Identity and access

| English                                    | German                                                  | French                                             | Spanish                                             | Italian                                                          |
| ------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| Sign up for a library card                 | Bibliotheksausweis beantragen                           | Demander une carte de bibliothèque                 | Solicitar una tarjeta de la biblioteca              | Richiedi una tessera della biblioteca                            |
| Need a library card?                       | Benötigen Sie einen Bibliotheksausweis?                 | Besoin d'une carte de bibliothèque ?               | ¿Necesita una tarjeta de la biblioteca?             | Le serve una tessera della biblioteca?                           |
| Find a Library                             | Bibliothek finden                                       | Trouver une bibliothèque                           | Buscar una biblioteca                               | Trova una biblioteca                                             |
| Patron Support                             | Support                                                 | Assistance                                         | Asistencia                                          | Assistenza                                                       |
| Patron ID: {{patronId}}                    | Ausweisnummer: {{patronId}}                             | Numéro d'usager : {{patronId}}                     | Número de usuario: {{patronId}}                     | Numero utente: {{patronId}}                                      |
| Logging in with {{authMethod}}...          | Anmeldung mit {{authMethod}}...                         | Connexion avec {{authMethod}}...                   | Iniciando sesión con {{authMethod}}...              | Accesso con {{authMethod}}...                                    |
| You must be signed in to borrow this book. | Sie müssen angemeldet sein, um dieses Buch auszuleihen. | Vous devez vous connecter pour emprunter ce livre. | Debe iniciar sesión para pedir prestado este libro. | Deve effettuare l'accesso per prendere in prestito questo libro. |
| Your {{field}} is required.                | Das Feld {{field}} ist erforderlich.                    | Le champ {{field}} est obligatoire.                | El campo {{field}} es obligatorio.                  | Il campo {{field}} è obbligatorio.                               |

`auth.fieldRequired` is the case that forces the `Feld` / `champ` / `campo` construction:
`{{field}}` is the library's own untranslated word ("Barcode", "PIN"), so its gender is unknown at
translation time. Anchoring the agreement on a noun **we** supply is the only rendering that is
correct for every value. The same reasoning applies to `{{authMethod}}`.

"Patron Support" drops the person entirely rather than picking a gendered noun — see
[Gender agreement](#gender-agreement).

## Catalog navigation

The tightest length constraints in the app. Every one of these lands in a nav bar, a button, or a
lane header.

| English           | German             | French              | Spanish            | Italian           |
| ----------------- | ------------------ | ------------------- | ------------------ | ----------------- |
| Catalog           | Katalog            | Catalogue           | Catálogo           | Catalogo          |
| My Books          | Meine Bücher       | Mes livres          | Mis libros         | I miei libri      |
| Download Palace   | Palace laden       | Obtenir Palace      | Descargar Palace   | Scarica Palace    |
| See All           | Alle ansehen       | Tout voir           | Ver todo           | Vedi tutto        |
| See More          | Mehr ansehen       | Voir plus           | Ver más            | Vedi altro        |
| Recommendations   | Empfehlungen       | Recommandations     | Recomendaciones    | Consigli          |
| Return to Catalog | Zurück zum Katalog | Retour au catalogue | Volver al catálogo | Torna al catalogo |

## Error, empty, and loading states

Keep these impersonal. They are the strings most likely to force a participle agreeing with the
reader, and the recast is always available.

| English                                                           | German                                                                           | French                                                                        | Spanish                                                           | Italian                                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| There was an error displaying this lane.                          | Beim Anzeigen dieser Kategorie ist ein Fehler aufgetreten.                       | Une erreur s'est produite lors de l'affichage de cette sélection.             | Se ha producido un error al mostrar esta sección.                 | Si è verificato un errore durante la visualizzazione di questa sezione.   |
| This collection is empty.                                         | Diese Kategorie ist leer.                                                        | Cette sélection est vide.                                                     | Esta sección está vacía.                                          | Questa sezione è vuota.                                                   |
| Your books will show up here when you have any loaned or on hold. | Ihre Bücher erscheinen hier, sobald Sie etwas ausgeliehen oder vorgemerkt haben. | Vos livres apparaîtront ici dès que vous aurez un emprunt ou une réservation. | Sus libros aparecerán aquí cuando tenga algún préstamo o reserva. | I suoi libri compariranno qui quando avrà un prestito o una prenotazione. |
| Summary not provided.                                             | Keine Zusammenfassung vorhanden.                                                 | Aucun résumé disponible.                                                      | Resumen no disponible.                                            | Riassunto non disponibile.                                                |
| Author unknown                                                    | Autor unbekannt                                                                  | Auteur inconnu                                                                | Autor desconocido                                                 | Autore sconosciuto                                                        |

Note that `collection.empty` and `lane.errorFallback` take the **lane** sense of "collection", not
the holdings sense — see below.

## Collection, lane, and series

Three concepts that English blurs and German currently collapses onto one word.

- **collection (holdings)** — "our collection of ebooks and audiobooks", the library's whole
  offering. German takes **`Bestand`**, the library-idiomatic term; `Sammlung` suggests a curated
  or private assemblage. French `collection`, Spanish `colección`, Italian `collezione`.
- **collection (lane)** — a feed grouping in the catalog. `lane.collection` is a
  **screen-reader-only suffix appended after the lane title** (`Lane.tsx:180`), so the rendering
  has to work as a bare trailing noun. German `Kategorie`, French `sélection`, Spanish `sección`,
  Italian `sezione`. Keep `lane.errorFallback` and `collection.empty` on the same word.
- **series** — a book series (`bookDetails.series`). German keeps **`Reihe`**, the established
  bibliographic term. It must not also be used for the lane sense.

Never rendered as a user's own list — the app has no such feature.

## Language names

`languageSelector.languageName.XX` is an N×N grid: every locale file names **every** supported
language. Names are given in the file's own language (exonyms), not as endonyms — `fr` reads
`Anglais`, not `English`.

| Language | in `en` | in `de`     | in `fr`  | in `es`  | in `it`  |
| -------- | ------- | ----------- | -------- | -------- | -------- |
| EN       | English | Englisch    | Anglais  | Inglés   | Inglese  |
| FR       | French  | Französisch | Français | Francés  | Francese |
| IT       | Italian | Italienisch | Italien  | Italiano | Italiano |
| DE       | German  | Deutsch     | Allemand | Alemán   | Tedesco  |
| ES       | Spanish | Spanisch    | Espagnol | Español  | Spagnolo |

German capitalizes these as nouns. French, Spanish, and Italian capitalize them here only because
they are standalone option labels — do not carry that capital into running prose.

## Gender agreement

Rephrase around the person. This is the general rule; the "Patron" cases below are one instance
of it.

Order of preference:

1. **Recast so agreement never arises** — target the session, the action, or the object instead
   of the reader. `Vous avez été déconnecté` → `Votre session a été fermée`. A participial heading
   like `Déconnecté` becomes the event noun: `Déconnexion`. Spanish shows the pattern most
   cleanly: `Sesión cerrada` / `Ha cerrado la sesión`, with no participle agreeing with the
   reader.
2. **Use the bare institutional form** for role labels that name a function rather than a person —
   `Autor`, `auteur`, `editorial`. Grammatical gender on a field label asserts nothing about the
   individual named beside it.
3. **Only then** accept a gendered noun, using the established institutional form.

Two constructions that look correct and are not: `Vous devez être connecté` and
`È stato disconnesso` both agree with the reader. Recast them — `Vous devez vous connecter`,
`La sua sessione è stata chiusa`.

**Never use the midpoint.** No `auteur·rice`, no `connecté·e`. The repo ships react-axe
(`npm run dev:axe`) and U+00B7 is a known screen-reader hazard — it is read aloud as punctuation.
Slashed dual forms (`Autor/Autorin`) are equally unwelcome in labels; they are noise in a `<dt>`.

### Patron

"Patron" has no clean formal equivalent that avoids gendering in German, Spanish, or Italian.
Apply rule 1:

- `{{queue}} patrons in the queue` → count the **holds**, not the people:
  `{{queue}} Vormerkungen in der Warteliste` / `{{queue}} réservations dans la file d'attente` /
  `{{queue}} reservas en la lista de espera` / `{{queue}} prenotazioni in lista d'attesa`.
- `{{position}} patrons ahead of you in the queue` → same treatment.
- `Patron ID` → `Ausweisnummer` / `Numéro d'usager` / `Número de usuario` / `Numero utente`.
- `Patron Support` → drop the person: `Support` / `Assistance` / `Asistencia` / `Assistenza`.

## Length policy

German and French routinely run 30–40% longer than English. These strings land in buttons,
nav items, and labels where overflow is a real layout bug:

- every key under `actions.` and `nav.` (namespace `common`)
- any key whose English value is under ~25 characters

For those, choose the shortest accurate rendering. `Download Palace` → `Palace laden`, not
`Palace herunterladen`. As a rule of thumb, a translation more than ~1.4× the length of its
English source in these categories needs a second look.

The deverbal progress forms above were chosen partly for this reason: `Wird ausgeliehen...` is
idiomatic German but 19 characters against a 12-character English source, in a button already
sized for `Ausleihen`.

## Ellipsis and punctuation

- Progress strings end in `...` in English (`Borrowing...`, `Loading...`). Keep three ASCII
  periods, not `…`, to match the source — except where the English itself uses `…`
  (`workLibrarySelector.opening`), where the character is copied as-is.
- French requires a non-breaking space before `?`, `!`, and `:`. Use U+00A0.
- German capitalizes all nouns. Spanish and Italian capitalize only the first word of a UI
  label and proper nouns — do **not** replicate English title case.
- Spanish questions open with `¿`.

**Every colon lives in the value, so every colon is yours to space.** This was not always true:
`BookMetaDetail.tsx` and `BookList.tsx` used to append `": "` in the JSX, which stranded the
bibliographic labels at `Éditeur: ` with no way for French to reach them. The colon has since been
moved into the English value, so `bookDetails.*` and `bookList.*` labels now arrive with a trailing
colon and are spaced exactly like `bookStatus.availability`, `error.error` and
`multiLibraryHome.choose` always were.

The consequences for you:

- A label whose English value ends in `:` **keeps** the colon in every locale. Dropping it drops it
  from the page — nothing in the JSX puts it back.
- French puts U+00A0 before it: `"Publisher:"` → `"Éditeur :"`, `"Narrators:"` → `"Narrateurs :"`.
  German, Spanish and Italian close it up: `"Verlag:"`, `"Editorial:"`, `"Editore:"`.
- The separator between a title and its subtitle is its own key,
  `book.subtitleSeparator` in `common` — English `": {{subtitle}}"`, French
  `" : {{subtitle}}"` with U+00A0 before the colon, unchanged in de/es/it. The leading space is
  load-bearing: the title is rendered immediately before it.

## Plural forms

CLDR categories differ by locale. Verify with
`new Intl.PluralRules("<locale>").resolvedOptions().pluralCategories`:

| Locale     | Categories             |
| ---------- | ---------------------- |
| en, **de** | `one`, `other`         |
| fr, it, es | `one`, `many`, `other` |

The `many` category in fr/it/es applies to large numbers (millions/billions) and in practice
takes the same wording as `other` for this app's counts. `translations:status` reports it as an
optional form and will not fail on it, but write it out anyway — and never leave it empty, because
`translations:sync` strips empty locale-specific forms that are absent from English.

Plural base keys currently in use: `libraryFilterList.librariesMatched`, `utils.book.more`.

## Before you finish

Run through this list. Each item corresponds to a defect that has actually shipped:

- [ ] **Idle vs. progress differ.** No button whose loading text is its own label plus `...`.
- [ ] **Direction of transaction is right.** Nothing tells the patron the library is lending.
- [ ] **Return senses kept apart.** Nothing navigates with the circulation verb.
- [ ] **One pattern per language.** All of `actions.*` uses the same grammatical shape.
- [ ] **No term rendered two ways.** Grep the term across both namespaces before finishing.
- [ ] **Interpolated phrases read correctly end to end.** Substitute the real `{{app}}`,
      `{{field}}`, and `{{authMethod}}` values and read the whole sentence aloud.
- [ ] **Roles respected.** Buttons are not lemmas; headings are not sentences; screen-reader-only
      strings are never abbreviated.
- [ ] **Colons kept and spaced.** Every value whose English ends in `:` still ends in one, with
      U+00A0 before it in French and nothing before it in the other three.
- [ ] **Availability states stay distinct.** "Ready to Borrow" ≠ "Available to borrow".
- [ ] **No midpoints, no slashed dual forms, no masculine agreement** with the reader.
- [ ] **No abbreviations** carried over from a table cell into a rendered string.
