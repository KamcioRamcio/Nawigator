import React, {useEffect, useRef} from 'react';

function SiteChange({isOpen, onClose}) {
    const modalRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user.position || "viewer"

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

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        window.location.href = '/';
    }

    // Medicine related navigation items
    const medicineItems = [
        {path: '/main/leki', name: 'Główny spis leków', icon: '💊'},
        {path: '/zestawienie-lekow', name: 'Zestawienie leków', icon: '📋'},
    ];

    // Equipment related navigation items
    const equipmentItems = [
        {path: '/main/sprzet', name: 'Spis minimum sprzętu', icon: '🔧'},
        {path: '/zestawienie-sprzetu', name: 'Spis sprzętu', icon: '📝'},
    ];

    // Utilization and documentation items
    const otherItems = [
        {path: '/utylizacja', name: 'Utylizacja', icon: '♻️'},
        {path: '/zamowienia', name: 'Zamówienia', icon: '🛒'},
        {path: '/dokumentacja', name: 'Dokumentacja', icon: '📄'},

    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all duration-300 ease-in-out"
                style={{
                    opacity: 1,
                    transform: 'scale(1)',
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="navigation-title"
            >
                <div
                    className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-5 flex justify-between items-center">
                    <h2 id="navigation-title" className="text-2xl font-bold text-white">Wybierz Arkusz</h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                        aria-label="Zamknij"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {/* Section 1: Medicine */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Leki</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {medicineItems.map((item) => (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    className="group p-4 rounded-xl hover:bg-blue-50 border border-gray-200 transition-all duration-200 font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:shadow flex items-center gap-3"
                                >
                                    <span
                                        className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span>{item.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Equipment */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Sprzęt</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {equipmentItems.map((item) => (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    className="group p-4 rounded-xl hover:bg-blue-50 border border-gray-200 transition-all duration-200 font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:shadow flex items-center gap-3"
                                >
                                    <span
                                        className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span>{item.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Utilization, Documentation and Admin */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Utylizacja i
                            Dokumentacja</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {otherItems.map((item) => (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    className="group p-4 rounded-xl hover:bg-blue-50 border border-gray-200 transition-all duration-200 font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:shadow flex items-center gap-3"
                                >
                                    <span
                                        className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span>{item.name}</span>
                                </a>
                            ))}

                            {/* Admin panel link - only visible to admin users */}
                            {userPosition === 'admin' && (
                                <a
                                    href="/admin"
                                    className="group p-4 rounded-xl hover:bg-blue-50 border border-red-200 bg-red-50 transition-all duration-200 font-medium text-gray-700 hover:text-red-600 hover:border-red-300 hover:shadow flex items-center gap-3"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">👑</span>
                                    <span>Panel Administratora</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
                        >
                            Zamknij
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm11.707 5.707a1 1 0 00-1.414-1.414L9 11.586 7.707 10.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"/>
                            </svg>
                            Wyloguj
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SiteChange;