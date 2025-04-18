import React, {useEffect} from "react";

function UtilizationAdd({isOpen, onClose, children}) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transation-opacity background-blur-sm"
                 onClick={onClose}
            />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div
                        className="relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                        {/* Modal Header */}
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Dodaj Pozycję
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <span className="sr-only">Zamknij</span>
                                <svg
                                    className="h-6 w-6 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="space-y-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UtilizationAdd;