import React, { useState, useEffect , useRef } from 'react';
import apiUrl from "../../constants/api.js";
import SiteChange from "../../components/SiteChange.jsx";
import UtilizationAdd from "../../components/UtilizationAdd.jsx";

function MainMedicineList() {
    const [utilizations, setUtilizations] = useState([]);
    const [utilizationAdd, setUtilizationAdd] = useState(false);
    const [siteChange, setSiteChange] = useState(false);
    const [editMode, setEditMode] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const [currentDate] = useState(new Date());
    const username = localStorage.getItem("username");

    const [newUtilization, setNewUtilization] = useState({
        nazwa: '',
        ilosc: '',
        data_waznosci: '',
        ilosc_nominalna: '',
        grupa: ''
    });

    useEffect(() => {
        fetchUtilizations();
    }, []);

    const fetchUtilizations = async () => {
        try {
            const response = await fetch(apiUrl + 'utylizacja');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setUtilizations(data);
        } catch (error) {
            console.error('Error fetching utilizations:', error);
        }
    };

    const handleAddUtilizationOpen = () => setUtilizationAdd(true);
    const handleAddUtilizationClose = () => setUtilizationAdd(false);
    const handleSiteChangeOpen = () => setSiteChange(true);
    const handleSiteChangeClose = () => setSiteChange(false);

    const handleInputUtilization = (e) => {
        setNewUtilization(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleAddUtilization = async () => {
        try {
            const response = await fetch(apiUrl + 'utylizacja', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newUtilization,
                    kto_zmienil: username
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            fetchUtilizations();
            handleAddUtilizationClose();
            setNewUtilization({
                nazwa: '',
                ilosc: '',
                data_waznosci: '',
                ilosc_nominalna: '',
                grupa: ''
            });
        } catch (error) {
            console.error('Error adding utilization:', error);
        }
    };

    const handleEdit = (id, field, value) => {
        setEditedValues(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleSave = async (id) => {
        try {
            const response = await fetch(apiUrl + `utylizacja/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editedValues[id],
                    kto_zmienil: username
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            fetchUtilizations();
            setEditMode(prev => ({
                ...prev,
                [id]: false
            }));
        } catch (error) {
            console.error('Error updating utilization:', error);
        }
    };

    const handleDeleteUtilization = async (id) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę pozycję?')) return;

        try {
            const response = await fetch(apiUrl + `utylizacja/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Network response was not ok');

            fetchUtilizations();
        } catch (error) {
            console.error('Error deleting utilization:', error);
        }
    };

    const handleExportDatabase = async () => {
        try {
            const response = await fetch(apiUrl + 'export-database');

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `database_export_${currentDate.toISOString().slice(0,10)}.db`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error exporting database:', error);
            alert('Wystąpił błąd podczas eksportu bazy danych');
        }
    };

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleDatabaseImport = async (e) => {
    try {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite')) {
            alert('Proszę wybrać prawidłowy plik bazy danych (rozszerzenie .db lub .sqlite)');
            return;
        }

        const formData = new FormData();
        formData.append('database', file);

        const response = await fetch(apiUrl + 'import-database', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Network response was not ok');
    } catch (error) {
        console.error('Error importing database:', error);
    }
}

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Nagłówek */}
            <header className="bg-white shadow-md py-4 fixed top-0 w-full z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col space-y-4">
                        {/* Tytuł */}
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 text-center">
                            Zestawienie Utylizacji MV Nawigator XXI
                        </h1>

                        {/* Przyciski */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                            <button
                                onClick={handleSiteChangeOpen}
                                className="w-full sm:w-auto rounded-full bg-slate-900 hover:bg-slate-700 text-white font-bold px-4 py-2 text-sm md:text-base transition-colors duration-200"
                            >
                                Zmiana Arkusza
                            </button>

                            <button
                                onClick={handleAddUtilizationOpen}
                                className="w-full sm:w-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm md:text-base transition-colors duration-200"
                            >
                                Dodaj Pozycję
                            </button>

                            <button
                                onClick={handleExportDatabase}
                                className="w-full sm:w-auto rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 text-sm md:text-base flex items-center justify-center transition-colors duration-200"
                            >
                                <span>Eksportuj bazę</span>
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                            </button>
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleDatabaseImport}
                                    accept=".db,.sqlite"
                                    style={{ display: 'none' }}
                                />
                                <button
                                    onClick={handleImportClick}
                                    className="w-full sm:w-auto rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 text-sm md:text-base flex items-center justify-center transition-colors duration-200"
                                >
                                    <span>Importuj bazę</span>
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                    </svg>
                                </button>
                            </>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm">
                            <p className="text-red-600 font-semibold">
                                Data: {currentDate.toLocaleDateString('pl-PL')}
                            </p>
                            <span className="hidden sm:block">•</span>
                            <p className="text-gray-600">
                                Zalogowany jako: <span className="font-medium">{username}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Główna zawartość */}
            <div className="mt-48 sm:mt-40 px-4">
                <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Tabela */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-left">
                                <tr className="bg-gray-200 text-gray-700 uppercase text-xs md:text-sm tracking-wide">
                                    <th className="px-2 py-3">Nazwa</th>
                                    <th className="px-2 py-3">Ilość</th>
                                    <th className="px-2 py-3">Data ważności</th>
                                    <th className="px-2 py-3">Ilość nominalna</th>
                                    <th className="px-2 py-3">Grupa</th>
                                    <th className="px-2 py-3">Kto Zmienił</th>
                                    <th className="px-2 py-3">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilizations.map(utilization => (
                                    <tr key={utilization.id} className="border-b hover:bg-gray-50">
                                        <td className="px-2 py-3">
                                            {editMode[utilization.id] ? (
                                                <input
                                                    type="text"
                                                    value={editedValues[utilization.id]?.nazwa || ""}
                                                    onChange={(e) => handleEdit(utilization.id, "nazwa", e.target.value)}
                                                    className="w-full border rounded px-2 py-1"
                                                />
                                            ) : (
                                                utilization.nazwa
                                            )}
                                        </td>
                                        <td className="px-2 py-3">
                                            {editMode[utilization.id] ? (
                                                <input
                                                    type="number"
                                                    value={editedValues[utilization.id]?.ilosc || ""}
                                                    onChange={(e) => handleEdit(utilization.id, "ilosc", e.target.value)}
                                                    className="w-full border rounded px-2 py-1"
                                                />
                                            ) : (
                                                utilization.ilosc
                                            )}
                                        </td>
                                        <td className="px-2 py-3">
                                            {editMode[utilization.id] ? (
                                                <input
                                                    type="date"
                                                    value={editedValues[utilization.id]?.data_waznosci || ""}
                                                    onChange={(e) => handleEdit(utilization.id, "data_waznosci", e.target.value)}
                                                    className="w-full border rounded px-2 py-1"
                                                />
                                            ) : (
                                                utilization.data_waznosci
                                            )}
                                        </td>
                                        <td className="px-2 py-3">
                                            {editMode[utilization.id] ? (
                                                <input
                                                    type="number"
                                                    value={editedValues[utilization.id]?.ilosc_nominalna || ""}
                                                    onChange={(e) => handleEdit(utilization.id, "ilosc_nominalna", e.target.value)}
                                                    className="w-full border rounded px-2 py-1"
                                                />
                                            ) : (
                                                utilization.ilosc_nominalna
                                            )}
                                        </td>
                                        <td className="px-2 py-3">
                                            {editMode[utilization.id] ? (
                                                <input
                                                    type="text"
                                                    value={editedValues[utilization.id]?.grupa || ""}
                                                    onChange={(e) => handleEdit(utilization.id, "grupa", e.target.value)}
                                                    className="w-full border rounded px-2 py-1"
                                                />
                                            ) : (
                                                utilization.grupa
                                            )}
                                        </td>
                                        <td className="px-2 py-3">{utilization.kto_zmienil}</td>
                                        <td className="px-2 py-3">
                                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                                {editMode[utilization.id] ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSave(utilization.id)}
                                                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                        >
                                                            Zapisz
                                                        </button>
                                                        <button
                                                            onClick={() => setEditMode(prev => ({
                                                                ...prev,
                                                                [utilization.id]: false
                                                            }))}
                                                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                        >
                                                            Anuluj
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditMode(prev => ({
                                                                    ...prev,
                                                                    [utilization.id]: true
                                                                }));
                                                                setEditedValues(prev => ({
                                                                    ...prev,
                                                                    [utilization.id]: utilization
                                                                }));
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                        >
                                                            Edytuj
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUtilization(utilization.id)}
                                                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                        >
                                                            Usuń
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modale */}
            <UtilizationAdd isOpen={utilizationAdd} onClose={handleAddUtilizationClose}>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Dodaj nową pozycję</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="nazwa"
                            value={newUtilization.nazwa}
                            onChange={handleInputUtilization}
                            placeholder="Nazwa"
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="number"
                            name="ilosc"
                            value={newUtilization.ilosc}
                            onChange={handleInputUtilization}
                            placeholder="Ilość"
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="date"
                            name="data_waznosci"
                            value={newUtilization.data_waznosci}
                            onChange={handleInputUtilization}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="number"
                            name="ilosc_nominalna"
                            value={newUtilization.ilosc_nominalna}
                            onChange={handleInputUtilization}
                            placeholder="Ilość nominalna"
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="grupa"
                            value={newUtilization.grupa}
                            onChange={handleInputUtilization}
                            placeholder="Grupa"
                            className="w-full p-2 border rounded"
                        />
                        <button
                            onClick={handleAddUtilization}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                            Dodaj
                        </button>
                    </div>
                </div>
            </UtilizationAdd>
            <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose} />
        </div>
    );
}

export default MainMedicineList;