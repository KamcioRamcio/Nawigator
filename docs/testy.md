# Testy

## Backend – `npm test`

`node:test` + `supertest`, pliki w `backend/test/`. Każdy plik testowy działa we własnym procesie z własną bazą tymczasową (`DB_PATH`, `BACKUP_DIR` w `/tmp`).

| Plik | Zakres |
|---|---|
| `schema.test.js` | tabele, idempotentna migracja, seed admina, dodawanie kolumn, konwersja dat, statusy, synchronizacja Leki ↔ spis minimum |
| `medicine.test.js` | wszystkie endpointy leków i spisu minimum, walidacja, 404, 409 |
| `equipment.test.js` | sprzęt i zgrany spis |
| `orders.test.js` | zamówienia, sortowanie po dacie, `Przyjęte` tylko raz, pozycje |
| `utilization.test.js` | utylizacje i ich pozycje |
| `users.test.js` | logowanie (stare zasady), brak haseł w API, edycja bez kasowania hasła |
| `backup.test.js` | eksport, **import starej bazy** (fixture), import prawdziwego dumpu jeśli jest lokalnie, odrzucanie złych plików, kopie i rotacja |
| `utils.test.js` | formatowanie dat |

`backend/test/fixtures/old-schema.sql` – schemat starej wersji (eksport z 2025-04, z jej triggerami) + sztuczne dane.
Test z prawdziwym eksportem (`database_export_2025-04-16.db` w katalogu głównym, poza repozytorium) jest pomijany, gdy pliku nie ma.

## E2E – `npm run test:e2e`

Playwright (tylko komputer deweloperski: `npx playwright install chromium`). Konfiguracja `playwright.config.js` buduje frontend i uruchamia `e2e/start-server.mjs`: serwer produkcyjny na porcie 8899 z bazą zbudowaną z fixture starej wersji – każdy przebieg sprawdza też migrację przy starcie.

| Plik | Zakres |
|---|---|
| `auth.spec.js` | złe/dobre hasło, użytkownik bez hasła, ochrona panelu admina |
| `pages.spec.js` | każda strona bez błędów w konsoli i bez poziomego przewijania przy 1366 px i 375 px |
| `medicine.spec.js` | dodanie, edycja, usunięcie leku, PDF, podgląd statusów w przyszłej dacie |
| `equipment.spec.js` | dodanie sprzętu, dodanie do spisu minimum leków |
| `orders.spec.js` | zamówienie z wiersza leku → Przyjęte → stan rośnie raz; PDF |
| `utilization.spec.js` | utylizacja leku, usunięcie pozycji i całej utylizacji |
| `admin.spec.js` | użytkownicy, eksport, import złego pliku, import starej bazy, import prawdziwego dumpu |

Raport HTML: `playwright-report/` (nie jest commitowany).
