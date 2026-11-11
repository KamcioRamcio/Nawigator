# Architektura

Nawigator to aplikacja do inwentaryzacji leków i sprzętu medycznego na statku. Działa na starym laptopie
(4 GB RAM, Linux Mint), dlatego całość to **jeden proces Node.js w jednym kontenerze Docker** (~35 MB RAM).

```mermaid
flowchart LR
    B["Przeglądarka<br/>React 19 + Tailwind 4"] -->|"HTTP :8888"| E
    subgraph K["Kontener nawigator"]
        E["Express 5<br/>server.js / app.js"]
        S["Statyczny frontend<br/>/app/dist"]
        E --> S
        E --> Q["db/*Queries.js"]
        Q --> D[("SQLite<br/>/app/data/db.sqlite3")]
        C["node-schedule<br/>00:05 codziennie"] --> D
    end
    D -. "kopie" .-> BK[("~/Pulpit/nawigator-backups")]
```

## Warstwy

| Katalog | Rola |
|---|---|
| `src/` | Frontend (React). Strony w `src/pages`, modale w `src/components`, generatory PDF w `src/utils` (ładowane dopiero przy generowaniu PDF). |
| `backend/server.js` | Start: migracja bazy, nasłuch HTTP, zadanie nocne. |
| `backend/app.js` | Budowa aplikacji Express (bez efektów ubocznych – używana też w testach). Serwuje `dist/`, gdy ustawiono `STATIC_DIR`. |
| `backend/routes/` | Endpointy REST + walidacja (`express-validator`, wspólne helpery w `validate.js`). |
| `backend/db/` | Zapytania SQL, schemat, triggery i migracja (`schema.js`). |
| `backend/utils/helpers.js` | Kopie zapasowe, eksport, walidacja i import bazy. |
| `backend/middleware/` | Kopia po każdej zmianie (debounce 2 s), obsługa błędów. |

## Najważniejsze decyzje

- **Jeden proces, jeden port (8888).** Wcześniej frontend działał na serwerze deweloperskim Vite (kilkaset MB RAM), a backend w osobnym kontenerze.
- **SQLite + triggery.** Statusy (`status_leku`, `status`, `termin`, `ilosc_termin`) liczą triggery w bazie – opis w [baza-danych.md](baza-danych.md).
- **Daty jako tekst `DD-MM-YYYY`.** Tak zapisywały je wcześniejsze wersje; migracja ujednolica starsze formaty.
- **Migracja przy każdym starcie i imporcie** (`migrate()` w `backend/db/schema.js`) – idempotentna, pozwala importować eksporty ze starych wersji.
- **Logowanie po stronie serwera** (`POST /api/login`) z tymi samymi zasadami co wcześniej; API nie zwraca haseł. Uprawnienia (admin/user/viewer) są nadal sprawdzane tylko w interfejsie.

## Przepływ importu bazy

```mermaid
sequenceDiagram
    participant U as Użytkownik
    participant A as API /import-database
    participant H as helpers.js
    participant D as SQLite
    U->>A: plik .db
    A->>H: importDatabase(plik)
    H->>H: nagłówek SQLite, integrity_check, tabele Leki/Sprzet/users
    alt plik niepoprawny
        H-->>U: 400, dane bez zmian
    else plik poprawny
        H->>D: VACUUM INTO pre_import_*.sqlite3
        H->>D: podmiana pliku bazy
        H->>D: migrate()
        alt migracja się nie powiodła
            H->>D: przywrócenie pre_import
            H-->>U: 422
        else OK
            H-->>U: 200
        end
    end
```

## Nieużywany kod (outdated)

Te pliki zostają w repo, ale nie są dostępne z aplikacji. Mają na górze komentarz „OUTDATED”:

| Plik | Co to jest | Dlaczego nieużywane |
|---|---|---|
| `src/pages/Eq/OrganizedEquipment.jsx` | strona „Zgrany spis sprzętu” (tabela `Sprzet_zgrany_spis`, API `/api/sprzet-zgrany*` działa) | brak trasy w `App.jsx` i linku w menu |
| `src/components/AddItemToUtilizationModal.jsx` | ręczne dodanie do utylizacji pozycji spoza spisu | renderowane w `UtilizationList`, ale żaden przycisk go nie otwiera |

Przed ponownym podpięciem trzeba je przetestować. Nie były objęte poprawkami UI z listopada 2026, poza statusami i nazwami pól.
