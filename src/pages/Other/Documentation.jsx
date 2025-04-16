import React, {useState} from 'react';

const Documentation = () => {
    // State to keep track of the active section
    const [activeSection, setActiveSection] = useState('introduction');

    // Documentation sections
    const sections = [
        {id: 'introduction', title: 'Wprowadzenie'},
        {id: 'starting_info', title: 'Ważne informacje'},
        {id: 'login', title: 'Logowanie i zarządzanie użytkownikami'},
        {id: 'equipment', title: 'Zarządzanie sprzętem'},
        {id: 'medicines', title: 'Zarządzanie lekami'},
        {id: 'utilization', title: 'Utylizacja'},
        {id: 'database', title: 'Import/Export bazy danych'},
        {id: 'pages', title: 'Arkusze'},
    ];

    // Documentation content for each section
    const documentationContent = {
        introduction: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Wprowadzenie do Systemu Inwentaryzacji Medycznej</h2>

                <p className="mb-4">
                    Aplikacja została zaprojektowana, aby pomóc w zarządzaniu sprzętem oraz lekami. Ta dokumentacja
                    pomoże Ci zrozumieć, jak korzystać z różnych funkcji aplikacji.
                </p>

                <p className="mb-4">
                    Wybierz sekcję z menu po lewej stronie, aby przejść do odpowiedniej części dokumentacji.
                </p>

                <h3 className="text-xl font-bold mb-2">Tabele</h3>

                <p className="mb-4">
                    W aplikacji znajduje się osiem głównych tabel:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li>Główny Spis Leków - pełna lista leków z wszystkimi szczegółami</li>
                    <li>Zestawienie Leków - uproszczona lista leków z kluczowymi informacjami</li>
                    <li>Spis Minimum Leków - lista minimalnych wymagań dotyczących leków</li>
                    <li>Spis Minimum Sprzętu - lista minimalnych wymagań dotyczących sprzętu</li>
                    <li>Spis Sprzętu - uproszczona lista sprzętu</li>
                    <li>Zgrany Spis Sprzętu - zorganizowana lista sprzętu</li>
                    <li>Utylizacja - rejestr utylizowanych materiałów</li>
                    <li>Admin - zarządzanie użytkownikami i uprawnieniami</li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Operacje między tabelami</h3>

                <p className="mb-4">
                    System umożliwia wykonywanie operacji, które mogą wpływać na wiele tabel jednocześnie:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li>Utylizacja leków i sprzętu aktualizuje stan magazynowy</li>
                    <li>Edycja przedmiotów może być ograniczona w zależności od uprawnień użytkownika</li>
                    <li>Zmiany są śledzone z informacją o użytkowniku, który dokonał modyfikacji</li>
                </ul>
            </div>
        ),

        starting_info: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Ważne informacje</h2>

                <h3 className="text-xl font-bold mb-2">Oznaczenia kolorów</h3>

                <ul className="list-disc pl-8 mb-4">
                    <li><span className="text-blue-500 font-bold">Niebieskie</span> wypełnienie - przedmioty
                        przechowywane w lodówce
                    </li>
                    <li><span className="text-orange-400 font-bold">Pomarańczowe</span> wypełnienie - narkotyki</li>
                    <li><span className="text-green-500 font-bold">Zielone</span> wypełnienie - wyposażenie torby
                        ratownika
                    </li>
                    <li><span className="text-red-500 font-bold">Czerwony</span> tekst - przedmioty ze spisu
                        podstawowego, których brak na statku
                    </li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Role użytkowników</h3>

                <p className="mb-4">System oferuje trzy poziomy uprawnień użytkowników:</p>

                <ul className="list-disc pl-8 mb-4">
                    <li><strong>Admin</strong> - pełny dostęp do wszystkich funkcji i możliwość edycji wszystkich pól
                    </li>
                    <li><strong>Editor</strong> - możliwość edytowania wybranych pól</li>
                    <li><strong>Viewer</strong> - dostęp tylko do przeglądania danych bez możliwości wprowadzania zmian
                    </li>
                </ul>
            </div>
        ),

        login: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Logowanie i zarządzanie użytkownikami</h2>

                <h3 className="text-xl font-bold mb-2">Logowanie do systemu</h3>

                <p className="mb-4">
                    Aby uzyskać dostęp do systemu, musisz zalogować się przy użyciu swoich danych uwierzytelniających:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Na stronie logowania wybierz swoje nazwisko z listy rozwijanej</li>
                    <li>Wprowadź hasło (jeśli zostało ustawione)</li>
                    <li>Kliknij przycisk "Zaloguj"</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Panel administracyjny</h3>

                <p className="mb-4">
                    Panel administracyjny jest dostępny tylko dla użytkowników z rolą "admin" i umożliwia:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li>Dodawanie nowych użytkowników</li>
                    <li>Edycję istniejących użytkowników</li>
                    <li>Usuwanie użytkowników</li>
                    <li>Zarządzanie rolami (admin, editor, viewer)</li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Dodawanie nowego użytkownika</h3>

                <p className="mb-4">
                    Aby dodać nowego użytkownika (tylko administrator):
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Przejdź do panelu administracyjnego</li>
                    <li>Kliknij przycisk "Dodaj użytkownika"</li>
                    <li>Wypełnij formularz z informacjami o użytkowniku:
                        <ul className="list-disc pl-8 mt-2">
                            <li>Nazwa użytkownika</li>
                            <li>Hasło (opcjonalne)</li>
                            <li>Rola (admin, editor, viewer)</li>
                        </ul>
                    </li>
                    <li>Kliknij "Zapisz" aby dodać użytkownika</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Edycja użytkownika</h3>

                <p className="mb-4">
                    Aby edytować istniejącego użytkownika:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>W panelu administracyjnym znajdź użytkownika, którego chcesz edytować</li>
                    <li>Kliknij przycisk "Edytuj" obok tego użytkownika</li>
                    <li>Zmodyfikuj odpowiednie pola</li>
                    <li>Kliknij "Zapisz" aby zatwierdzić zmiany</li>
                </ol>
            </div>
        ),

        equipment: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Zarządzanie sprzętem</h2>

                <p className="mb-4">
                    Moduł zarządzania sprzętem pozwala na pełną kontrolę nad inwentarzem, śledzenie statusu i stanu
                    magazynowego.
                </p>

                <h3 className="text-xl font-bold mb-2">Główne widoki sprzętu</h3>

                <p className="mb-4">
                    W systemie dostępne są trzy główne widoki dotyczące sprzętu:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li><strong>Główny Spis Sprzętu</strong> (MainEquipmentList) - pełna lista z wszystkimi szczegółami
                        i możliwością edycji
                    </li>
                    <li><strong>Spis Sprzętu</strong> (EquipmentList) - uproszczony widok z kluczowymi informacjami</li>
                    <li><strong>Zgrany Spis Sprzętu</strong> (OrganizedEquipment) - widok zorganizowany według kategorii
                    </li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Dodawanie nowego sprzętu</h3>

                <p className="mb-4">
                    Aby dodać nowy sprzęt do systemu:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Kliknij przycisk "Dodaj nowy sprzęt" dostępny w głównym widoku sprzętu</li>
                    <li>Wypełnij formularz z informacjami o sprzęcie:
                        <ul className="list-disc pl-8 mt-2">
                            <li>Nazwa sprzętu</li>
                            <li>Ilość wymagana</li>
                            <li>Ilość aktualna</li>
                            <li>Data ważności</li>
                            <li>Kategoria i podkategoria</li>
                            <li>Informacja czy jest na statku</li>
                            <li>Informacja czy jest w torbie ratownika</li>
                        </ul>
                    </li>
                    <li>Kliknij "Dodaj" aby zapisać nowy sprzęt</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Edycja istniejącego sprzętu</h3>

                <p className="mb-4">
                    Aby edytować istniejący sprzęt:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Znajdź sprzęt, który chcesz edytować</li>
                    <li>Kliknij przycisk "Edytuj" obok tego sprzętu</li>
                    <li>Zmodyfikuj odpowiednie pola (dostępność pól zależy od uprawnień użytkownika)</li>
                    <li>Kliknij "Zapisz" aby zatwierdzić zmiany</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Pola specjalne</h3>

                <p className="mb-4">
                    W widokach sprzętu dostępne są specjalne pola i oznaczenia:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li><strong>Na statku</strong> - informuje czy przedmiot jest obecnie na statku</li>
                    <li><strong>Torba ratownika</strong> - oznacza sprzęt, który jest częścią wyposażenia torby
                        ratownika
                    </li>
                    <li><strong>Status</strong> - informuje o stanie przedmiotu (ważny, przeterminowany itp.)</li>
                    <li><strong>Kto zmienił</strong> - śledzenie ostatniego użytkownika, który modyfikował wpis</li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Utylizacja sprzętu</h3>

                <p className="mb-4">
                    Sprzęt, który wymaga utylizacji, może być oznaczony i przeniesiony do rejestru utylizacji:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Znajdź sprzęt, który chcesz utylizować</li>
                    <li>Kliknij przycisk "Utylizacja" obok tego sprzętu</li>
                    <li>Wypełnij formularz utylizacji podając powód i ilość</li>
                    <li>Kliknij "Potwierdź" aby zatwierdzić utylizację</li>
                </ol>
            </div>
        ),

        medicines: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Zarządzanie lekami</h2>

                <p className="mb-4">
                    Moduł zarządzania lekami pozwala na pełną kontrolę nad inwentarzem, śledzenie statusu i stanu
                    magazynowego.
                </p>

                <h3 className="text-xl font-bold mb-2">Główne widoki leków</h3>

                <p className="mb-4">
                    W systemie dostępne są trzy główne widoki dotyczące leków:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li><strong>Główny Spis Leków</strong> (MainMedicineList) - pełna lista z wszystkimi szczegółami i
                        możliwością edycji
                    </li>
                    <li><strong>Zestawienie Leków</strong> (MedicineList) - uproszczony widok z kluczowymi informacjami
                    </li>
                    <li><strong>Spis Minimum Leków</strong> (MinMedicine) - lista minimalnych wymagań dotyczących leków
                    </li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Dodawanie nowego leku</h3>

                <p className="mb-4">
                    Aby dodać nowy lek do systemu:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Kliknij przycisk "Dodaj nowy lek" dostępny w głównym widoku leków</li>
                    <li>Wypełnij formularz z informacjami o leku:
                        <ul className="list-disc pl-8 mt-2">
                            <li>Nazwa leku</li>
                            <li>Ilość</li>
                            <li>Opakowanie</li>
                            <li>Data ważności</li>
                            <li>Ilość minimalna</li>
                            <li>Informacja o przechowywaniu (lodówka)</li>
                            <li>Kategoria, podkategoria i podpodkategoria</li>
                        </ul>
                    </li>
                    <li>Kliknij "Dodaj" aby zapisać nowy lek</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Edycja istniejącego leku</h3>

                <p className="mb-4">
                    Aby edytować istniejący lek:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Znajdź lek, który chcesz edytować</li>
                    <li>Kliknij przycisk "Edytuj" obok tego leku</li>
                    <li>Zmodyfikuj odpowiednie pola (dostępność pól zależy od uprawnień użytkownika)</li>
                    <li>Kliknij "Zapisz" aby zatwierdzić zmiany</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Pola specjalne</h3>

                <p className="mb-4">
                    W widokach leków dostępne są specjalne pola i oznaczenia:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li><strong>Rozchód</strong> - ilość leku, która została wykorzystana</li>
                    <li><strong>Aktualnie na statku</strong> - aktualna ilość leku dostępna na statku automatycznie
                        wyliczna na podstawie ilości aktualnej oraz rozchodu
                    </li>
                    <li><strong>Status</strong> - informuje o stanie leku (ważny, przeterminowany itp.) automatycznie
                        tworzone na podstawie aktualnej daty oraz ilości na statku
                    </li>
                    <li><strong>Ważny Status</strong> - informuje o istotnych uwagach dotyczących leku</li>
                    <li><strong>Przechowywanie</strong> - informuje o specjalnych warunkach przechowywania</li>
                    <li><strong>Kto zmienił</strong> - śledzenie ostatniego użytkownika, który modyfikował wpis</li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Utylizacja leków</h3>

                <p className="mb-4">
                    Leki, które wymagają utylizacji, mogą być oznaczone i przeniesione do rejestru utylizacji:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Znajdź lek, który chcesz utylizować</li>
                    <li>Kliknij przycisk "Utylizacja" obok tego leku</li>
                    <li>Wypełnij formularz utylizacji podając powód i ilość</li>
                    <li>Kliknij "Potwierdź" aby zatwierdzić utylizację</li>
                </ol>
            </div>
        ),

        utilization: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Utylizacja</h2>

                <p className="mb-4">
                    W tej sekcji znajdziesz informacje na temat utylizacji sprzętu oraz leków.
                </p>

                <h3 className="text-xl font-bold mb-2">Widok utylizacji</h3>

                <p className="mb-4">
                    Widok utylizacji zawiera listę przedmiotów przeznaczonych do utylizacji z podziałem na grupy:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li>Grupa S - sprzęt medyczny</li>
                    <li>Grupa L - leki</li>
                    <li>Inne grupy - pozostałe materiały</li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Dodawanie pozycji do utylizacji</h3>

                <p className="mb-4">
                    Możesz dodać pozycję do utylizacji na dwa sposoby:
                </p>

                <ul className="list-disc pl-8 mb-4">
                    <li><strong>Bezpośrednio z widoku utylizacji</strong>:
                        <ol className="list-decimal pl-8 mt-2">
                            <li>Kliknij przycisk "Dodaj nową utylizację"</li>
                            <li>Wypełnij formularz z informacjami o utylizowanym przedmiocie</li>
                            <li>Kliknij "Dodaj" aby zapisać</li>
                        </ol>
                    </li>
                    <li><strong>Z widoku leków lub sprzętu</strong>:
                        <ol className="list-decimal pl-8 mt-2">
                            <li>Znajdź przedmiot do utylizacji</li>
                            <li>Kliknij przycisk "Utylizacja" obok tego przedmiotu</li>
                            <li>Podaj powód i ilość do utylizacji</li>
                            <li>Potwierdź operację</li>
                        </ol>
                    </li>
                </ul>

                <h3 className="text-xl font-bold mb-2">Edycja pozycji utylizacji</h3>

                <p className="mb-4">
                    Aby edytować istniejącą pozycję utylizacji:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Znajdź pozycję, którą chcesz edytować</li>
                    <li>Kliknij przycisk "Edytuj" obok tej pozycji</li>
                    <li>Zmodyfikuj odpowiednie pola</li>
                    <li>Kliknij "Zapisz" aby zatwierdzić zmiany</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Usuwanie pozycji utylizacji</h3>

                <p className="mb-4">
                    Aby usunąć pozycję z listy utylizacji:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Znajdź pozycję, którą chcesz usunąć</li>
                    <li>Kliknij przycisk "Usuń" obok tej pozycji</li>
                    <li>Potwierdź chęć usunięcia pozycji</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Eksport do PDF</h3>

                <p className="mb-4">
                    Rejestr utylizacji można wyeksportować do pliku PDF:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Kliknij przycisk "Eksportuj do PDF" w widoku utylizacji</li>
                    <li>System wygeneruje plik PDF z aktualnym rejestrem utylizacji</li>
                    <li>Zapisz lub wydrukuj wygenerowany plik</li>
                </ol>
            </div>
        ),

        database: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Import/Export Bazy danych</h2>

                <p className="mb-4">
                    System umożliwia import i eksport bazy danych, co pozwala na tworzenie kopii zapasowych oraz
                    przenoszenie danych między instalacjami.
                </p>

                <h3 className="text-xl font-bold mb-2">Eksport bazy danych</h3>

                <p className="mb-4">
                    Aby wykonać eksport bazy danych:
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Kliknij przycisk "Eksportuj bazę danych" dostępny w widokach utylizacji lub innych (dla
                        użytkowników z odpowiednimi uprawnieniami)
                    </li>
                    <li>System wygeneruje plik .db zawierający kopię bazy danych</li>
                    <li>Plik zostanie automatycznie pobrany przez przeglądarkę</li>
                    <li>Nazwa pliku zawiera datę eksportu dla łatwiejszej identyfikacji</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Import bazy danych</h3>

                <p className="mb-4">
                    Aby zaimportować bazę danych (wymaga uprawnień administratora):
                </p>

                <ol className="list-decimal pl-8 mb-4">
                    <li>Kliknij przycisk "Importuj bazę danych"</li>
                    <li>Wybierz plik .db lub .sqlite zawierający bazę danych do importu</li>
                    <li>Potwierdź operację importu</li>
                    <li>System zaimportuje dane i przeładuje stronę po zakończeniu</li>
                </ol>

                <h3 className="text-xl font-bold mb-2">Uwagi dotyczące importu i eksportu</h3>

                <ul className="list-disc pl-8 mb-4">
                    <li>Import bazy danych zastępuje wszystkie istniejące dane - przed importem upewnij się, że wykonano
                        kopię zapasową
                    </li>
                    <li>Dostęp do funkcji importu i eksportu jest ograniczony tylko do użytkowników z odpowiednimi
                        uprawnieniami
                    </li>
                    <li>Zaleca się regularne wykonywanie kopii zapasowych poprzez eksport bazy danych</li>
                    <li>Eksportowany plik bazy danych zawiera kompletny stan systemu, w tym informacje o użytkownikach
                    </li>
                </ul>
            </div>
        ),

        pages: (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Arkusze</h2>

                <p className="mb-4">
                    W tej sekcji znajdziesz informacje na temat arkuszy dostępnych w systemie.
                </p>

                <h3 className="text-xl font-bold mb-2">Główny Spis Leków</h3>

                <p className="mb-4">
                    Arkusz "Główny Spis Leków" zawiera listę leków wraz ze stanem magazynowym oraz rozchodem.
                </p>

                <p className="mb-4">
                    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by
                        przejść do arkusza
                    </button>
                </p>

                <h3 className="text-xl font-bold mb-2">Zestawienie Leków</h3>

                <p className="mb-4">
                    Arkusz "Zestawienie Leków" zawiera minimalistyczą listę z ilością produktów (aktualna/minimalna),
                    datę ważności oraz status.
                </p>

                <p className="mb-4">
                    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by
                        przejść do arkusza
                    </button>
                </p>

                <h3 className="text-xl font-bold mb-2">Spis Minimum Leków</h3>

                <p className="mb-4">
                    Arkusz "Spis Minimum Leków" zawiera listę z informacjami odnośnie rodzaju opakowania danych leków.
                </p>

                <p className="mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by przejść do
                        arkusza
                    </button>
                </p>

                <h3 className="text-xl font-bold mb-2">Spis Minimum Sprzętu</h3>

                <p className="mb-4">
                    Arkusz "Spis Minimum Sprzętu" zawiera listę z informacjami o sprzęcie medycznym wraz z dodatkowymi
                    informacjami.
                </p>

                <p className="mb-4">
                    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by
                        przejść do arkusza
                    </button>
                </p>

                <h3 className="text-xl font-bold mb-2">Spis Sprzętu</h3>

                <p className="mb-4">
                    Arkusz "Spis Sprzętu" zawiera minimalistyczną listę z informacjami: nazwa, data ważności, ilość na
                    statku.
                </p>

                <p className="mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by przejść do
                        arkusza
                    </button>
                </p>

                <h3 className="text-xl font-bold mb-2">Zgrany Spis Sprzętu</h3>

                <p className="mb-4">
                    Arkusz "Zgrany Spis Sprzętu" zawiera zgrany spis sprzętu.
                </p>

                <p className="mb-4">
                    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by
                        przejść do arkusza
                    </button>
                </p>

                <h3 className="text-xl font-bold mb-2">Utylizacja</h3>

                <p className="mb-4">
                    Arkusz "Utylizacja" zawiera pozycje do utylizacji z podziałem na grupy.
                </p>

                <p className="mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by przejść do
                        arkusza
                    </button>
                </p>

                <h3 className="text-xl font-bold mb-2">Panel Administracyjny</h3>

                <p className="mb-4">
                    Arkusz "Admin" umożliwia zarządzanie użytkownikami i ich uprawnieniami.
                </p>

                <p className="mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Kliknij by przejść do
                        arkusza
                    </button>
                </p>
            </div>
        ),
    };

    return (
        <div className="flex">
            {/* Sidebar navigation */}
            <div className="w-1/4 bg-gray-100 min-h-screen p-4">
                <h2 className="text-xl font-bold mb-4">Dokumentacja</h2>
                <ul>
                    {sections.map(section => (
                        <li key={section.id} className="mb-2">
                            <button
                                className={`w-full text-left p-2 rounded ${
                                    activeSection === section.id
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-gray-200'
                                }`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                {section.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content area */}
            <div className="w-3/4 p-4">
                {documentationContent[activeSection]}
            </div>
        </div>
    );
};

export default Documentation;
