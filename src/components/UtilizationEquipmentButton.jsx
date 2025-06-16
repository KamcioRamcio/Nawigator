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
                className="bg-violet-200 text-violet-600 px-[18px] py-1 text-xs rounded "
                title="Proszę kliknąć, aby zutylizować"
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