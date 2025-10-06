import React, {useState} from 'react';
import apiUrl from '../constants/api.js';
import {generateMedicineStatusPDF} from '../utils/medicineStatusPdfGenerator.js';

function MedicineStatusPreview({isOpen, onClose}) {
    const [date, setDate] = useState('');
    const [medicineUpdates, setMedicineUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const handlePreviewStatus = async () => {
        if (!date) {
            setError('Proszę wybrać datę');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiUrl}leki/status-by-date/${date}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setMedicineUpdates(data);
            setShowResults(true);
        } catch (error) {
            console.error('Error fetching medicine status updates:', error);
            setError('Błąd podczas pobierania danych');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (medicineUpdates.length > 0) {
            generateMedicineStatusPDF(medicineUpdates, date);
        }
    };

    const handleClose = () => {
        setShowResults(false);
        setMedicineUpdates([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white pr-4 pl-4 pb-4 rounded-lg shadow-md w-4/5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold pt-4">Sprawdź statusy leków w wybranej dacie</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className="flex mb-4">
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        className="border rounded-md p-2 mr-2"
                    />
                    <button
                        onClick={handlePreviewStatus}
                        className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-600 mr-2"
                        disabled={loading}
                    >
                        {loading ? 'Ładowanie...' : 'Sprawdź statusy'}
                    </button>

                    {showResults && medicineUpdates.length > 0 && (
                        <button
                            onClick={handleDownloadPDF}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Pobierz PDF
                        </button>
                    )}
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {showResults && (
                    <div>
                        {medicineUpdates.length > 0 ? (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Leki ze zmienionymi statusami
                                    ({medicineUpdates.length})</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">Nazwa leku</th>
                                        <th className="border p-2 text-left">Data ważności</th>
                                        <th className="border p-2 text-left">Obecny status</th>
                                        <th className="border p-2 text-left">Nowy status</th>
                                        <th className="border p-2 text-left">Ilosc Minimalna</th>
                                        <th className="border p-2 text-left">Ilosc na statku</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {medicineUpdates.map((medicine) => (
                                        <tr key={medicine.id}>
                                            <td className="border p-2">{medicine.nazwa_leku}</td>
                                            <td className="border p-2">{medicine.data_waznosci}</td>
                                            <td className="border p-2">{medicine.current_status}</td>
                                            <td className={`border p-2 ${
                                                medicine.projected_status === 'Przeterminowane' ? 'text-red-600 font-bold' :
                                                    medicine.projected_status === 'Ważność 1 miesiąc' ? 'text-orange-600 font-bold' :
                                                        medicine.projected_status === 'Ważność 3 miesiące' ? 'text-yellow-600' : ''
                                            }`}>
                                                {medicine.projected_status}
                                            </td>
                                            <td className="border p-2">{medicine.ilosc_minimalna}</td>
                                            <td className="border p-2">{medicine.stan_magazynowy_ilosc}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">Nie znaleziono leków ze zmienionymi statusami dla podanej
                                daty.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MedicineStatusPreview;