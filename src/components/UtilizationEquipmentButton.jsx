import React, {useState} from 'react';
import UtilizationEquipmentModal from './UtilizationEquipmentModal';

const UtilizationEquipmentButton = ({equipment, onUtilizationComplete}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUtilize = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={handleUtilize}
                className="text-red-600 font-semibold ml-2"
            >
                Utylizuj
            </button>

            <UtilizationEquipmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                equipment={equipment}
                onUtilizationComplete={onUtilizationComplete}
            />
        </>
    );
};

export default UtilizationEquipmentButton;
