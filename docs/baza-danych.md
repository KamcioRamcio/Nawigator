# Baza danych

SQLite w jednym pliku (`DB_PATH`, w kontenerze `/app/data/db.sqlite3`). Schemat, triggery i migracja: `backend/db/schema.js`.

## Tabele

```mermaid
erDiagram
    Kategorie ||--o{ Pod_kategorie : ""
    Pod_kategorie ||--o{ Pod_pod_kategorie : ""
    Kategorie ||--o{ Leki : ""
    Leki ||--|| Leki_spis_min : "synchronizacja po nazwa_leku"
    Kategorie_sprzet ||--o{ Pod_kategorie_sprzet : ""
    Kategorie_sprzet ||--o{ Sprzet : ""
    Kategorie_sprzet ||--o{ Sprzet_zgrany_spis : ""
    Zamowienia ||--o{ Zamowienia_Leki : ""
    Zamowienia ||--o{ Zamowienia_Sprzet : ""
    Leki ||--o{ Zamowienia_Leki : ""
    Sprzet ||--o{ Zamowienia_Sprzet : ""
    Utylizacje ||--o{ Utylizacje_Leki : ""
    Utylizacje ||--o{ Utylizacje_Sprzet : ""
    Leki |o--o{ Utylizacje_Leki : "kopia nazwy"
    Sprzet |o--o{ Utylizacje_Sprzet : "kopia nazwy"
```

| Tabela | Zawartość |
|---|---|
| `Leki` | Główny spis leków: `ilosc_wstepna`, `rozchod_ilosc` (stan = różnica), `ilosc_minimalna`, `data_waznosci`, statusy, historia dostaw w `important_status` (`5x31-12-2027; …`). |
| `Leki_spis_min` | Spis minimum leków. Dodanie/zmiana/usunięcie po jednej stronie trafia triggerem do drugiej (dopasowanie po `nazwa_leku`). |
| `Sprzet` | Spis sprzętu: `ilosc_wymagana`, `ilosc_aktualna`, statusy, historia dostaw w `status`. |
| `Sprzet_zgrany_spis` | Zgrany spis sprzętu (daty w formacie `YYYY-MM-DD` – tak zapisuje je formularz). |
| `Zamowienia`, `Zamowienia_Leki`, `Zamowienia_Sprzet` | Zamówienia i ich pozycje. Klucze obce: nie można usunąć leku/sprzętu użytego w zamówieniu (API zwraca 409). |
| `Utylizacje`, `Utylizacje_Leki`, `Utylizacje_Sprzet` | Utylizacje. Pozycje przechowują kopię nazwy, więc historia zostaje po usunięciu leku/sprzętu. |
| `users` | Użytkownicy: `username`, `password` (jawny tekst – zgodność ze starymi bazami), `position` = `admin` / `user` / `viewer`. |
| `Utylizacja`, `Uzytkownicy`, `last_ids_temp` | Pozostałości starszych wersji – nieużywane, zostawione dla zgodności. |

## Statusy

Dwa niezależne statusy na pozycję:

| Lek | Sprzęt | Znaczenie |
|---|---|---|
| `status_leku` | `termin` | ważność: `Przeterminowane`, `Ważność 1 miesiąc`, `Ważność 3 miesiące`, `Brak na stanie`, `Ważny` |
| `status` | `ilosc_termin` | stan/zamówienie: `W zamówieniu: <nazwa>`, `Zamówione`, `Do zamówienia`, `Uwaga Ilość`, `W porządku` |

```mermaid
flowchart TD
    A{"Pozycja w zamówieniu<br/>o statusie Zamówione?"} -->|tak| Z["Zamówione"]
    A -->|nie| B{"W zamówieniu<br/>Nowe / W trakcie?"}
    B -->|tak| W["W zamówieniu: nazwa"]
    B -->|nie| C{"stan <= 0?"}
    C -->|tak| DZ["Do zamówienia"]
    C -->|nie| D{"stan < minimum?"}
    D -->|"tak, ważny"| U["Uwaga Ilość"]
    D -->|"tak, kończy się ważność"| DZ
    D -->|nie| E{"ważność < 3 miesiące<br/>lub brak na stanie?"}
    E -->|tak| DZ
    E -->|nie| OK["W porządku"]
```

