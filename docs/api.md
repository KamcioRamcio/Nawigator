# API

Wszystkie endpointy pod `/api`, JSON. Błędy mają jeden kształt:

| Kod | Kiedy | Treść |
|---|---|---|
| 400 | błędna walidacja (np. brak nazwy, ID nie jest liczbą, zła data) | `{ "errors": [{ "path", "msg", ... }] }` lub `{ "error" }` |
| 401 | złe dane logowania | `{ "error" }` |
| 404 | brak rekordu o danym ID / nieznany endpoint | `{ "error" }` |
| 409 | naruszenie powiązań (usuwanie pozycji użytej w zamówieniu, nieistniejące zamówienie) lub duplikat użytkownika | `{ "error" }` |
| 413 | plik importu > 200 MB | `{ "error" }` |
| 422 | import: migracja nie powiodła się (baza przywrócona) | `{ "error" }` |

Daty: frontend wysyła `YYYY-MM-DD` (pole `<input type="date">`) lub `D.M.YYYY`; backend zapisuje `DD-MM-YYYY`.

## System

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/health` | `{ status: "ok" }` – healthcheck Dockera |
| POST | `/login` | `{ username, password }` → użytkownik bez hasła (`id, username, position, has_password`) lub 401. Użytkownik bez hasła loguje się bez hasła. |
| GET | `/export-database` | pobranie spójnej kopii bazy (`database_export_RRRR-MM-DD.db`) |
| POST | `/import-database` | `multipart/form-data`, pole `database`. Walidacja, kopia `pre_import_*`, podmiana, migracja. |

## Użytkownicy (`/admin`)

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/admin/users` | lista bez haseł (`has_password`) |
| POST | `/admin/users` | `{ username*, password, position* }` → 201 `{ id }`; `position` ∈ `admin, user, viewer` |
| PUT | `/admin/users/:id` | pola pominięte lub puste (`""`) zostają bez zmian – puste hasło nie kasuje hasła. Zdegradowanie ostatniego admina → 409 |
| DELETE | `/admin/users/:id` | usunięcie ostatniego admina → 409 |

## Leki

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/leki-kategorie` | drzewo `kategoria → podkategoria → podpodkategoria → [leki]` (`"null"` = brak) |
| GET | `/leki/status-by-date/:date` | `:date` = `YYYY-MM-DD`; leki, których status ważności zmieni się do tej daty |
| POST | `/leki-all` | `{ lek_nazwa*, lek_ilosc, lek_data, lek_ilosc_minimalna, lek_kategoria, ... }` → 201 `{ id }` |
| PUT | `/leki/:id` | pełna aktualizacja (`lek_nazwa*`, `rozchod_ilosc`, `id_kategorii`, ...) |
| DELETE | `/leki/delete/:id` | 409 jeśli lek jest w zamówieniu |
| GET | `/leki-min-kategorie` | drzewo spisu minimum |
| POST | `/leki-min` | `{ nazwa_leku*, id_kategorii*, pakowanie, w_opakowaniu, ... }` |
| PUT | `/leki-min/:id` | pola pominięte zostają; `""` dla ID kategorii czyści kategorię |
| DELETE | `/leki-min/:id` | |

## Sprzęt

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/sprzet-kategorie` | drzewo `kategoria → podkategoria → [sprzęt]` |
| GET | `/sprzet/status-by-date/:date` | jak dla leków |
| POST | `/sprzet-all` | `{ eq_nazwa*, eq_ilosc_wymagana, eq_ilosc_aktualna, eq_data, eq_kategoria, eq_na_statku, eq_torba_ratownika }` |
| PUT | `/sprzet/:id` | `{ sprzet_nazwa*, ... }`; nie wysłane flagi i kategorie zostają |
| DELETE | `/sprzet/delete/:id` | 409 jeśli sprzęt jest w zamówieniu |
| GET | `/sprzet-zgrany-kategorie` | zgrany spis sprzętu |
| POST | `/sprzet-zgrany-all` | `{ nazwa_sprzetu*, data_waznosci, ilosc, na_statku, ... }` |
| PUT | `/sprzet-zgrany/:id` | pola pominięte zostają (0 jest poprawną ilością) |
| DELETE | `/sprzet-zgrany/delete/:id` | |

## Zamówienia

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/zamowienia` | lista od najnowszej daty, z `leki_count`, `sprzet_count` |
| GET | `/zamowienia/:id` | zamówienie z `leki[]` i `sprzet[]` |
| POST | `/zamowienia` | `{ nazwa*, status, data_zamowienia }` (domyślnie `Nowe`, dziś) |
| PUT | `/zamowienia/:id/status` | `status` ∈ `Nowe, W trakcie, Zamówione, Przyjęte, Zakończone, Anulowane`. Pierwsze `Przyjęte` dodaje stany (transakcja). Przyjęte zamówienie może przejść tylko do `Przyjęte`/`Zakończone`; inny status → 409 `{ code: "ORDER_RECEIVED" }`, chyba że wysłano `cofnijPrzyjecie: true` (cofa stany dodane przy przyjęciu). |
| PUT | `/zamowienia/:id/details` | `{ nazwa, data_zamowienia, uwagi }`, pola pominięte zostają bez zmian |
| POST | `/zamowienia/lek` | `{ id_zamowienia*, id_leku*, ilosc* (≥ 0), uwagi, data_waznosci }` |
| POST | `/zamowienia/sprzet` | `{ id_zamowienia*, id_sprzetu*, ilosc*, ... }` |
| PUT | `/zamowienia/lek/:id`, `/zamowienia/sprzet/:id` | `{ ilosc*, uwagi, data_waznosci }` |
| DELETE | `/zamowienia/lek/:id`, `/zamowienia/sprzet/:id` | usunięcie pozycji |
| DELETE | `/zamowienia/:id` | zamówienie z pozycjami, przeliczenie statusów |

## Utylizacja (`/utylizacja`)

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/utylizacja` | lista z licznikami pozycji |
| GET | `/utylizacja/:id` | szczegóły z `leki[]`, `sprzet[]` |
| POST | `/utylizacja` | `{ nazwa*, status, uwagi, kto_utworzyl }` (domyślnie `Nowa`, dziś) |
| PUT | `/utylizacja/:id/status` | `{ status* }` |
| PUT | `/utylizacja/:id/details` | `{ nazwa*, status, data_utworzenia, uwagi }` – pominięte zostają |
| POST | `/utylizacja/lek` | `{ id_utylizacji*, ilosc*, powod_utylizacji*, id_leku, nazwa_leku, opakowanie, ilosc_nominalna, data_waznosci }` |
| POST | `/utylizacja/sprzet` | `{ id_utylizacji*, ilosc*, powod_utylizacji*, id_sprzetu, nazwa_sprzetu, data_waznosci }` |
| PUT | `/utylizacja/lek/:id`, `/utylizacja/sprzet/:id` | `{ ilosc*, ... }` |
| DELETE | `/utylizacja/lek/:id`, `/utylizacja/sprzet/:id` | usunięcie pozycji |
| DELETE | `/utylizacja/:id` | utylizacja z pozycjami |

`*` – pole wymagane.
