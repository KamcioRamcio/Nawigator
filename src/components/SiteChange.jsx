import React, { useEffect, useRef } from 'react';

function SiteChange({ isOpen, onClose }) {
    const modalRef = useRef(null);

    // Handle click outside and escape key to close modal
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const navigationItems = [
        { path: '/main/leki', name: 'Główny spis leków' },
        { path: '/zestawienie-lekow', name: 'Zestawienie leków' },
        { path: '/minimum-lekow', name: 'Spis minimum leków' },
        { path: '/main/sprzet', name: 'Spis minimum sprzętu' },
        { path: '/zestawienie-sprzetu', name: 'Spis sprzętu' },
        { path: '/utylizacja', name: 'Utylizacja' },
        { path: '/dokumentacja', name: 'Dokumentacja' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 sm:items-center">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{
                    transform: 'translateY(0)',
                    opacity: 1,
                    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="navigation-title"
            >
                <div className="bg-blue-600 px-6 py-4">
                    <h2 id="navigation-title" className="text-xl font-bold text-white">Wybierz Arkusz</h2>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {navigationItems.map((item) => (
                            <a
                                key={item.path}
                                href={item.path}
                                className="p-3 rounded-lg hover:bg-blue-50 border border-gray-200 transition-all duration-200 font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 font-bold shadow-md hover:shadow-lg"
                        >
                            Zamknij
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SiteChange;
