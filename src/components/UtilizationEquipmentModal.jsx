import React, {useState} from 'react';
import axios from 'axios';
import apiUrl from "../constants/api.js";


const UtilizationEquipmentModal = ({isOpen, onClose, equipment, onUtilizationComplete}) => {
    const [formData, setFormData] = useState({
        grupa: '',
        ilosc_nominalna: '',
        powod_utylizacji: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Prepare the utilization data
            const utilizationData = {
                nazwa: equipment.sprzet_nazwa,
                ilosc: equipment.sprzet_ilosc_aktualna,
                opakowanie: "",
                data_waznosci: equipment.sprzet_data_waznosci,
                ilosc_nominalna: formData.ilosc_nominalna,
                grupa: formData.grupa,
                powod_utylizacji: formData.powod_utylizacji
            };

            // Submit to the utilization endpoint
            await axios.post(apiUrl + 'utylizacja/from-medicine', utilizationData);

            // Delete the original equipment record

            setIsSubmitting(false);
            onClose();

            // Notify parent component to refresh equipment list
            if (onUtilizationComplete) {
                onUtilizationComplete();
            }
        } catch (err) {
            setIsSubmitting(false);
            setError(err.response?.data?.message || 'Wystąpił błąd podczas utylizacji');
            console.error('Utilization error:', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
                <h2 className="text-xl font-bold mb-4">Utylizacja Sprzętu: {equipment.sprzet_nazwa}</h2>

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grupa*
                        </label>
                        <select
                            name="grupa"
                            value={formData.grupa}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                            required
                        >
                            <option value="">Wybierz grupę</option>
                            <option value="S">S</option>
                            <option value="L">L</option>
                            <option value="Other">Inna</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ilość nominalna*
                        </label>
                        <input
                            type="text"
                            name="ilosc_nominalna"
                            value={formData.ilosc_nominalna}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                            required
                        />

                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Powód utylizacji*
                        </label>
                        <textarea
                            name="powod_utylizacji"
                            value={formData.powod_utylizacji}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-3">
                        <div>
                            <p className="text-sm text-gray-500">Ilość: {equipment.sprzet_ilosc_aktualna}</p>
                            <p className="text-sm text-gray-500">Data ważności: {equipment.sprzet_data_waznosci}</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                                disabled={isSubmitting}
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Przetwarzanie...' : 'Utylizuj'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UtilizationEquipmentModal;
