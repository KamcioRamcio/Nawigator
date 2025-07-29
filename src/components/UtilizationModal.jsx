import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from "../constants/api.js";
import toastService from "../utils/toast.js";

const UtilizationModal = ({isOpen, onClose, item, itemType, onUtilizationComplete}) => {
    const [formData, setFormData] = useState({
        ilosc_nominalna: '',
        powod_utylizacji: '',
        opakowanie: '',
        data_waznosci: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // State for utilization records
    const [utilizations, setUtilizations] = useState([]);
    const [selectedUtilization, setSelectedUtilization] = useState("");
    const [isCreatingNewUtilization, setIsCreatingNewUtilization] = useState(false);
    const [newUtilizationName, setNewUtilizationName] = useState("");
    const [newUtilizationCreated, setNewUtilizationCreated] = useState(false);
    const [newUtilizationId, setNewUtilizationId] = useState(null);
    const [creatingUtilization, setCreatingUtilization] = useState(false);

    // Function to format date from dd-mm-yyyy to yyyy-mm-dd
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';

        // Try parsing as dd-mm-yyyy
        const parts = dateString.split('-');
        if (parts.length === 3) {
            // Check if it's in dd-mm-yyyy format
            if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        // Return as is if it's already in the correct format or can't be parsed
        return dateString;
    };

    // Reset form when modal opens or item changes
    useEffect(() => {
        if (isOpen && item) {
            const sourceDate = itemType === 'medicine' ? item.lek_data : item.sprzet_data_waznosci;
            const formattedDate = formatDateForInput(sourceDate);

            setFormData({
                ilosc_nominalna: '',
                powod_utylizacji: '',
                opakowanie: itemType === 'medicine' ? item.lek_opakowanie : "",
                data_waznosci: formattedDate
            });
            setError('');
            setSuccess(false);
            setIsCreatingNewUtilization(false);
            setNewUtilizationName("");
            setNewUtilizationCreated(false);
            setSelectedUtilization("");
            fetchUtilizations();
        }
    }, [isOpen, item, itemType]);

    if (!isOpen) return null;

    const fetchUtilizations = async () => {
        try {
            const response = await fetch(`${apiUrl}utylizacja`);
            if (response.ok) {
                const data = await response.json();
                setUtilizations(data.filter((utilization) =>
                    utilization.status?.toLowerCase() !== "zakończone" &&
                    utilization.status?.toLowerCase() !== "anulowane"
                ));
            } else {
                toastService.error("Nie udało się pobrać listy utylizacji");
            }
        } catch (error) {
            console.error("Error fetching utilizations:", error);
            toastService.error("Błąd podczas pobierania utylizacji");
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCreateUtilization = async () => {
        if (!newUtilizationName.trim()) {
            toastService.warning("Wprowadź nazwę utylizacji");
            return;
        }

        setCreatingUtilization(true);
        try {
            const payload = {
                nazwa: newUtilizationName,
                status: "Nowa",
                data_utylizacji: new Date().toLocaleDateString("pl-PL"),
                kto_utworzyl: localStorage.getItem("username") || ""

            };

            const response = await fetch(`${apiUrl}utylizacja`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                await fetchUtilizations();

                // Get current date values from item
                const sourceDate = itemType === 'medicine' ? item.lek_data : item.sprzet_data_waznosci;
                const formattedDate = formatDateForInput(sourceDate);

                // Reset form data
                setFormData({
                    ilosc_nominalna: '',
                    powod_utylizacji: '',
                    opakowanie: itemType === 'medicine' ? item.lek_opakowanie : "",
                    data_waznosci: formattedDate
                });

                // Switch to "select existing" mode and select the new utilization
                setIsCreatingNewUtilization(false);
                setSelectedUtilization(data.id.toString());

                // Reset new utilization state
                setNewUtilizationName("");
                setNewUtilizationCreated(false);
                setNewUtilizationId(null);

                toastService.success("Utworzono nową utylizację");
            } else {
                throw new Error("Failed to create utilization");
            }
        } catch (error) {
            console.error("Error creating utilization:", error);
            toastService.error("Błąd podczas tworzenia utylizacji");
        } finally {
            setCreatingUtilization(false);
        }
    };

    const validateForm = () => {
        if (isCreatingNewUtilization && !newUtilizationCreated) {
            setError('Utwórz najpierw nową utylizację');
            return false;
        }

        if (!isCreatingNewUtilization && !selectedUtilization) {
            setError('Wybierz utylizację');
            return false;
        }

        if (!formData.ilosc_nominalna) {
            setError('Ilość nominalna jest wymagana');
            return false;
        }

        const numAmount = parseFloat(formData.ilosc_nominalna);
        const currentAmount = parseFloat(
            itemType === 'medicine' ? item.lek_ilosc : item.sprzet_ilosc_aktualna
        );

        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Podaj prawidłową ilość nominalną (większą niż 0)');
            return false;
        }

        // if (!formData.powod_utylizacji.trim()) {
        //     setError('Powód utylizacji jest wymagany');
        //     return false;
        // }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const utilizationId = selectedUtilization || newUtilizationId;
            let payload, endpoint;

            if (itemType === 'medicine') {
                payload = {
                    id_utylizacji: utilizationId,
                    id_leku: item.lek_id,
                    nazwa: item.lek_nazwa,
                    ilosc: formData.ilosc_nominalna,
                    opakowanie: formData.opakowanie,
                    data_waznosci: formData.data_waznosci,
                    powod_utylizacji: formData.powod_utylizacji || 'brak'
                };
                endpoint = `${apiUrl}utylizacja/lek`;
            } else {
                payload = {
                    id_utylizacji: utilizationId,
                    id_sprzetu: item.sprzet_id,
                    nazwa: item.sprzet_nazwa,
                    ilosc: formData.ilosc_nominalna,
                    data_waznosci: formData.data_waznosci,
                    powod_utylizacji: formData.powod_utylizacji || 'brak'
                };
                endpoint = `${apiUrl}utylizacja/sprzet`;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSuccess(true);
                setIsSubmitting(false);

                setTimeout(() => {
                    onClose();
                    if (onUtilizationComplete) {
                        onUtilizationComplete();
                    }
                }, 1500);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Błąd podczas dodawania przedmiotu do utylizacji");
            }
        } catch (err) {
            setIsSubmitting(false);
            setError(err.message || 'Wystąpił błąd podczas utylizacji');
            console.error('Utilization error:', err);
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "nowa":
                return "bg-red-100 text-red-800 border border-red-200";
            case "w trakcie":
                return "bg-amber-100 text-amber-800 border border-amber-200";
            case "zakończone":
                return "bg-green-100 text-green-800 border border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-red-700 text-white p-4 sm:p-6 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <span className="text-xl">{itemType === 'medicine' ? '💊' : '🔧'}</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold">Utylizacja {itemType === 'medicine' ? 'Leku' : 'Sprzętu'}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                            disabled={isSubmitting}
                            aria-label="Zamknij"
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Item Information Card */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-l-red-500 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 p-2 sm:p-3 rounded-full ${itemType === "medicine" ? "bg-green-100" : "bg-blue-100"}`}>
                                <span className="text-xl">{itemType === "medicine" ? "💊" : "🔧"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {itemType === "medicine" ? item.lek_nazwa : item.sprzet_nazwa}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div>
                                <span className="text-gray-700 font-medium">Ilość dostępna:</span>
                                <p className="text-gray-900">{itemType === 'medicine' ? item.lek_ilosc : item.sprzet_ilosc_aktualna}</p>
                            </div>
                            {itemType === 'medicine' && item.lek_opakowanie && (
                                <div>
                                    <span className="text-gray-700 font-medium">Opakowanie:</span>
                                    <p className="text-gray-900 truncate">{item.lek_opakowanie}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-700 font-medium">Data ważności:</span>
                                <p className="text-gray-900">{itemType === 'medicine' ? item.lek_data : item.sprzet_data_waznosci}</p>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                            <span>✅</span>
                            <span className="font-medium">Utylizacja została przeprowadzona pomyślnie!</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                            <span>⚠️</span>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Utilization Type Selection */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Wybierz opcję utylizacji</h3>
                        <div className="space-y-2 sm:space-y-3">
                            <label
                                className={`flex items-center p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    !isCreatingNewUtilization
                                        ? "border-red-500 bg-red-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="utilizationType"
                                    checked={!isCreatingNewUtilization}
                                    onChange={() => setIsCreatingNewUtilization(false)}
                                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <div className="ml-3 flex items-center space-x-2">
                                    <span className="text-lg">📋</span>
                                    <span className="font-medium text-gray-900 text-sm sm:text-base">Wybierz istniejącą utylizację</span>
                                </div>
                            </label>

                            <label
                                className={`flex items-center p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isCreatingNewUtilization
                                        ? "border-red-500 bg-red-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="utilizationType"
                                    checked={isCreatingNewUtilization}
                                    onChange={() => {
                                        setIsCreatingNewUtilization(true);
                                        setNewUtilizationCreated(false);
                                    }}
                                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <div className="ml-1 flex items-center space-x-2">
                                    <span className="text-lg">➕</span>
                                    <span className="font-medium text-gray-900 text-sm sm:text-base">Nowa utylizacja</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Utilization Creation/Selection */}
                    {isCreatingNewUtilization ? (
                        <div className="space-y-3 sm:space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Nazwa nowej utylizacji</label>
                            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                                <input
                                    type="text"
                                    value={newUtilizationName}
                                    onChange={(e) => setNewUtilizationName(e.target.value)}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                                    placeholder="Wprowadź nazwę utylizacji"
                                    disabled={newUtilizationCreated}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateUtilization}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 ${
                                        newUtilizationCreated
                                            ? "bg-green-100 text-green-800 border border-green-200"
                                            : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                                    }`}
                                    disabled={creatingUtilization || newUtilizationCreated}
                                >
                                    {creatingUtilization ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <span className="animate-spin">⏳</span>
                                            <span>Tworzenie...</span>
                                        </span>
                                    ) : newUtilizationCreated ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>✅</span>
                                            <span>Utworzono</span>
                                        </span>
                                    ) : (
                                        "Utwórz utylizację"
                                    )}
                                </button>
                            </div>
                            {newUtilizationCreated && (
                                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                    <span>✅</span>
                                    <span className="font-medium">Utylizacja utworzona pomyślnie</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Wybierz utylizację</label>
                            <select
                                value={selectedUtilization}
                                onChange={(e) => setSelectedUtilization(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white"
                            >
                                <option value="">Wybierz utylizację</option>
                                {utilizations.map((utilization) => (
                                    <option key={utilization.id} value={utilization.id}>
                                        {utilization.nazwa} ({utilization.status || "Nowa"})
                                    </option>
                                ))}
                            </select>
                            {selectedUtilization && (
                                <div className="mt-2">
                                    {utilizations
                                        .filter((utilization) => utilization.id.toString() === selectedUtilization.toString())
                                        .map((utilization) => (
                                            <div
                                                key={utilization.id}
                                                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border"
                                            >
                                                <span className="font-medium text-sm sm:text-base">{utilization.nazwa}</span>
                                                <span
                                                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(utilization.status)}`}
                                                >
                                                    {utilization.status || "Nowa"}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Nominal Amount */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Ilość nominalna <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                name="ilosc_nominalna"
                                value={formData.ilosc_nominalna}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                                placeholder={`Wprowadź ilość`}
                                required
                            />
                        </div>

                        {/* Packaging (only for medicine) */}
                        {itemType === 'medicine' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Opakowanie
                                </label>
                                <input
                                    type="text"
                                    name="opakowanie"
                                    value={formData.opakowanie}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                                    placeholder="Opakowanie"
                                />
                            </div>
                        )}

                        {/* Expiration Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Data ważności
                            </label>
                            <input
                                type="date"
                                name="data_waznosci"
                                value={formData.data_waznosci}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                            />
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Powód utylizacji/Uwagi
                            </label>
                            <textarea
                                name="powod_utylizacji"
                                value={formData.powod_utylizacji}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none"
                                rows="3"
                                placeholder="Opisz powód utylizacji..."
                                // required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 pt-3 sm:pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                                disabled={isSubmitting || success}
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting || success || (isCreatingNewUtilization && !newUtilizationCreated) || (!isCreatingNewUtilization && !selectedUtilization)}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span className="animate-spin">⏳</span>
                                        <span>Przetwarzanie...</span>
                                    </span>
                                ) : success ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>✅</span>
                                        <span>Zakończone</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>{itemType === 'medicine' ? '🗑️' : '🔧'}</span>
                                        <span>Utylizuj</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UtilizationModal;