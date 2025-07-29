import React, {useState} from 'react';
import UtilizationModal from './UtilizationModal';

const UtilizationButton = ({item, itemType, onUtilizationComplete}) => {
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

            <UtilizationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                item={item}
                itemType={itemType}
                onUtilizationComplete={onUtilizationComplete}
            />
        </>
    );
};

export default UtilizationButton;