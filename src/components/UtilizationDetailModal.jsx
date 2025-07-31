import React, { useState, useEffect } from 'react';
import apiUrl from '../constants/api';
import toastService from '../utils/toast';
import { generateUtilizationPDF } from '../utils/utilizationPdfGenerator';
import ConfirmDialog from './ConfirmDialog';

function UtilizationDetailModal({ isOpen, onClose, utilizationId, onUtilizationUpdate }) {
    const [utilization, setUtilization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editedItems, setEditedItems] = useState({});
    const [editedStatus, setEditedStatus] = useState('');
    const [editedCreationDate, setEditedCreationDate] = useState('');
    const [editedName, setEditedName] = useState('');
    const [editedNotes, setEditedNotes] = useState('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const statusOptions = [
        { value: 'Nowa', label: 'Nowa' },
        { value: 'Zakończona', label: 'Zakończona' },
        { value: 'Anulowana', label: 'Anulowana' }
    ];

    useEffect(() => {
        if (isOpen && utilizationId) {
            fetchUtilizationDetails();
        }
    }, [isOpen, utilizationId]);

    const fetchUtilizationDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}utylizacja/${utilizationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch utilization details');
            }
            const data = await response.json();
            setUtilization(data);
            setEditedStatus(data.status);
            setEditedName(data.nazwa);
            setEditedCreationDate(data.data_utworzenia);
            setEditedNotes(data.uwagi || '');

            const initialEditState = {};
            if (data.leki) {
                data.leki.forEach(item => {
                    initialEditState[`lek_${item.id}`] = {
                        ilosc: item.ilosc,
                        uwagi: item.uwagi || '',
                        data_waznosci: item.data_waznosci || '',
                        powod_utylizacji: item.powod_utylizacji || '',
                        ilosc_nominalna: item.ilosc_nominalna || '',
                        opakowanie: item.opakowanie || ''
                    };
                });
            }
            if (data.sprzet) {
                data.sprzet.forEach(item => {
                    initialEditState[`sprzet_${item.id}`] = {
                        ilosc: item.ilosc,
                        uwagi: item.uwagi || '',
                        data_waznosci: item.data_waznosci || '',
                        powod_utylizacji: item.powod_utylizacji || ''
                    };
                });
            }
            setEditedItems(initialEditState);
        } catch (error) {
            console.error('Error fetching utilization details:', error);
            toastService.error('Błąd podczas pobierania szczegółów utylizacji');
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (itemType, itemId, field, value) => {
        const key = `${itemType}_${itemId}`;
        setEditedItems(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: field === 'ilosc' ? Number(value) || 0 : value
            }
        }));
    };

    const handleStatusChange = (e) => {
        setEditedStatus(e.target.value);
    };

    const handleNameChange = (e) => {
        setEditedName(e.target.value);
    };

    const handleCreationDateChange = (e) => {
        setEditedCreationDate(e.target.value);
    };

    const handleNotesChange = (e) => {
        setEditedNotes(e.target.value);
    };

    const saveChanges = async () => {
        try {
            setLoading(true);

            // 1. Update utilization details if changed
            if (editedName !== utilization.nazwa || editedStatus !== utilization.status ||
                editedCreationDate !== utilization.data_utworzenia || editedNotes !== (utilization.uwagi || '')) {

                const detailsResponse = await fetch(`${apiUrl}utylizacja/${utilizationId}/details`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nazwa: editedName,
                        status: editedStatus,
                        data_utworzenia: editedCreationDate,
                        uwagi: editedNotes
                    })
                });

                if (!detailsResponse.ok) {
                    throw new Error('Failed to update utilization details');
                }
            }

            // 2. Update each item that has changes
            const updatePromises = [];

            // Process medicine items
            if (utilization.leki) {
                utilization.leki.forEach(item => {
                    const editedItem = editedItems[`lek_${item.id}`];
                    if (editedItem && (
                        editedItem.ilosc !== item.ilosc ||
                        editedItem.uwagi !== (item.uwagi || '') ||
                        editedItem.data_waznosci !== (item.data_waznosci || '') ||
                        editedItem.powod_utylizacji !== (item.powod_utylizacji || '') ||
                        editedItem.ilosc_nominalna !== (item.ilosc_nominalna || '') ||
                        editedItem.opakowanie !== (item.opakowanie || '')
                    )) {
                        updatePromises.push(
                            fetch(`${apiUrl}utylizacja/lek/${item.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ilosc: editedItem.ilosc,
                                    uwagi: editedItem.uwagi,
                                    data_waznosci: editedItem.data_waznosci,
                                    powod_utylizacji: editedItem.powod_utylizacji,
                                    ilosc_nominalna: editedItem.ilosc_nominalna,
                                    opakowanie: editedItem.opakowanie
                                })
                            })
                        );
                    }
                });
            }

            // Process equipment items
            if (utilization.sprzet) {
                utilization.sprzet.forEach(item => {
                    const editedItem = editedItems[`sprzet_${item.id}`];
                    if (editedItem && (
                        editedItem.ilosc !== item.ilosc ||
                        editedItem.uwagi !== (item.uwagi || '') ||
                        editedItem.data_waznosci !== (item.data_waznosci || '') ||
                        editedItem.powod_utylizacji !== (item.powod_utylizacji || '')
                    )) {
                        updatePromises.push(
                            fetch(`${apiUrl}utylizacja/sprzet/${item.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ilosc: editedItem.ilosc,
                                    uwagi: editedItem.uwagi,
                                    data_waznosci: editedItem.data_waznosci,
                                    powod_utylizacji: editedItem.powod_utylizacji
                                })
                            })
                        );
                    }
                });
            }

            if (updatePromises.length > 0) {
                const results = await Promise.all(updatePromises);
                results.forEach(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update some items');
                    }
                });
            }

            toastService.success('Utylizacja zaktualizowana pomyślnie');
            await fetchUtilizationDetails();
            setEditMode(false);
            if (onUtilizationUpdate) onUtilizationUpdate();
        } catch (error) {
            console.error('Error updating utilization:', error);
            toastService.error('Błąd podczas aktualizacji utylizacji');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = () => {
        if (!utilization) return;

        const pdfData = {
            nazwa: utilization.nazwa,
            status: utilization.status,
            data_utworzenia: formatDate(utilization.data_utworzenia),
            uwagi: utilization.uwagi || '',
            medicines: utilization.leki ? utilization.leki.map(item => ({
                nazwa_leku: item.nazwa_leku,
                ilosc: item.ilosc,
                opakowanie: item.opakowanie || '',
                data_waznosci: item.data_waznosci || '',
                id_kategorii: item.id_kategorii || '',
                id_pod_kategorii: item.id_pod_kategorii || '',
                id_pod_pod_kategorii: item.id_pod_pod_kategorii || ''
            })) : [],
            equipment: utilization.sprzet ? utilization.sprzet.map(item => ({
                nazwa_sprzetu: item.nazwa_sprzetu,
                ilosc: item.ilosc,
                data_waznosci: item.data_waznosci || '',
                powod_utylizacji: item.powod_utylizacji || '',
                id_kategorii: item.id_kategorii || '',
                id_pod_kategorii: item.id_pod_kategorii || ''
            })) : []
        };

        generateUtilizationPDF(pdfData);
        toastService.success('Generowanie PDF');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            if (/^\d{2}[-\.]\d{2}[-\.]\d{4}$/.test(dateString)) {
                return dateString.replace(/\./g, '-');
            }

            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const deleteItem = async (itemType, itemId) => {
        setConfirmMessage('Czy na pewno chcesz usunąć tę pozycję z utylizacji?');
        setConfirmAction(() => async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}utylizacja/utylizacje/${itemType}/${itemId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete ${itemType}`);
                }

                toastService.success('Pozycja została usunięta');
                await fetchUtilizationDetails();
                if (onUtilizationUpdate) onUtilizationUpdate();
            } catch (error) {
                console.error(`Error deleting ${itemType}:`, error);
                toastService.error(`Błąd podczas usuwania pozycji: ${error.message}`);
            } finally {
                setLoading(false);
            }
        });
        setConfirmDialogOpen(true);
    };

    const deleteUtilization = () => {
        setConfirmMessage('Czy na pewno chcesz usunąć całą utylizację? Tej operacji nie można cofnąć.');
        setConfirmAction(() => async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}utylizacja/utylizacje/${utilizationId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete utilization');
                }

                toastService.success('Utylizacja została usunięta');
                onClose();
                if (onUtilizationUpdate) onUtilizationUpdate();
            } catch (error) {
                console.error('Error deleting utilization:', error);
                toastService.error(`Błąd podczas usuwania utylizacji: ${error.message}`);
            } finally {
                setLoading(false);
            }
        });
        setConfirmDialogOpen(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Szczegóły utylizacji</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded text-sm flex items-center gap-1"
                        >
                            <span>{showSettings ? '⚙️' : '🔧'}</span>
                            <span>{showSettings ? 'Ukryj' : 'Opcje'}</span>
                            <span className={showSettings ? 'rotate-180' : ''}>▼</span>
                        </button>

                        {showSettings && (
                            <div className="flex gap-1 animate-fadeIn">
                                {!editMode && !loading && (
                                    <>
                                        <button
                                            onClick={handleGeneratePDF}
                                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm flex items-center gap-1"
                                        >
                                            <span>📄</span>
                                            <span>PDF</span>
                                        </button>
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex items-center gap-1"
                                        >
                                            <span>✏️</span>
                                            <span>Edytuj</span>
                                        </button>
                                        <button
                                            onClick={deleteUtilization}
                                            className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm flex items-center gap-1"
                                        >
                                            <span>🗑️</span>
                                            <span>Usuń</span>
                                        </button>
                                    </>
                                )}
                                {editMode && (
                                    <>
                                        <button
                                            onClick={saveChanges}
                                            disabled={loading}
                                            className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="animate-spin">⏳</span>
                                                    <span>Zapisuję</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>💾</span>
                                                    <span>Zapisz</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditMode(false);
                                                fetchUtilizationDetails();
                                            }}
                                            disabled={loading}
                                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>❌</span>
                                            <span>Anuluj</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="text-black bg-gray-200 rounded px-2 py-1 text-sm"
                        >
                            Zamknij
                        </button>
                    </div>
                </div>

                {loading && !utilization ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-gray-500">Ładowanie szczegółów utylizacji...</p>
                    </div>
                ) : utilization ? (
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="font-semibold">Nazwa utylizacji:</p>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={handleNameChange}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    <p>{utilization.nazwa}</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Data utworzenia:</p>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={editedCreationDate}
                                        onChange={handleCreationDateChange}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    <p>{formatDate(utilization.data_utworzenia)}</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Status:</p>
                                {editMode ? (
                                    <select
                                        value={editedStatus}
                                        onChange={handleStatusChange}
                                        className="border rounded px-2 py-1 w-full"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className={`${utilization.status === 'Zakończone' ? 'text-green-600' :
                                        utilization.status === 'Anulowane' ? 'text-red-600' :
                                            utilization.status === 'Zrealizowane' ? 'text-purple-600' : 'text-blue-600'} font-bold`}>
                                        {utilization.status}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Kto utworzył:</p>
                                <p>{utilization.kto_utworzyl || '-'}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="font-semibold">Uwagi:</p>
                            {editMode ? (
                                <textarea
                                    value={editedNotes}
                                    onChange={handleNotesChange}
                                    className="border rounded px-2 py-1 w-full"
                                    rows="3"
                                />
                            ) : (
                                <p>{utilization.uwagi || '-'}</p>
                            )}
                        </div>

                        {/* Medicines */}
                        {utilization.leki && utilization.leki.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">Leki ({utilization.leki.length})</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2 text-left">Nazwa</th>
                                        <th className="border px-4 py-2 text-left">Ilość</th>
                                        <th className="border px-4 py-2 text-left">Opakowanie</th>
                                        <th className="border px-4 py-2 text-left">Data ważności</th>
                                        <th className="border px-4 py-2 text-left">Powód utylizacji/Uwagi</th>
                                        <th className="border px-4 py-2 text-left">Akcje</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {utilization.leki.map((item) => (
                                        <tr key={`lek-${item.id}`}>
                                            <td className="border px-4 py-2">{item.nazwa_leku}</td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editedItems[`lek_${item.id}`]?.ilosc || ''}
                                                        onChange={(e) => handleItemChange('lek', item.id, 'ilosc', e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    item.ilosc
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={editedItems[`lek_${item.id}`]?.opakowanie || ''}
                                                        onChange={(e) => handleItemChange('lek', item.id, 'opakowanie', e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    item.opakowanie || '-'
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="date"
                                                        value={editedItems[`lek_${item.id}`]?.data_waznosci || ''}
                                                        onChange={(e) => handleItemChange('lek', item.id, 'data_waznosci', e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    formatDate(item.data_waznosci) || '-'
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={editedItems[`lek_${item.id}`]?.powod_utylizacji || ''}
                                                        onChange={(e) => handleItemChange('lek', item.id, 'powod_utylizacji', e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    item.powod_utylizacji || '-'
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <button
                                                    onClick={() => deleteItem('lek', item.id)}
                                                    className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded flex items-center"
                                                    disabled={loading || editMode}
                                                >
                                                    Usuń
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Equipment */}
                        {utilization.sprzet && utilization.sprzet.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Sprzęt ({utilization.sprzet.length})</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2 text-left">Nazwa</th>
                                        <th className="border px-4 py-2 text-left">Ilość</th>
                                        <th className="border px-4 py-2 text-left">Data ważności</th>
                                        <th className="border px-4 py-2 text-left">Powód utylizacji</th>
                                        <th className="border px-4 py-2 text-left">Akcje</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {utilization.sprzet.map((item) => (
                                        <tr key={`sprzet-${item.id}`}>
                                            <td className="border px-4 py-2">{item.nazwa_sprzetu}</td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editedItems[`sprzet_${item.id}`]?.ilosc || ''}
                                                        onChange={(e) => handleItemChange('sprzet', item.id, 'ilosc', e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    item.ilosc
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="date"
                                                        value={editedItems[`sprzet_${item.id}`]?.data_waznosci || ''}
                                                        onChange={(e) => handleItemChange('sprzet', item.id, 'data_waznosci', e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    formatDate(item.data_waznosci) || '-'
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={editedItems[`sprzet_${item.id}`]?.powod_utylizacji || ''}
                                                        onChange={(e) => handleItemChange('sprzet', item.id, 'powod_utylizacji', e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    item.powod_utylizacji || '-'
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <button
                                                    onClick={() => deleteItem('sprzet', item.id)}
                                                    className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded flex items-center"
                                                    disabled={loading || editMode}
                                                >
                                                    Usuń
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {(!utilization.leki || utilization.leki.length === 0) && (!utilization.sprzet || utilization.sprzet.length === 0) && (
                            <p className="text-center text-gray-500">Brak pozycji w utylizacji</p>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-red-500">Nie udało się załadować szczegółów utylizacji</p>
                    </div>
                )}
            </div>
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                message={confirmMessage}
                onConfirm={() => {
                    setConfirmDialogOpen(false);
                    confirmAction && confirmAction();
                }}
                onCancel={() => setConfirmDialogOpen(false)}
            />
        </div>
    );
}

export default UtilizationDetailModal;