- Ważność liczą triggery przy dodaniu/zmianie daty oraz **zadanie nocne o 00:05** (`refreshStatuses()`), bo zależy od dzisiejszej daty.
- `updateStatusTrigger()` (start, noc, usunięcie zamówienia) najpierw ustawia `Zamówione` pozycjom z aktywnych zamówień, ale trigger wiersza od razu przelicza je na wynik z diagramu – pozycja z zamówienia `Nowe`/`W trakcie` kończy jako `W zamówieniu: <nazwa>`.
- Gdy pozycja jest w kilku otwartych zamówieniach, nazwa pochodzi z zamówienia, do którego dodano ją **najwcześniej** (`ORDER BY` id pozycji – dokładnie tak, jak działały wcześniejsze wersje).
- Zmiana statusu zamówienia na **Przyjęte** dodaje zamówione ilości do stanu **tylko raz** (ponowne zapisanie tego samego statusu nic nie dodaje), dopisuje `ilość x data` do historii i ustawia datę ważności, jeśli pozycji nie było na stanie lub nie miała daty.
- Przyjęcie jest zapisywane: `Zamowienia.data_przyjecia` oraz na każdej pozycji `przyjeta_ilosc`, `przyjety_wpis` (dopisany wpis historii), `przed_przyjeciem_data` i `zmieniono_date`.
- Przyjęte zamówienie może przejść tylko do `Zakończone`. Każdy inny status wymaga **cofnięcia przyjęcia** (w UI karta z potwierdzeniem):
  - stan zmniejsza się o `przyjeta_ilosc`;
  - z historii znika `przyjety_wpis`;
  - data ważności wraca do poprzedniej, jeśli przyjęcie ją ustawiło i nikt jej potem nie zmienił;
  - pozycje dodane po przyjęciu nie są ruszane.
- Zamówienia przyjęte w starszych wersjach (status `Przyjęte` bez `data_przyjecia`) migracja oznacza jako przyjęte (`data_przyjecia = data_zamowienia`, `przyjeta_ilosc = ilosc`). Ich cofnięcie zdejmuje ilość i wpis historii, ale daty nie zmienia.

## Migracja (`migrate()`)

Uruchamiana przy każdym starcie i po każdym imporcie, idempotentna:

1. `CREATE TABLE IF NOT EXISTS` dla wszystkich tabel (stare eksporty nie mają np. `Zamowienia*`, `Utylizacje*`).
2. Dodanie brakujących kolumn – wzorcem jest schemat zbudowany w bazie `:memory:`.
3. Indeksy `idx_*` (zwykłe, nie `UNIQUE`, więc nie wywrócą importu bazy z duplikatami; starsze wersje aplikacji je ignorują).
4. Odtworzenie triggerów (stare bazy mają triggery odwołujące się do nieistniejących tabel).
5. Daty `YYYY-MM-DD` i `D.M.YYYY` → `DD-MM-YYYY` (wartości nieparsowalne zostają bez zmian).
6. Przeliczenie statusów.
7. Jeśli tabela `users` jest pusta – utworzenie użytkownika `admin` bez hasła.

## Wydajność

- **Indeksy** na `nazwa_leku` (obie listy leków – po tym działają triggery synchronizacji) i na wszystkich kluczach obcych (`Zamowienia_*`, `Utylizacje_*`, podkategorie). Bez nich każdy trigger i każde sprawdzenie FK skanowało całą tabelę.
- **Synchronizacja `Leki` ↔ `Leki_spis_min`** odpala się tylko, gdy zmienia się pole wspólne dla obu list (nazwa, opakowanie, przechowywanie, „na statku”, kategorie). Zmiana stanu czy rozchodu nie dotyka już spisu minimum – wcześniej każdy zapis odbijał się tam i z powrotem.
- To, co wcześniej działo się „przy okazji” (nocne przepisanie `Leki_spis_min` wartościami z `Leki`), robi teraz jedno zapytanie na początku `updateStatusTrigger()`. Rozjechane spisy w starej bazie są więc dalej naprawiane po imporcie i co noc, z tą samą zasadą: wygrywa `Leki`.
- Pomiar (zrzut ×20, ok. 2600 leków): `refreshStatuses()` 1,7 s → 17 ms, `migrate()` 3,1 s → 40 ms. Na prawdziwej bazie: 8 ms → 1,6 ms.
- Równoważność sprawdzona porównaniem A/B: ten sam scenariusz (CRUD, zamówienia we wszystkich statusach, utylizacje, nocne odświeżenie, eksport i import) na starym i nowym kodzie daje identyczną zawartość wszystkich tabel i identyczne odpowiedzi API.
