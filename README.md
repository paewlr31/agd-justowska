# AGD Justowska

Strona salonu (bez koszyka i płatności) oraz osobny panel właściciela.

- Strona: `http://localhost:3000`
- Panel: `http://localhost:3000/panel`

Panel nie jest podlinkowany w menu. Wejście jest hasłem z pliku `.env.local`.

## Uruchomienie na tym komputerze

W katalogu `projekt-strony-agd`:

```bash
pnpm install
pnpm dev
```

Otwórz stronę i panel w przeglądarce. Katalog startowy (188 modeli z excela, 19 marek, galeria) zapisuje się lokalnie w `data/db.json`.

Żeby wrócić do katalogu z excela, zatrzymaj serwer, usuń plik `data/db.json` i uruchom `pnpm dev` ponownie.

## Hasło panelu

Jest w `.env.local` jako `ADMIN_PASSWORD`. Nie wysyłaj tego hasła razem z linkiem dla gościa, jeśli ma tylko oglądać ofertę.

## Formularz kontaktowy (Web3Forms, za darmo)

1. Wejdź na https://web3forms.com
2. Podaj adres `biuro@agdjustowska.pl` i potwierdź maila.
3. Skopiuj Access Key.
4. Wklej go w `.env.local` jako `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`.
5. Zatrzymaj i ponownie uruchom `pnpm dev`.

Bez tego klucza formularz otwiera program pocztowy. Po wklejeniu klucza wiadomość idzie od razu na skrzynkę, bez otwierania maila.

## Wrzucenie do internetu (dwa linki dla gościa)

Potrzebne są trzy darmowe konta: GitHub, Vercel i Supabase.

### 1. Baza Supabase

1. Załóż projekt na https://supabase.com (plan Free).
2. Wejdź w **SQL Editor**, wklej całą treść pliku `supabase/schema.sql` i kliknij **Run**.
3. W **Project Settings → API** skopiuj:
   - Project URL → `SUPABASE_URL`
   - service_role (secret) → `SUPABASE_SERVICE_ROLE_KEY`
4. Wpisz oba w `.env.local`.
5. Wgraj katalog i zdjęcia galerii:

```bash
pnpm seed
```

### 2. GitHub

W katalogu `projekt-strony-agd`:

```bash
git init
git add .
git commit -m "Strona i panel AGD Justowska"
```

Na https://github.com/new utwórz puste repozytorium i wyślij kod (`git remote add` oraz `git push`), tak jak podpowie GitHub.

Nie commituj `.env.local`. Hasła zostają tylko u Ciebie.

### 3. Vercel

1. https://vercel.com → **Add New Project** → import repozytorium z GitHuba.
2. Framework: Next.js. Katalog główny: ten, w którym jest `package.json`.
3. W **Environment Variables** wklej te same wartości co w `.env.local`:
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy**.

Dostaniesz dwa adresy:

- `https://twoja-nazwa.vercel.app` — strona dla klientów
- `https://twoja-nazwa.vercel.app/panel` — panel właściciela

Każdy kolejny `git push` na GitHuba sam odświeża stronę na Vercelu.

## Co jest w panelu

1. Wybierz producenta z listy.
2. Wybierz typ urządzenia albo dopisz nowy typ (potrzebne przy markach bez modeli, np. BORA).
3. Podaj model, cenę detaliczną, opis i ewentualnie zdjęcie.
4. Usuń model przyciskiem **Usuń**. **Edytuj** poprawia opis, cenę i zdjęcie.

Zdjęcia produktów z excela nie zostały pobrane ze stron producentów. Karty bez zdjęcia pokazują model, typ, opis i cenę. Zdjęcie pojawia się dopiero po wgraniu w panelu.

Galeria startowa to Twoje zdjęcia z folderu `galeria`. W panelu, zakładka **Galeria**, można je dodawać i usuwać.

Zdjęcia ze strony „O firmie” pochodzą z folderu `homePagePhotos`, logo z folderu `logo`.
