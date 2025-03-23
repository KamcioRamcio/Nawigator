import React, { useState } from 'react';
import UtilizationModal from './UtilizationModal';

const UtilizationButton = ({ medicine, onUtilizationComplete }) => {
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

            <UtilizationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                medicine={medicine}
                onUtilizationComplete={onUtilizationComplete}
            />
        </>
    );
};

export default UtilizationButton;
