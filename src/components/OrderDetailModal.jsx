import React, { useState, useEffect } from 'react';
import apiUrl from '../constants/api';
import toastService from '../utils/toast';
// jsPDF + embedded font (~2MB) load only when a PDF is generated
const generateOrderPDF = (...args) => import("../utils/orderPdfGenerator").then((m) => m.generateOrderPDF(...args));
import ConfirmDialog from './ConfirmDialog';
import {formatDate, toInputDate} from "../utils/dates.js";
import {apiError} from "../utils/apiError.js";
import {ORDER_STATUSES, ORDER_KEEPS_RECEIPT} from "../constants/statuses.js";

function OrderDetailModal({ isOpen, onClose, orderId, onOrderUpdate }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editedItems, setEditedItems] = useState({});
    const [editedStatus, setEditedStatus] = useState('');
    const [editedCreationDate, setEditedCreationDate] = useState('');
    const [editedName, setEditedName] = useState(''); // New state for edited name
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false)
    // Undoing a receipt: target status, and whether the second confirmation step is shown.
    const [undoTarget, setUndoTarget] = useState('Nowe');
    const [undoConfirm, setUndoConfirm] = useState(false);
    const received = Boolean(order?.data_przyjecia);
    // A received order keeps its stock only in Przyjęte/Zakończone; other statuses go through the undo card.
    const statusOptions = (received ? ORDER_KEEPS_RECEIPT : ORDER_STATUSES).map(value => ({value, label: value}));

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
        }
    }, [isOpen, orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}zamowienia/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            const data = await response.json();
            setOrder(data);
            setEditedStatus(data.status);
            setEditedName(data.nazwa); // Initialize edited name
            setEditedCreationDate(data.data_zamowienia);
            const initialEditState = {};
            if (data.leki) {
                data.leki.forEach(item => {
                    initialEditState[`lek_${item.id}`] = {
                        ilosc: item.ilosc,
                        uwagi: item.uwagi || '',
                        data_waznosci: item.data_waznosci,
                    };
                });
            }
            if (data.sprzet) {
                data.sprzet.forEach(item => {
                    initialEditState[`sprzet_${item.id}`] = {
                        ilosc: item.ilosc,
                        uwagi: item.uwagi || '',
                        data_waznosci : item.data_waznosci || ''
                    };
                });
            }
            setEditedItems(initialEditState);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toastService.error('Błąd podczas pobierania szczegółów zamówienia');
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

    const saveChanges = async () => {
        try {
            setLoading(true);

            // 1. Name and date
            if (editedName !== order.nazwa || editedCreationDate !== order.data_zamowienia) {
                const response = await fetch(`${apiUrl}zamowienia/${orderId}/details`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nazwa: editedName, data_zamowienia: editedCreationDate })
                });
                if (!response.ok) throw new Error(await apiError(response));
            }

            // 2. Items that changed
            const changed = (edited, item) => edited && (
                edited.ilosc !== item.ilosc ||
                edited.uwagi !== (item.uwagi || '') ||
                (edited.data_waznosci || '') !== (item.data_waznosci || '')
            );
            const updatePromises = [];
            for (const [type, items] of [['lek', order.leki], ['sprzet', order.sprzet]]) {
                for (const item of items || []) {
                    const editedItem = editedItems[`${type}_${item.id}`];
                    if (!changed(editedItem, item)) continue;
                    updatePromises.push(fetch(`${apiUrl}zamowienia/${type}/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ilosc: editedItem.ilosc,
                            uwagi: editedItem.uwagi,
                            data_waznosci: editedItem.data_waznosci || ''
                        })
                    }));
                }
            }
            for (const response of await Promise.all(updatePromises)) {
                if (!response.ok) throw new Error(await apiError(response));
            }

            // 3. Status
            if (editedStatus !== order.status) {
                const response = await fetch(`${apiUrl}zamowienia/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: editedStatus })
                });
                if (!response.ok) throw new Error(await apiError(response));
            }

            toastService.success('Zamówienie zaktualizowane pomyślnie');
            await fetchOrderDetails(); // Refresh the order details
            setEditMode(false);
            if (onOrderUpdate) onOrderUpdate();
        } catch (error) {
            console.error('Error updating order:', error);
            toastService.error(`Błąd podczas aktualizacji zamówienia: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    /** Leave "Przyjęte": the server takes back the stock added by the receipt, then sets the new status. */
    const undoReceipt = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}zamowienia/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: undoTarget, cofnijPrzyjecie: true })
            });
            if (!response.ok) throw new Error(await apiError(response));
            toastService.success(`Status zmieniony na „${undoTarget}”, stany sprzed przyjęcia przywrócone`);
            setUndoConfirm(false);
            setEditMode(false);
            await fetchOrderDetails();
            if (onOrderUpdate) onOrderUpdate();
        } catch (error) {
            toastService.error(`Nie udało się zmienić statusu: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = () => {
        if (!order) return;

        // Format data for PDF generation
        const pdfData = {
            nazwa: order.nazwa,
            status: order.status,
            data_zamowienia: formatDate(order.data_zamowienia),
            medicines: order.leki ? order.leki.map(item => ({
                id_kategorii: item.id_kategorii,
                id_pod_kategorii: item.id_pod_kategorii || 0,
                id_pod_pod_kategorii: item.id_pod_pod_kategorii || 0,
                nazwa_leku: item.nazwa_leku,
                ilosc: item.ilosc,
                opakowanie: item.opakowanie || '',
            })) : [],
            equipment: order.sprzet ? order.sprzet.map(item => ({
                id_kategorii: item.id_kategorii,
                id_pod_kategorii: item.id_pod_kategorii || 0,
                nazwa_sprzetu: item.nazwa_sprzetu,
                ilosc: item.ilosc,
                uwagi: item.uwagi || ''
            })) : []
        };

        generateOrderPDF(pdfData);
        toastService.success('Generowanie PDF');
    };

    const deleteItem = async (itemType, itemId) => {
        setConfirmMessage('Czy na pewno chcesz usunąć tę pozycję z zamówienia?');
        setConfirmAction(() => async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}zamowienia/${itemType}/${itemId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete ${itemType}`);
                }

                toastService.success('Pozycja została usunięta');
                await fetchOrderDetails();
                if (onOrderUpdate) onOrderUpdate();
            } catch (error) {
                console.error(`Error deleting ${itemType}:`, error);
                toastService.error(`Błąd podczas usuwania pozycji: ${error.message}`);
            } finally {
                setLoading(false);
            }
        });
        setConfirmDialogOpen(true);
    };

    const deleteOrder = () => {
        setConfirmMessage('Czy na pewno chcesz usunąć całe zamówienie? Tej operacji nie można cofnąć.');
        setConfirmAction(() => async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}zamowienia/${orderId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete order');
                }

                toastService.success('Zamówienie zostało usunięte');
                onClose();
                if (onOrderUpdate) onOrderUpdate();
            } catch (error) {
                console.error('Error deleting order:', error);
                toastService.error(`Błąd podczas usuwania zamówienia: ${error.message}`);
            } finally {
                setLoading(false);
            }
        });
        setConfirmDialogOpen(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Szczegóły zamówienia</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-sm text-sm flex items-center gap-1"
                        >
                            <span>{showSettings ? '⚙️' : '🔧'}</span>
                            <span>{showSettings ? 'Ukryj' : 'Opcje'}</span>
                            <span className={showSettings ? 'rotate-180' : ''}>▼</span>
                        </button>

                        {/* Action Buttons - Only show when showSettings is true */}
                        {showSettings && (
                            <div className="flex gap-1 animate-fadeIn">
                                {!editMode && !loading && (
                                    <>
                                        <button
                                            onClick={handleGeneratePDF}
                                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-sm text-sm flex items-center gap-1"
                                        >
                                            <span>📄</span>
                                            <span>PDF</span>
                                        </button>
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-sm text-sm flex items-center gap-1"
                                        >
                                            <span>✏️</span>
                                            <span>Edytuj</span>
                                        </button>
                                        <button
                                            onClick={deleteOrder}
                                            className="bg-red-100 text-red-700 px-2 py-1 rounded-sm text-sm flex items-center gap-1"
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
                                            className="bg-green-100 text-green-700 px-2 py-1 rounded-sm text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                setUndoConfirm(false);
                                                fetchOrderDetails();
                                            }}
                                            disabled={loading}
                                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-sm text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>❌</span>
                                            <span>Anuluj</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Close Button - Always Visible */}
                        <button
                            onClick={onClose}
                            className="text-black bg-gray-200 rounded-sm px-2 py-1 text-sm"
                        >
                            Zamknij
                        </button>
                    </div>
                </div>

                {loading && !order ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-gray-500">Ładowanie szczegółów zamówienia...</p>
                    </div>
                ) : order ? (
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="font-semibold">Nazwa zamówienia:</p>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={handleNameChange}
                                        className="border rounded-sm px-2 py-1 w-full"
                                    />
                                ) : (
                                    <p>{order.nazwa}</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Data utworzenia:</p>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={toInputDate(editedCreationDate)}
                                        onChange={handleCreationDateChange}
                                        className="border rounded-sm px-2 py-1 w-full"
                                    />
                                ) : (
                                    <p>{formatDate(order.data_zamowienia)}</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Status:</p>
                                {editMode ? (
                                    <select
                                        value={editedStatus}
                                        onChange={handleStatusChange}
                                        className="border rounded-sm px-2 py-1 w-full"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className={`${order.status === 'Zakończone' ? 'text-green-600' :
                                        order.status === 'Anulowane' ? 'text-red-600' :
                                            order.status === 'Zamówione' ? 'text-yellow-600' :
                                                order.status === 'Przyjęte' ? 'text-purple-600' : 'text-blue-600'} font-bold`}>
                                        {order.status}
                                    </p>
                                )}
                            </div>
                        </div>

                        {editMode && received && (
                            <div role="region" aria-label="Zamówienie przyjęte" className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
                                <p className="font-semibold text-amber-900">
                                    To zamówienie zostało już przyjęte ({formatDate(order.data_przyjecia)}).
                                </p>
                                {!undoConfirm ? (
                                    <>
                                        <p className="mt-1 text-amber-900">
                                            Stany magazynowe zostały już powiększone o tę dostawę. Możesz zmienić status na inny niż „Przyjęte” / „Zakończone”, ale wtedy przyjęcie zostanie cofnięte.
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <select
                                                aria-label="Nowy status"
                                                value={undoTarget}
                                                onChange={(e) => setUndoTarget(e.target.value)}
                                                className="border rounded-sm px-2 py-1"
                                            >
                                                {ORDER_STATUSES.filter(st => !ORDER_KEEPS_RECEIPT.includes(st)).map(st => (
                                                    <option key={st} value={st}>{st}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setUndoConfirm(true)}
                                                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-sm"
                                            >
                                                Tak, zmień status
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="mt-1 text-amber-900">
                                            Stany zmienione przy przyjęciu tego zamówienia zostaną cofnięte do stanu sprzed przyjęcia, a status zmieni się na „{undoTarget}”:
                                        </p>
                                        <ul className="mt-2 list-disc pl-5 text-amber-900">
                                            {[...(order.leki || []).map(i => [i.id, i.nazwa_leku, i.przyjeta_ilosc]),
                                              ...(order.sprzet || []).map(i => [`s${i.id}`, i.nazwa_sprzetu, i.przyjeta_ilosc])]
                                                .filter(([, , qty]) => qty != null)
                                                .map(([key, name, qty]) => <li key={key}>{name}: −{qty}</li>)}
                                        </ul>
                                        <p className="mt-2 text-amber-900">Historia dostaw traci wpis tego przyjęcia, a data ważności wraca do poprzedniej, jeśli przyjęcie ją ustawiło.</p>
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={undoReceipt}
                                                disabled={loading}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm disabled:opacity-50"
                                            >
                                                Zmień
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUndoConfirm(false)}
                                                disabled={loading}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-sm"
                                            >
                                                Anuluj
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Medicines */}
                        {order.leki && order.leki.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">Leki ({order.leki.length})</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2 text-left">Nazwa</th>
                                        <th className="border px-4 py-2 text-left">Ilość</th>
                                        <th className="border px-4 py-2 text-left">Opakowanie</th>
                                        <th className="border px-4 py-2 text-left">Data ważności</th>
                                        <th className="border px-4 py-2 text-left">Akcje</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {order.leki.map((item) => (
                                        <tr key={`lek-${item.id}`}>
                                            <td className="border px-4 py-2">{item.nazwa_leku}</td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editedItems[`lek_${item.id}`]?.ilosc || ''}
                                                        onChange={(e) => handleItemChange('lek', item.id, 'ilosc', e.target.value)}
                                                        className="border rounded-sm px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    item.ilosc
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {item.opakowanie || '-'}
                                            </td>
                                            <td className="border px-4 py-2">

                                                {editMode ? (
                                                    <input
                                                        type="date"
                                                        value={toInputDate(editedItems[`lek_${item.id}`]?.data_waznosci)}
                                                        onChange={(e) => handleItemChange('lek', item.id, 'data_waznosci', e.target.value)}
                                                        className="border rounded-sm px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    formatDate(item.data_waznosci) || '-'
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <button
                                                    onClick={() => deleteItem('lek', item.id)}
                                                    className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded-sm flex items-center"
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
                        {order.sprzet && order.sprzet.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Sprzęt ({order.sprzet.length})</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2 text-left">Nazwa</th>
                                        <th className="border px-4 py-2 text-left">Ilość</th>
                                        <th className="border px-4 py-2 text-left">Data ważności</th>
                                        <th className="border px-4 py-2 text-left">Akcje</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {order.sprzet.map((item) => (
                                        <tr key={`sprzet-${item.id}`}>
                                            <td className="border px-4 py-2">{item.nazwa_sprzetu}</td>
                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editedItems[`sprzet_${item.id}`]?.ilosc || ''}
                                                        onChange={(e) => handleItemChange('sprzet', item.id, 'ilosc', e.target.value)}
                                                        className="border rounded-sm px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    item.ilosc
                                                )}
                                            </td>

                                            <td className="border px-4 py-2">
                                                {editMode ? (
                                                    <input
                                                        type="date"
                                                        value={toInputDate(editedItems[`sprzet_${item.id}`]?.data_waznosci)}
                                                        onChange={(e) => handleItemChange('sprzet', item.id, 'data_waznosci', e.target.value)}
                                                        className="border rounded-sm px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    formatDate(item.data_waznosci) || '-'
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <button
                                                    onClick={() => deleteItem('sprzet', item.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-sm text-sm"
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

                        {(!order.leki || order.leki.length === 0) && (!order.sprzet || order.sprzet.length === 0) && (
                            <p className="text-center text-gray-500">Brak pozycji w zamówieniu</p>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-red-500">Nie udało się załadować szczegółów zamówienia</p>
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

export default OrderDetailModal;