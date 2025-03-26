import React, { useState, useEffect, useRef } from 'react';
import apiUrl from "../../constants/api.js";
import SiteChange from "../../components/SiteChange.jsx";
import UtilizationAdd from "../../components/UtilizationAdd.jsx";
import constantsMedicine from "../../constants/constantsMedicine.js";

function Utilization() {
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
        powod_utylizacji: '',
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
                powod_utylizacji: '',
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
        if (!confirm("Czy na pewno chcesz usunąć tę pozycję? Ta operacja jest nieodwracalna.")) {
            return;
        }

        try {
            const response = await fetch(apiUrl + `utylizacja/delete/${id}`, {
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

    // Filter utilizations by group
    const sGroupUtilizations = utilizations.filter(item => item.grupa === 'S');
    const lGroupUtilizations = utilizations.filter(item => item.grupa === 'L');
    const otherGroupUtilizations = utilizations.filter(item => item.grupa !== 'S' && item.grupa !== 'L');

    // Render table function for reusability
    const renderTable = (items, title) => (
        <div className="mb-10">
            <h3 className="text-xl font-bold text-center my-4 bg-slate-900 text-white py-2">{title}</h3>
            <table className="w-full">
                <thead className="text-left bg-gray-200">
                <tr>
                    <th className="px-2 py-4">Nazwa</th>
                    <th className="px-2 py-4">Ilość</th>
                    <th className="px-2 py-4">Opakowanie</th>
                    <th className="px-2 py-4">Data ważności</th>
                    <th className="px-2 py-4">Ilość nominalna</th>
                    <th className="px-2 py-4">Grupa</th>
                    <th className="px-2 py-4">Powód</th>
                    <th className="px-2 py-4">Kto Zmienił</th>
                    <th className="px-2 py-4">Akcje</th>
                </tr>
                </thead>
                <tbody className="text-left">
                {items.map(utilization => (
                    <tr key={utilization.id} className="border border-gray-700 hover:bg-gray-50">
                        <td className="pl-6 px-2 py-4 border-r border-l border-gray-700 max-w-72">
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
                                <select
                                    value={editedValues[utilization.id]?.opakowanie || ""}
                                    onChange={(e) => handleEdit(utilization.id, "opakowanie", e.target.value)}
                                    className="w-full"
                                >
                                    <option>
                                        Wybierz opakowanie
                                    </option>
                                    {constantsMedicine.BoxTypeOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            ) : (
                                utilization.opakowanie
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
                                <select
                                    value={editedValues[utilization.id]?.grupa || ""}
                                    onChange={(e) => handleEdit(utilization.id, "grupa", e.target.value)}
                                    className="w-full"
                                >
                                    <option>
                                        Wybierz grupę
                                    </option>
                                    <option value="S">S</option>
                                    <option value="L">L</option>
                                    <option value="Other">Inna</option>
                                </select>

                            ) : (
                                utilization.grupa
                            )}
                        </td>
                        <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                            {editMode[utilization.id] ? (
                                <input
                                    type="text"
                                    value={editedValues[utilization.id]?.powod_utylizacji || ""}
                                    onChange={(e) => handleEdit(utilization.id, "powod_utylizacji", e.target.value)}
                                    className="w-full"
                                />
                            ) : (
                                utilization.powod_utylizacji
                            )}
                        </td>
                        <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                            {utilization.kto_zmienil}
                        </td>
                        <td>
                            {editMode[utilization.id] ? (
                                <>
                                    <button
                                        onClick={() => handleSave(utilization.id)}
                                        className="text-green-400 font-semibold m-2"
                                    >
                                        Zapisz
                                    </button>
                                    <button
                                        onClick={() => setEditMode(prev => ({
                                            ...prev,
                                            [utilization.id]: false
                                        }))}
                                        className="text-gray-950 font-semibold m-2"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUtilization(utilization.id)}
                                        className="text-red-600 font-semibold mr-2 ml-2"
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
    );

    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div>
                <div>
                    <h1 className="text-2xl text-center font-bold flex-grow">Utylizacja MV NAWIGATOR
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

                    <div className="mt-6">
                        {sGroupUtilizations.length > 0 && renderTable(sGroupUtilizations, "S")}
                        {lGroupUtilizations.length > 0 && renderTable(lGroupUtilizations, "L")}
                        {otherGroupUtilizations.length > 0 && renderTable(otherGroupUtilizations, "Inne")}
                    </div>
                </div>
            </div>

            <UtilizationAdd isOpen={utilizationAdd} onClose={handleAddUtilizationClose}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-ms font-medium text-gray-700 mb-1">
                            Nazwa
                        </label>
                        <input
                            type="text"
                            name="nazwa"
                            value={newUtilization.nazwa}
                            onChange={handleInputUtilization}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-ms font-medium text-gray-700 mb-1">
                            Ilość
                        </label>
                        <input
                            type="number"
                            name="ilosc"
                            value={newUtilization.ilosc}
                            onChange={handleInputUtilization}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-ms font-medium text-gray-700 mb-1">
                            Opakowanie
                        </label>
                        <select
                            name="opakowanie"
                            value={newUtilization.opakowanie}
                            onChange={handleInputUtilization}
                            className="border rounded-md p-2 w-full"
                        >
                            <option value="">Wybierz opakowanie</option>
                            {constantsMedicine.BoxTypeOptions.map((option, index) => (
                                <option key={index} value={option.value}>{option.label}</option>
                            ))}

                        </select>
                    </div>
                    <div>
                        <label className="block text-ms font-medium text-gray-700 mb-1">
                            Data ważności
                        </label>
                            <input
                                type="date"
                                name="data_waznosci"
                                value={newUtilization.data_waznosci}
                                onChange={handleInputUtilization}
                                className="border rounded-md p-2 w-full"
                            />
                    </div>
                    <div>
                        <label className="block text-ms font-medium text-gray-700 mb-1">
                            Ilość nominalna
                        </label>
                        <input
                            type="text"
                            name="ilosc_nominalna"
                            value={newUtilization.ilosc_nominalna}
                            onChange={handleInputUtilization}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-ms font-medium text-gray-700 mb-1">
                            Grupa S/L
                        </label>
                        <select
                            name="grupa"
                            value={newUtilization.grupa}
                            onChange={handleInputUtilization}
                            className="border rounded-md p-2 w-full"
                        >
                            <option value="">Wybierz grupę</option>
                            <option value="S">Sprzęt</option>
                            <option value="L">Lek</option>
                        </select>
                    </div>

                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Powód utylizacji
                    </label>
                    <textarea
                        name="powod_utylizacji"
                        value={newUtilization.powod_utylizacji}
                        onChange={handleInputUtilization}
                        className="border rounded-md p-2 w-full"
                        rows="3"
                        required
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                        onClick={handleAddUtilizationClose}
                    >Anuluj
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 rounded-md"
                        onClick={handleAddUtilization}
                    >Dodaj

                    </button>

                </div>
            </UtilizationAdd>
            <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
        </div>
    );
}

export default Utilization;