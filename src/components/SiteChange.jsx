import React from 'react';

function SiteChange({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="absolute left-12 top-12 bg-gray-200 p-6 flex flex-col rounded-2xl">
            <a href="/main/leki" key="leki" className="p-2 font-bold">Główny spis leków</a>
            <a href="/zestawienie-lekow" key="zestawienie-lekow" className="p-2 font-bold">Zestawienie leków</a>
            <a href="/minimum-lekow" key="minimum-lekow" className="p-2 font-bold">Spis minimum leków</a>
            <a href="/zestawienie-sprzetu" key="zestawienie-sprzetu" className="p-2 font-bold">Spis minimum sprzętu</a>
            <a href="/main/sprzet" key="sprzet" className="p-2 font-bold">Spis sprzętu</a>
            <a href="/zgrany-sprzet" key="zgrany-sprzet" className="p-2 font-bold">Zgrany spis sprzętu</a>
            <a href="/old" key="old" className="p-2 font-bold">OLD</a>
            <a href="/utulizacja" key="utulizacja" className="p-2 font-bold">Utulizacja</a>
            <button onClick={onClose} className="mt-4 p-2 bg-red-500 text-white rounded-3xl">Zamknij</button>
        </div>
    );
}

export default SiteChange;