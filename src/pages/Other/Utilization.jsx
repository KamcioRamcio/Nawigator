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
        grupa: '',
        kto_zmienil: username
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
                grupa: '',
                kto_zmienil: ''
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
            link.download = `database_export_${currentDate.toISOString().slice(0, 10)}.db`;
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
        <div className="bg-gray-100 min-h-screen py-10">
            <div>
                <div>
                    <h1 className="text-2xl text-center font-bold flex-grow">Zestawienie Utylizacji MV NAWIGATOR
                        XXI</h1>
                    <button className="absolute left-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleSiteChangeOpen}
                    > Zmiana Arkusza
                    </button>
                    <button className="absolute right-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleAddUtilizationOpen}
                    >Dodaj Pozycję
                    </button>
                    <div className="flex justify-center gap-4 mt-16">
                        <button
                            onClick={handleExportDatabase}
                            className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 flex items-center"
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
                                style={{display: 'none'}}
                            />
                            <button
                                onClick={handleImportClick}
                                className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 flex items-center"
                            >
                                <span>Importuj bazę</span>
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                            </button>
                        </>
                    </div>
                    <h2 className="text-center text-xl text-red-800 font-bold pt-4 ">
                        Data: {currentDate.toLocaleDateString('pl-PL')}
                    </h2>
                    <h3 className="text-center font-semibold p-4 text-lg">
                        Zalogowany jako {username}
                    </h3>
                    <table className="w-full">
                        <thead className="text-left">
                        <tr>
                            <th className="px-2 py-4">Nazwa</th>
                            <th className="px-2 py-4">Ilość</th>
                            <th className="px-2 py-4">Data ważności</th>
                            <th className="px-2 py-4">Ilość nominalna</th>
                            <th className="px-2 py-4">Grupa</th>
                            <th className="px-2 py-4">Kto Zmienił</th>
                            <th className="px-2 py-4">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="text-left">
                        {utilizations.map(utilization => (
                            <tr key={utilization.id} className="border border-gray-700 hover:bg-gray-50">
                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                    {editMode[utilization.id] ? (
                                        <input
                                            type="text"
                                            value={editedValues[utilization.id]?.nazwa || ""}
                                            onChange={(e) => handleEdit(utilization.id, "nazwa", e.target.value)}
                                            className="w-full"
                                        />
                                    ) : (
                                        utilization.nazwa
                                    )}
                                </td>
                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                    {editMode[utilization.id] ? (
                                        <input
                                            type="number"
                                            value={editedValues[utilization.id]?.ilosc || ""}
                                            onChange={(e) => handleEdit(utilization.id, "ilosc", e.target.value)}
                                            className="w-full"
                                        />
                                    ) : (
                                        utilization.ilosc
                                    )}
                                </td>
                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                    {editMode[utilization.id] ? (
                                        <input
                                            type="date"
                                            value={editedValues[utilization.id]?.data_waznosci || ""}
                                            onChange={(e) => handleEdit(utilization.id, "data_waznosci", e.target.value)}
                                            className="w-full"
                                        />
                                    ) : (
                                        utilization.data_waznosci
                                    )}
                                </td>
                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                    {editMode[utilization.id] ? (
                                        <input
                                            type="number"
                                            value={editedValues[utilization.id]?.ilosc_nominalna || ""}
                                            onChange={(e) => handleEdit(utilization.id, "ilosc_nominalna", e.target.value)}
                                            className="w-full"
                                        />
                                    ) : (
                                        utilization.ilosc_nominalna
                                    )}
                                </td>
                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                    {editMode[utilization.id] ? (
                                        <input
                                            type="text"
                                            value={editedValues[utilization.id]?.grupa || ""}
                                            onChange={(e) => handleEdit(utilization.id, "grupa", e.target.value)}
                                            className="w-full"
                                        />
                                    ) : (
                                        utilization.grupa
                                    )}
                                </td>
                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                    {utilization.kto_zmienil}</td>
                                <td>
                                    {editMode[utilization.id] ? (
                                        <>
                                            <button
                                                onClick={() => handleSave(utilization.id)}
                                                className="text-green-500 font-semibold mr-2"
                                            >
                                                Zapisz
                                            </button>
                                            <button
                                                onClick={() => setEditMode(prev => ({
                                                    ...prev,
                                                    [utilization.id]: false
                                                }))}
                                                className="text-red-500 font-semibold"
                                            >
                                                Anuluj
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUtilization(utilization.id)}
                                                className="text-red-400 font-semibold mr-2 ml-2"
                                            >
                                                Usuń
                                            </button>
                                        </>
                                    ) : (
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
                                            className="text-blue-500 font-semibold"
                                        >
                                            Edytuj
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UtilizationAdd isOpen={utilizationAdd} onClose={handleAddUtilizationClose}>
                <h2>ADD UTILIZATION</h2>
                <table>
                    <thead>
                    <tr>
                        <th className="px-12 py-4">Nazwa</th>
                        <th className="px-12 py-4">Ilość</th>
                        <th className="px-12 py-4">Data ważności</th>
                        <th className="px-12 py-4">Ilość nominalna</th>
                        <th className="px-12 py-4">Grupa</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>
                            <input
                                type="text"
                                name="nazwa"
                                value={newUtilization.nazwa}
                                onChange={handleInputUtilization}
                                placeholder="Nazwa"
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                name="ilosc"
                                value={newUtilization.ilosc}
                                onChange={handleInputUtilization}
                                placeholder="Ilość"
                            />
                        </td>
                        <td>
                            <input
                                type="date"
                                name="data_waznosci"
                                value={newUtilization.data_waznosci}
                                onChange={handleInputUtilization}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                name="ilosc_nominalna"
                                value={newUtilization.ilosc_nominalna}
                                onChange={handleInputUtilization}
                                placeholder="Ilość nominalna"
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="grupa"
                                value={newUtilization.grupa}
                                onChange={handleInputUtilization}
                                placeholder="Grupa"
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <button className="p-4 bg-slate-700 rounded-3xl" onClick={() => {
                    handleAddUtilization();
                    handleAddUtilizationClose();
                }}>
                    Dodaj
                </button>
            </UtilizationAdd>
            <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
        </div>
    );
}

export default MainMedicineList;