import React, {useState} from 'react';

const Documentation = () => {
    // State to keep track of the active section
    const [activeSection, setActiveSection] = useState('introduction');

    // Documentation sections
    const sections = [
        {id: 'introduction', title: 'Wprowadzenie', icon: '📋'},
        {id: 'starting_info', title: 'Ważne informacje', icon: '⚠️'},
        {id: 'login', title: 'Logowanie i zarządzanie użytkownikami', icon: '👤'},
        {id: 'equipment', title: 'Zarządzanie sprzętem', icon: '🏥'},
        {id: 'medicines', title: 'Zarządzanie lekami', icon: '💊'},
        {id: 'utilization', title: 'Utylizacja', icon: '♻️'},
        {id: 'orders', title: 'Zarządzanie Zamówieniami', icon: '📦'},
        {id: 'database', title: 'Import/Export bazy danych', icon: '💾'},
        {id: 'pages', title: 'Arkusze', icon: '📊'},
    ];

    // Documentation content for each section
    const documentationContent = {
        introduction: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Wprowadzenie do Systemu Inwentaryzacji Medycznej
                    </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-gray-700">
                        Aplikacja została zaprojektowana, aby pomóc w zarządzaniu sprzętem oraz lekami. Ta dokumentacja
                        pomoże Ci zrozumieć, jak korzystać z różnych funkcji aplikacji.
                    </p>
                </div>

                <p className="mb-6 text-gray-600">
                    Wybierz sekcję z menu po lewej stronie, aby przejść do odpowiedniej części dokumentacji.
                </p>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">▶</span> Tabele
                    </h3>

                    <p className="mb-4 text-gray-600">
                        W aplikacji znajduje się osiem głównych tabel:
                    </p>

                    <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Główny Spis Leków</strong> - pełna lista leków z wszystkimi szczegółami</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Zestawienie Leków</strong> - uproszczona lista leków z kluczowymi informacjami</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Spis Minimum Leków</strong> - lista minimalnych wymagań dotyczących leków</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Spis Minimum Sprzętu</strong> - lista minimalnych wymagań dotyczących sprzętu</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span
                                className="text-gray-700"><strong>Spis Sprzętu</strong> - uproszczona lista sprzętu</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Zgrany Spis Sprzętu</strong> - zorganizowana lista sprzętu</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Utylizacja</strong> - rejestr utylizowanych materiałów</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Zamówienia</strong> - rejestr zamówień</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700"><strong>Admin</strong> - zarządzanie użytkownikami i uprawnieniami</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">▶</span> Operacje między tabelami
                    </h3>

                    <p className="mb-4 text-gray-600">
                        System umożliwia wykonywanie operacji, które mogą wpływać na wiele tabel jednocześnie:
                    </p>

                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Edycja przedmiotów może być ograniczona w zależności od uprawnień użytkownika</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Zmiany są śledzone z informacją o użytkowniku, który dokonał modyfikacji</span>
                        </li>
                    </ul>
                </div>
            </div>
        ),

        starting_info: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Ważne informacje
                    </h2>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">🎨</span> Oznaczenia kolorów
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                            <span className="text-gray-700"><span className="font-semibold">Niebieskie</span> wypełnienie - przedmioty przechowywane w lodówce</span>
                        </div>
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                            <div className="w-4 h-4 bg-orange-400 rounded mr-3"></div>
                            <span className="text-gray-700"><span className="font-semibold">Pomarańczowe</span> wypełnienie - narkotyki</span>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                            <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                            <span className="text-gray-700"><span className="font-semibold">Zielone</span> wypełnienie - wyposażenie torby ratownika</span>
                        </div>
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                            <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                            <span className="text-gray-700"><span className="font-semibold text-red-500">Czerwony</span> tekst - przedmioty ze spisu podstawowego, których brak na statku</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">👥</span> Role użytkowników
                    </h3>

                    <p className="mb-4 text-gray-600">System oferuje trzy poziomy uprawnień użytkowników:</p>

                    <div className="space-y-3">
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <strong className="text-purple-700">Admin</strong>
                            <p className="text-gray-600 mt-1">pełny dostęp do wszystkich funkcji i możliwość edycji
                                wszystkich pól</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                            <strong className="text-indigo-700">Editor</strong>
                            <p className="text-gray-600 mt-1">możliwość edytowania wybranych pól</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                            <strong className="text-gray-700">Viewer</strong>
                            <p className="text-gray-600 mt-1">dostęp tylko do przeglądania danych bez możliwości
                                wprowadzania zmian</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        login: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Logowanie i zarządzanie użytkownikami
                    </h2>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">🔐</span> Logowanie do systemu
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Aby uzyskać dostęp do systemu, musisz zalogować się przy użyciu swoich danych
                        uwierzytelniających:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Na stronie logowania wybierz swoje nazwisko z listy rozwijanej</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Wprowadź hasło (jeśli zostało ustawione)</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span className="text-gray-700">Kliknij przycisk "Zaloguj"</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">⚙️</span> Panel administracyjny
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Panel administracyjny jest dostępny tylko dla użytkowników z rolą "admin" i umożliwia:
                    </p>

                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Dodawanie nowych użytkowników</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Edycję istniejących użytkowników</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Usuwanie użytkowników</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Zarządzanie rolami (admin, editor, viewer)</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-green-500 mr-2">➕</span> Dodawanie nowego użytkownika
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Aby dodać nowego użytkownika (tylko administrator):
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Przejdź do panelu administracyjnego</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Kliknij przycisk "Dodaj użytkownika"</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <div className="text-gray-700">
                                    Wypełnij formularz z informacjami o użytkowniku:
                                    <ul className="mt-2 space-y-1 ml-4">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Nazwa użytkownika</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Hasło (opcjonalne)</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Rola (admin, editor, viewer)</span>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">Kliknij "Zapisz" aby dodać użytkownika</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">✏️</span> Edycja użytkownika
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Aby edytować istniejącego użytkownika:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">W panelu administracyjnym znajdź użytkownika, którego chcesz edytować</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Kliknij przycisk "Edytuj" obok tego użytkownika</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span className="text-gray-700">Zmodyfikuj odpowiednie pola</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">Kliknij "Zapisz" aby zatwierdzić zmiany</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        ),

        equipment: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Zarządzanie sprzętem
                    </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-gray-700">
                        Moduł zarządzania sprzętem pozwala na pełną kontrolę nad inwentarzem, śledzenie statusu i stanu
                        magazynowego.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">📋</span> Główne widoki sprzętu
                    </h3>

                    <p className="mb-4 text-gray-600">
                        W systemie dostępne są trzy główne widoki dotyczące sprzętu:
                    </p>

                    <div className="space-y-3">
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <strong className="text-purple-700">Główny Spis Sprzętu</strong> (MainEquipmentList)
                            <p className="text-gray-600 mt-1">pełna lista z wszystkimi szczegółami i możliwością
                                edycji</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                            <strong className="text-indigo-700">Spis Sprzętu</strong> (EquipmentList)
                            <p className="text-gray-600 mt-1">uproszczony widok z kluczowymi informacjami</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <strong className="text-green-700">Zgrany Spis Sprzętu</strong> (OrganizedEquipment)
                            <p className="text-gray-600 mt-1">widok zorganizowany według kategorii</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-green-500 mr-2">➕</span> Dodawanie nowego sprzętu
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Aby dodać nowy sprzęt do systemu:
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <ol className="space-y-2 text-sm">
                                <li className="flex items-start">
                                    <span
                                        className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                                    <span className="text-gray-700">Kliknij przycisk "Dodaj nowy sprzęt" dostępny w głównym widoku sprzętu</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                                    <div className="text-gray-700">
                                        Wypełnij formularz z informacjami o sprzęcie:
                                        <ul className="mt-2 space-y-1 ml-4 text-xs">
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Nazwa sprzętu</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Ilość wymagana</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Ilość aktualna</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Data ważności</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Kategoria i podkategoria</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Informacja czy jest na statku</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Informacja czy jest w torbie ratownika</span>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                                    <span className="text-gray-700">Kliknij "Dodaj" aby zapisać nowy sprzęt</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-blue-500 mr-2">✏️</span> Edycja istniejącego sprzętu
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Aby edytować istniejący sprzęt:
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <ol className="space-y-2 text-sm">
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                                    <span className="text-gray-700">Znajdź sprzęt, który chcesz edytować</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                                    <span className="text-gray-700">Kliknij przycisk "Edytuj" obok tego sprzętu</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                                    <span className="text-gray-700">Zmodyfikuj odpowiednie pola (dostępność pól zależy od uprawnień użytkownika)</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                                    <span className="text-gray-700">Kliknij "Zapisz" aby zatwierdzić zmiany</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">🏷️</span> Pola specjalne
                    </h3>

                    <p className="mb-4 text-gray-600">
                        W widokach sprzętu dostępne są specjalne pola i oznaczenia:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-blue-500 mr-2">🚢</span>
                                <div>
                                    <strong className="text-gray-800">Na statku</strong>
                                    <p className="text-sm text-gray-600">informuje czy przedmiot jest obecnie na
                                        statku</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-green-500 mr-2">🎒</span>
                                <div>
                                    <strong className="text-gray-800">Torba ratownika</strong>
                                    <p className="text-sm text-gray-600">oznacza sprzęt, który jest częścią wyposażenia
                                        torby ratownika</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="text-yellow-500 mr-2">📊</span>
                                <div>
                                    <strong className="text-gray-800">Status</strong>
                                    <p className="text-sm text-gray-600">informuje o stanie przedmiotu (ważny,
                                        przeterminowany itp.)</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                                <span className="text-purple-500 mr-2">👤</span>
                                <div>
                                    <strong className="text-gray-800">Kto zmienił</strong>
                                    <p className="text-sm text-gray-600">śledzenie ostatniego użytkownika, który
                                        modyfikował wpis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-red-500 mr-2">♻️</span> Utylizacja sprzętu
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Sprzęt, który wymaga utylizacji, może być oznaczony i przeniesiony do rejestru utylizacji:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Znajdź sprzęt, który chcesz utylizować</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Kliknij przycisk "Utylizacja" obok tego sprzętu</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span
                                    className="text-gray-700">Wypełnij formularz utylizacji podając powód i ilość</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">Kliknij "Potwierdź" aby zatwierdzić utylizację</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        ),

        medicines: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Zarządzanie lekami
                    </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-gray-700">
                        Moduł zarządzania lekami pozwala na pełną kontrolę nad inwentarzem, śledzenie statusu i stanu
                        magazynowego.
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">💊</span> Główne widoki leków
                    </h3>

                    <p className="mb-4 text-gray-600">
                        W systemie dostępne są trzy główne widoki dotyczące leków:
                    </p>

                    <div className="space-y-3">
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <strong className="text-purple-700">Główny Spis Leków</strong> (MainMedicineList)
                            <p className="text-gray-600 mt-1">pełna lista z wszystkimi szczegółami i możliwością
                                edycji</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                            <strong className="text-indigo-700">Zestawienie Leków</strong> (MedicineList)
                            <p className="text-gray-600 mt-1">uproszczony widok z kluczowymi informacjami</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <strong className="text-green-700">Spis Minimum Leków</strong> (MinMedicine)
                            <p className="text-gray-600 mt-1">lista minimalnych wymagań dotyczących leków</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-green-500 mr-2">➕</span> Dodawanie nowego leku
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Aby dodać nowy lek do systemu:
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <ol className="space-y-2 text-sm">
                                <li className="flex items-start">
                                    <span
                                        className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                                    <span className="text-gray-700">Kliknij przycisk "Dodaj nowy lek" dostępny w głównym widoku leków</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                                    <div className="text-gray-700">
                                        Wypełnij formularz z informacjami o leku:
                                        <ul className="mt-2 space-y-1 ml-4 text-xs">
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Nazwa leku</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Ilość</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Opakowanie</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Data ważności</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Ilość minimalna</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Informacja o przechowywaniu (lodówka)</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Kategoria, podkategoria i podpodkategoria</span>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                                    <span className="text-gray-700">Kliknij "Dodaj" aby zapisać nowy lek</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-blue-500 mr-2">✏️</span> Edycja istniejącego leku
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Aby edytować istniejący lek:
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <ol className="space-y-2 text-sm">
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                                    <span className="text-gray-700">Znajdź lek, który chcesz edytować</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                                    <span className="text-gray-700">Kliknij przycisk "Edytuj" obok tego leku</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                                    <span className="text-gray-700">Zmodyfikuj odpowiednie pola (dostępność pól zależy od uprawnień użytkownika)</span>
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                                    <span className="text-gray-700">Kliknij "Zapisz" aby zatwierdzić zmiany</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">🏷️</span> Pola specjalne
                    </h3>

                    <p className="mb-4 text-gray-600">
                        W widokach leków dostępne są specjalne pola i oznaczenia:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-blue-500 mr-2">📉</span>
                                <div>
                                    <strong className="text-gray-800">Rozchód</strong>
                                    <p className="text-sm text-gray-600">ilość leku, która została wykorzystana</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-green-500 mr-2">🚢</span>
                                <div>
                                    <strong className="text-gray-800">Aktualnie na statku</strong>
                                    <p className="text-sm text-gray-600">aktualna ilość leku dostępna na statku
                                        automatycznie wyliczna na podstawie ilości aktualnej oraz rozchodu</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="text-yellow-500 mr-2">📊</span>
                                <div>
                                    <strong className="text-gray-800">Status</strong>
                                    <p className="text-sm text-gray-600">informuje o stanie leku (ważny, przeterminowany
                                        itp.) automatycznie tworzone na podstawie aktualnej daty oraz ilości na
                                        statku</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                                <span className="text-orange-500 mr-2">⚠️</span>
                                <div>
                                    <strong className="text-gray-800">Ważny Status</strong>
                                    <p className="text-sm text-gray-600">informuje o istotnych uwagach dotyczących
                                        leku</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-cyan-50 rounded-lg">
                                <span className="text-cyan-500 mr-2">🧊</span>
                                <div>
                                    <strong className="text-gray-800">Przechowywanie</strong>
                                    <p className="text-sm text-gray-600">informuje o specjalnych warunkach
                                        przechowywania</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                                <span className="text-purple-500 mr-2">👤</span>
                                <div>
                                    <strong className="text-gray-800">Kto zmienił</strong>
                                    <p className="text-sm text-gray-600">śledzenie ostatniego użytkownika, który
                                        modyfikował wpis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-red-500 mr-2">♻️</span> Utylizacja leków
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Leki, które wymagają utylizacji, mogą być oznaczone i przeniesione do rejestru utylizacji:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Znajdź lek, który chcesz utylizować</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Kliknij przycisk "Utylizacja" obok tego leku</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span
                                    className="text-gray-700">Wypełnij formularz utylizacji podając powód i ilość</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">Kliknij "Potwierdź" aby zatwierdzić utylizację</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        ),

        utilization: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Utylizacja
                    </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-gray-700">
                        W tej sekcji znajdziesz informacje na temat utylizacji sprzętu oraz leków.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-green-500 mr-2">➕</span> Tworzenie nowej utylizacji
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Przejdź do widoku leków lub sprzętu medycznego</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Przy wybranej pozycji kliknij ikonę ustawień (⚙️), a następnie przycisk "Utylizuj"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span className="text-gray-700">W otwartym oknie wybierz opcję "Nowa utylizacja"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">Wprowadź nazwę nowej utylizacji i kliknij "Utwórz utylizację"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">5</span>
                                <div className="text-gray-700">
                                    Uzupełnij formularz:
                                    <ul className="mt-2 space-y-1 ml-4">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Ilość nominalna - ile jednostek ma zostać zutylizowanych</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Opakowanie (tylko dla leków)</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Data ważności</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Powód utylizacji - obowiązkowe pole</span>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">6</span>
                                <span className="text-gray-700">Kliknij przycisk "Utylizuj" aby dodać pozycję do nowo utworzonej utylizacji</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">📋</span> Dodawanie do istniejącej utylizacji
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Przejdź do widoku leków lub sprzętu medycznego</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Przy wybranej pozycji kliknij ikonę ustawień (⚙️), a następnie przycisk "Utylizuj"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span className="text-gray-700">W otwartym oknie wybierz opcję "Wybierz istniejącą utylizację"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">Z rozwijanej listy wybierz utylizację, do której chcesz dodać pozycję</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">5</span>
                                <span className="text-gray-700">Uzupełnij formularz i kliknij "Utylizuj"</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-purple-500 mr-2">⚙️</span> Zarządzanie utylizacją
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Przejdź do zakładki "Utylizacje" w menu głównym</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Na liście zobaczysz wszystkie utworzone utylizacje z ich statusami</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span className="text-gray-700">Kliknij na wybraną utylizację, aby zobaczyć jej szczegóły</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <div className="text-gray-700">
                                    W szczegółach utylizacji możesz:
                                    <ul className="mt-2 space-y-1 ml-4">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Przeglądać dodane leki i sprzęt</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Edytować powody utylizacji</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Usuwać pozycje z utylizacji</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                            <span>Zmienić status utylizacji</span>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-orange-500 mr-2">📊</span> Statusy utylizacji
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <strong className="text-green-700">Nowa</strong>
                                <p className="text-sm text-gray-600 mt-1">utylizacja została utworzona, można dodawać do niej pozycje</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <strong className="text-blue-700">W trakcie</strong>
                                <p className="text-sm text-gray-600 mt-1">utylizacja jest w trakcie realizacji</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <strong className="text-purple-700">Zakończone</strong>
                                <p className="text-sm text-gray-600 mt-1">utylizacja została zakończona, nie można dodawać nowych pozycji</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <strong className="text-red-700">Anulowane</strong>
                                <p className="text-sm text-gray-600 mt-1">utylizacja została anulowana</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),

        orders: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Zarządzanie Zamówieniami
                    </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-gray-700">
                        Moduł zarządzania zamówieniami pozwala na śledzenie statusu zamówień leków i sprzętu.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">👀</span> Widok Zamówień
                    </h3>

                    <p className="mb-4 text-gray-600">
                        W widoku zamówień znajdziesz listę wszystkich zamówień wraz z ich aktualnym statusem.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <strong className="text-blue-700">Nazwa</strong>
                            <p className="text-gray-600 mt-1">nazwa zamówienia</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <strong className="text-green-700">Data utworzenia</strong>
                            <p className="text-gray-600 mt-1">data złożenia zamówienia</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                            <strong className="text-yellow-700">Status</strong>
                            <p className="text-gray-600 mt-1">aktualny status zamówienia (np. Zamówione, Przyjęte,
                                Zakończone, Anulowane)</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <strong className="text-purple-700">Ilość pozycji</strong>
                            <p className="text-gray-600 mt-1">liczba różnych przedmiotów w zamówieniu</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-orange-500 mr-2">⚙️</span> Sposób obsługi (działania) danych przez
                        zamówienia
                    </h3>

                    <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">🔄</span> Proces obsługi zamówień
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Poniżej przedstawiony jest prawidłowy proces obsługi zamówień w systemie, który zapewnia
                        poprawną aktualizację danych w arkuszach.
                    </p>

                    <p className="mb-4 text-gray-600">
                        Aby zapewnić poprawne działanie modułu zamówień, należy przestrzegać następującej kolejności
                        statusów:
                    </p>

                    <div className="space-y-3">
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <strong className="text-green-700">Nowe</strong>
                            <p className="text-gray-600 mt-1">status początkowy nadawany automatycznie po utworzeniu
                                zamówienia</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <strong className="text-blue-700">W trakcie / Zamówione</strong>
                            <p className="text-gray-600 mt-1">statusy używane do oznaczenia zamówień złożonych lub
                                będących w realizacji</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                            <strong className="text-indigo-700">Nowe / W trakcie / Zamówione</strong>
                            <p className="text-gray-600 mt-1">każdy z tych statusów powoduje aktualizację
                                pola <em>Status</em> (w arkuszu Leki) lub <em>Ilość/Termin</em> (w arkuszu Sprzęt) na
                                "<em>W zamówieniu: [nazwa-zamówienia]</em>"</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                            <strong className="text-yellow-700">Przyjęte</strong>
                            <p className="text-gray-600 mt-1">status używany po fizycznym otrzymaniu zamówienia; na tym
                                etapie należy wprowadzić daty ważności dla każdego otrzymanego produktu, co umożliwi
                                systemowi prawidłową aktualizację danych w głównych arkuszach</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <strong className="text-purple-700">Zakończone</strong>
                            <p className="text-gray-600 mt-1">status nadawany po zmagazynowaniu wszystkich produktów;
                                zmiana na ten status spowoduje aktualizację pól <em>Status</em> (w arkuszu Leki)
                                lub <em>Ilość/Termin</em> (w arkuszu Sprzęt) do wartości odpowiadających rzeczywistemu
                                stanowi</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">🔍</span> Szczegóły Zamówienia
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Aby zobaczyć szczegóły konkretnego zamówienia:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Znajdź zamówienie na liście.</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span
                                    className="text-gray-700">Kliknij przycisk "Szczegóły" obok wybranego zamówienia.</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span className="text-gray-700">Otworzy się okno z listą leków i sprzętu wchodzących w skład zamówienia.</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">📊</span> Statusy Zamówień
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Zamówienia mogą mieć następujące statusy:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <strong className="text-green-700">Nowe</strong>
                                <p className="text-sm text-gray-600 mt-1">zamówienie zostało utworzone, ale nie zostało
                                    jeszcze przetworzone.</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <strong className="text-blue-700">Zamówione</strong>
                                <p className="text-sm text-gray-600 mt-1">zamówienie zostało złożone u dostawcy.</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <strong className="text-indigo-700">W trakcie</strong>
                                <p className="text-sm text-gray-600 mt-1">zamówienie jest w trakcie realizacji.</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <strong className="text-yellow-700">Przyjęte</strong>
                                <p className="text-sm text-gray-600 mt-1">zamówienie zostało dostarczone i przyjęte.</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <strong className="text-purple-700">Zakończone</strong>
                                <p className="text-sm text-gray-600 mt-1">zamówienie zostało w pełni zrealizowane.</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <strong className="text-red-700">Anulowane</strong>
                                <p className="text-sm text-gray-600 mt-1">zamówienie zostało anulowane.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),

        database: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Import/Export Bazy danych
                    </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-gray-700">
                        System umożliwia import i eksport bazy danych, co pozwala na tworzenie kopii zapasowych oraz
                        przenoszenie danych między instalacjami.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-green-500 mr-2">📤</span> Eksport bazy danych
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Aby wykonać eksport bazy danych:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Kliknij przycisk "Eksportuj bazę danych" dostępny w widokach utylizacji lub innych (dla użytkowników z odpowiednimi uprawnieniami)</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span
                                    className="text-gray-700">System wygeneruje plik .db zawierający kopię bazy danych</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span
                                    className="text-gray-700">Plik zostanie automatycznie pobrany przez przeglądarkę</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">Nazwa pliku zawiera datę eksportu dla łatwiejszej identyfikacji</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-blue-500 mr-2">📥</span> Import bazy danych
                    </h3>

                    <p className="mb-4 text-gray-600">
                        Aby zaimportować bazę danych (wymaga uprawnień administratora):
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                                <span className="text-gray-700">Kliknij przycisk "Importuj bazę danych"</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                                <span className="text-gray-700">Wybierz plik .db lub .sqlite zawierający bazę danych do importu</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                                <span className="text-gray-700">Potwierdź operację importu</span>
                            </li>
                            <li className="flex items-start">
                                <span
                                    className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                                <span className="text-gray-700">System zaimportuje dane i przeładuje stronę po zakończeniu</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="text-amber-500 mr-2">⚠️</span> Uwagi dotyczące importu i eksportu
                    </h3>

                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Import bazy danych zastępuje wszystkie istniejące dane - przed importem upewnij się, że wykonano kopię zapasową</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Dostęp do funkcji importu i eksportu jest ograniczony tylko do użytkowników z odpowiednimi uprawnieniami</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Zaleca się regularne wykonywanie kopii zapasowych poprzez eksport bazy danych</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">•</span>
                            <span className="text-gray-700">Eksportowany plik bazy danych zawiera kompletny stan systemu, w tym informacje o użytkownikach</span>
                        </li>
                    </ul>
                </div>
            </div>
        ),

        pages: (
            <div className="p-6 animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                        Arkusze
                    </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-gray-700">
                        W tej sekcji znajdziesz informacje na temat arkuszy dostępnych w systemie.
                    </p>
                </div>

                <div className="grid gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-blue-500 mr-2">💊</span> Główny Spis Leków
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Główny Spis Leków" zawiera listę leków wraz ze stanem magazynowym oraz rozchodem.
                        </p>

                        <a
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md"
                            href={"main/leki"}
                        >
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-green-500 mr-2">📋</span> Zestawienie Leków
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Zestawienie Leków" zawiera minimalistyczą listę z ilością produktów
                            (aktualna/minimalna),
                            datę ważności oraz status.
                        </p>

                        <a
                            href={"/zestawienie-lekow"}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-purple-500 mr-2">📝</span> Spis Minimum Leków
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Spis Minimum Leków" zawiera listę z informacjami odnośnie rodzaju opakowania danych
                            leków.
                        </p>

                        <a
                            href={"/minimum-lekow"}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-indigo-500 mr-2">🏥</span> Spis Minimum Sprzętu
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Spis Minimum Sprzętu" zawiera listę z informacjami o sprzęcie medycznym wraz z
                            dodatkowymi
                            informacjami.
                        </p>

                        <a
                            href={"/main/sprzet"}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-cyan-500 mr-2">🔧</span> Spis Sprzętu
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Spis Sprzętu" zawiera minimalistyczną listę z informacjami: nazwa, data ważności,
                            ilość na
                            statku.
                        </p>

                        <a
                            href={"/zestawienie-sprzetu"}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-teal-500 mr-2">📊</span> Zgrany Spis Sprzętu
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Zgrany Spis Sprzętu" zawiera zgrany spis sprzętu.
                        </p>

                        <a
                            href={"/zgrany-sprzet"}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-red-500 mr-2">♻️</span> Utylizacja
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Utylizacja" zawiera pozycje do utylizacji z podziałem na grupy.
                        </p>

                        <a
                            href={"/utylizacja"}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-orange-500 mr-2">📦</span> Lista Zamówień
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Lista Zamówień" zawiera listę wszystkich zamówień wraz z ich aktualnym statusem.
                        </p>

                        <a
                            href={"/zamowienia"}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="text-gray-500 mr-2">👤</span> Panel Administracyjny
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Arkusz "Admin" umożliwia zarządzanie użytkownikami i ich uprawnieniami.
                        </p>

                        <a
                            href={"/admin"}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow-md">
                            Kliknij by przejść do arkusza
                        </a>
                    </div>
                </div>
            </div>
        ),
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {/* Sidebar navigation */}
            <div className="w-full md:w-1/4 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen p-4 shadow-lg">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">📚 Dokumentacja</h2>
                    <div className="h-1 bg-blue-500 rounded"></div>
                </div>
                <nav>
                    <ul className="space-y-2">
                        {sections.map(section => (
                            <li key={section.id}>
                                <button
                                    className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-all duration-200 flex items-center ${
                                        activeSection === section.id
                                            ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                            : 'hover:bg-gray-200 hover:shadow-sm text-gray-700'
                                    }`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <span className="mr-3 text-lg">{section.icon}</span>
                                    <span className="flex-1">{section.title}</span>
                                    {activeSection === section.id && (
                                        <span className="text-white">▶</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Content area */}
            <div className="w-full md:w-3/4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    {documentationContent[activeSection]}
                </div>
            </div>
        </div>
    );
};

// Add CSS for fade-in animation
const styles = `
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default Documentation;

