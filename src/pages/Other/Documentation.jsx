import React, { useState } from 'react';

const Documentation = () => {
    // State to keep track of the active section
    const [activeSection, setActiveSection] = useState('introduction');

    // Documentation sections
    const sections = [
        { id: 'introduction', title: 'Wprowadzenie' },
        { id: 'equipment', title: 'Zarządzanie sprzętem' },
        { id: 'medicines', title: 'Zarządzanie lekami' },
        { id: 'utilization', title: 'Utylizacja' },
        { id: 'pages', title: 'Arkusze' },
    ];

    // Documentation content for each section
    const documentationContent = {
        introduction: (
            <div>
                <h2 className="text-2xl font-bold mb-4">Witamy w dokumentacji Nawigatora</h2>
                <p className="mb-4">
                    Aplikacja Nawigator została zaprojektowana, aby pomóc w zarządzaniu sprzętem oraz lekami.
                    Ta dokumentacja pomoże Ci zrozumieć, jak korzystać z różnych funkcji aplikacji.
                </p>
                <p className="mb-4">
                    Wybierz sekcję z menu po lewej stronie, aby przejść do odpowiedniej części dokumentacji.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <h3 className="text-lg font-semibold mb-2">Szybki start</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Zaloguj się do systemu używając swojego identyfikatora, używamy jest on w celu śledzenia przez kogo zostają dokonane zmiany.
                        Gdy zmiana dokonywana jest automatycznie autorem będzie "SYSTEM".
                        </li>
                        <li>Z głównego panelu wybierz moduł, z którego chcesz korzystać</li>
                        <li>Zapoznaj się z odpowiednią sekcją dokumentacji, aby uzyskać szczegółowe informacje</li>
                    </ol>
                </div>
            </div>
        ),
        equipment: (
            <div>
                <h2 className="text-2xl font-bold mb-4">Zarządzanie sprzętem</h2>
                <p className="mb-4">
                    Moduł zarządzania sprzętem pozwala na pełną kontrolę nad inwentarzem, śledzenie statusu i stanu magazynowego.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Dodawanie nowego sprzętu</h3>
                <p className="mb-3">
                    Aby dodać nowy sprzęt do systemu:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-1">
                    <li>Przejdź do dowlonej zakładki odpowiedzialnej za sprzęt</li>
                    <li>Kliknij przycisk "Dodaj nowy sprzęt"</li>
                    <li>Wypełnij formularz z danymi sprzętu (nazwa, kategoria, ilość, status)</li>
                    <li>Kliknij "Zapisz" aby dodać sprzęt do systemu</li>
                    <li>Czasem zmiany mogą dokonać się z lekkim opóźnieniem lub będą wymagać odświeżenia strony.</li>
                </ol>

                <h3 className="text-xl font-semibold mt-6 mb-3">Edycja sprzętu</h3>
                <p className="mb-3">
                    Aby edytować istniejący sprzęt:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-1">
                    <li>Znajdź sprzęt na liście</li>
                    <li>Kliknij przycisk "Edytuj" w kolumnie akcji</li>
                    <li>Zaktualizuj odpowiednie pola</li>
                    <li>Kliknij "Zapisz" aby zatwierdzić zmiany</li>
                    <li>Czasem zmiany mogą dokonać się z lekkim opóźnieniem lub będą wymagać odświeżenia strony.</li>
                </ol>
            </div>
        ),
        medicines:(
            <div>
                <h2 className="text-2xl font-bold mb-4">Zarządzanie lekami</h2>
                <p className="mb-4">
                    Moduł zarządzania lekami pozwala na pełną kontrolę nad inwentarzem, śledzenie statusu i stanu magazynowego.
                </p>
                <h3 className="text-xl font-semibold mt-6 mb-3">Dodawanie nowego Leku</h3>
                <p className="mb-3">
                    Aby dodać nowy lek do systemu:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-1">
                    <li>Przejdź do zakładki wybranej zakładki odpowiedzialnej za leki</li>
                    <li>Kliknij przycisk "Dodaj nowy sprzęt"</li>
                    <li>Wypełnij formularz z danymi sprzętu (nazwa, kategoria, ilość, status)</li>
                    <li>Kliknij "Zapisz" aby dodać lek do systemu</li>
                    <li>Czasem zmiany mogą dokonać się z lekkim opóźnieniem lub będą wymagać odświeżenia strony.</li>
                    <li>W zależności od arkusza dana ilość informacji odnośnie leku zostanie dodana.</li>
                </ol>

                <h3 className="text-xl font-semibold mt-6 mb-3">Edycja leku</h3>
                <p className="mb-3">
                    Aby edytować istniejący lek:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-1">
                    <li>Znajdź lek na liście</li>
                    <li>Kliknij przycisk "Edytuj" w kolumnie akcji</li>
                    <li>Zaktualizuj odpowiednie pola</li>
                    <li>Kliknij "Zapisz" aby zatwierdzić zmiany</li>
                    <li>Czasem zmiany mogą dokonać się z lekkim opóźnieniem lub będą wymagać odświeżenia strony.</li>
                </ol>
            </div>

        ),
        utilization:(
            <div>
                <h2 className="text-2xl font-bold mb-4">Utylizacja</h2>
                <p className="mb-4">
                    W tej sekcji znajdziesz informacje na temat utylizacji sprzętu oraz leków.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Utylizacja sprzętu</h3>
                <p className="mb-3">
                    Aby utylizować sprzęt:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-1">
                    <li>Przejdź do zakładki "Sprzęt"</li>
                    <li>Znajdź sprzęt, który chcesz utylizować</li>
                    <li>Kliknij przycisk "Utylizuj" w kolumnie akcji</li>
                    <li>Podaj powód utylizacji</li>
                    <li>Kliknij "Zatwierdź" aby utylizować sprzęt</li>
                </ol>

                <h3 className="text-xl font-semibold mt-6 mb-3">Utylizacja leków</h3>
                <p className="mb-3">
                    Aby utylizować leki:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-1">
                    <li>Przejdź do zakładki "Leki"</li>
                    <li>Znajdź lek, który chcesz utylizować</li>
                    <li>Kliknij przycisk "Utylizuj" w kolumnie akcji</li>
                    <li>Podaj powód utylizacji</li>
                    <li>Kliknij "Zatwierdź" aby utylizować lek</li>
                </ol>
            </div>
        ),
        pages: (
            <div>
                <h2 className="text-2xl font-bold mb-4">Arkusze</h2>
                <p className="mb-4">
                    W tej sekcji znajdziesz informacje na temat arkuszy dostępnych w systemie.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Główny Spis Leków</h3>
                <p className="mb-3">
                    Arkusz "Główny Spis Leków" zawiera listę leków wraz ze stanem magazynowym oraz rozchodem.
                </p>
                <p className="mb-3">Niebieskie wypełnienie oznacza - przechowywany w lodówce</p>
                <a href="/main/leki" key="leki" className="text-blue-600 font-bold">Kliknij by przejść do arkusza</a>

                <h3 className="text-xl font-semibold mt-6 mb-3">Zestawienie Leków</h3>
                <p className="mb-3">
                    Arkusz "Zestawienie Leków" zawiera minimalistyczą listę z ilością produktów (aktualna/minimalna), datę ważności oraz status.
                </p>
                <p className="mb-3">Niebieskie wypełnienie oznacza - przechowywany w lodówce</p>
                <a href="/zestawienie-lekow" key="zestawienie-lekow" className="text-blue-600 font-bold">Kliknij by przejść do arkusza</a>

                <h3 className="text-xl font-semibold mt-6 mb-3">Spis Minimum Leków</h3>
                <p className="mb-3">
                    Arkusz "Spis Minimum Leków" zawiera listę z informacjami odnośnie rodzaju opakowania danych leków.
                </p>
                <a href="/minimum-lekow" key="minimum-lekow" className="text-blue-600 font-bold">Kliknij by przejść do arkusza</a>

                <h3 className="text-xl font-semibold mt-6 mb-3">Spis Minimum Sprzętu</h3>
                <p className="mb-3">
                    Arkusz "Spis Minimum Sprzętu" zawiera listę z informacjami o sprzęcie medycznym wraz z dodatkowymi informacjami.
                </p>
                <p>Zielone wypełnienie oznacza - wyposażenie torby ratownika</p>
                <p>Czerwona kropka oznacza - sprzęt ze spisu podstawowego brak na satku</p>
                <a href="/main/sprzet" key="main-sprzet" className="text-blue-600 font-bold">Kliknij by przejść do arkusza</a>


                <h3 className="text-xl font-semibold mt-6 mb-3">Spis Sprzętu</h3>
                <p className="mb-3">
                    Arkusz "Spis Sprzętu" zawiera minimalistyczną listę z informacjami: nazwa, dataważności, ilość na statku.
                </p>
                <a href="/zestawienie-sprzetu" key="zestawienie-sprzetu" className="text-blue-600 font-bold">Kliknij by przejść do arkusza</a>
            </div>
        )

    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <h1 className="text-3xl font-bold mb-6 border-b pb-2">Dokumentacja systemu</h1>

            <div className="flex flex-col md:flex-row">
                {/* Sidebar navigation */}
                <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-6">
                    <div className="sticky top-4 bg-white rounded-lg shadow p-4">
                        <h2 className="font-bold text-xl mb-4 border-b pb-2">Spis treści</h2>
                        <nav>
                            <ul className="space-y-2">
                                {sections.map(section => (
                                    <li key={section.id}>
                                        <button
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left px-3 py-2 rounded transition ${
                                                activeSection === section.id
                                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            {section.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full md:w-3/4">
                    <div className="bg-white rounded-lg shadow p-6">
                        {documentationContent[activeSection]}
                    </div>
                </div>
            </div>

            <footer className="mt-8 pt-4 border-t text-center text-gray-500">
                <p>© {new Date().getFullYear()} Dokumentacja Nawigatora. Wszelkie prawa zastrzeżone.</p>
                <p>Product developer Kamil Łacny</p>
            </footer>
        </div>
    );
};

export default Documentation;