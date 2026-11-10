# Wdrożenie i utrzymanie (laptop na statku)

Docelowo: stary laptop, 4 GB RAM, Linux Mint, Docker. Aplikacja = jeden kontener `nawigator` (~35 MB RAM, limit 300 MB).

## 1. Zbudowanie i wysłanie obrazu (komputer deweloperski)

Laptop tylko pobiera gotowy obraz – nic nie buduje.

```bash
docker build -t weatherme/navigator:latest .
docker push weatherme/navigator:latest
```

## 2. Instalacja / aktualizacja na laptopie

Skrypt `navi.sh` (lokalny, nie jest w repozytorium) – ten sam do pierwszej instalacji i każdej aktualizacji:

```bash
bash navi.sh
```

Co robi:

1. sprawdza architekturę (`x86_64`) i dostęp do Dockera,
2. pobiera obraz,
3. **jednorazowo** kopiuje bazę ze starego kontenera `navigator-backend` (wersje przed 2.0 trzymały bazę w środku kontenera) do `~/nawigator-data/db.sqlite3`,
4. robi kopię bazy `before_update_*.sqlite3` (5 ostatnich),
5. usuwa stare kontenery (`navigator-backend`, `navigator-frontend`, poprzedni `nawigator`) i stary unit systemd `navigator-docker.service`,
6. uruchamia nowy kontener z `--restart unless-stopped` (startuje sam po restarcie laptopa, gdy Docker jest włączony),
7. czeka na healthcheck i pokazuje adres.

Adres: <http://localhost:8888> (taki sam jak wcześniej).

Zmienne do nadpisania: `IMAGE`, `PORT`, `DATA_DIR`, `BACKUP_DIR`.

> Przed pierwszą aktualizacją ze starej wersji warto i tak zrobić **Eksport bazy** z panelu admina.

## Pliki na laptopie

| Ścieżka | Zawartość |
|---|---|
| `~/nawigator-data/db.sqlite3` | baza danych (montowana do `/app/data`) |
| `~/Pulpit/nawigator-backups/db_backup.sqlite3` | kopia po każdej zmianie (2 s po ostatniej) |
| `~/Pulpit/nawigator-backups/db_backup_RRRRMMDD.sqlite3` | kopia dzienna o 00:05, 7 ostatnich |
| `~/Pulpit/nawigator-backups/pre_import_*.sqlite3` | baza sprzed importu, 5 ostatnich |
| `~/Pulpit/nawigator-backups/before_update_*.sqlite3` | baza sprzed aktualizacji, 5 ostatnich |

Folder Pulpitu wykrywany przez `xdg-user-dir DESKTOP` (polski Mint: `~/Pulpit`).

## Przywrócenie kopii

Najprościej: **Panel admina → Importuj bazę** i wybór pliku z `nawigator-backups` (albo przycisk importu na ekranie logowania).
Ręcznie:

```bash
docker stop nawigator
cp ~/Pulpit/nawigator-backups/db_backup_20261110.sqlite3 ~/nawigator-data/db.sqlite3
docker start nawigator
```

## Diagnostyka

```bash
docker ps                      # STATUS powinien mieć "(healthy)"
docker logs --tail 50 nawigator
docker stats --no-stream nawigator
```

Logi kontenera są ograniczone do 2 × 5 MB.

## Uruchomienie bez Dockera

Wymaga Node.js ≥ 22.12 i glibc ≥ 2.38 (binarka `sqlite3`); na starszym systemie użyj Dockera.

```bash
npm ci && npm --prefix backend ci --omit=dev
npm run build
npm start          # http://localhost:8888, baza w backend/data/
```
