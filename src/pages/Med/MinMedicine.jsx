import React, { useState, useEffect } from "react";
import apiUrl from "../../constants/api.js";
import SiteChange from "../../components/SiteChange.jsx";


function MinMedicine() {
    const [medicines, setMedicines] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const username = localStorage.getItem("username");
    const [siteChange, setSiteChange] = useState(false)


    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const response = await fetch(apiUrl + "leki-kategorie");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMedicines(data);
        } catch (error) {
            console.error("Błąd podczas pobierania leków:", error);
        }
    };

    const indexToLetter = (index) => {
        return String.fromCharCode(97 + index);
    };

    const handleSiteChangeOpen = () => {
        setSiteChange(true);
    }

    const handleSiteChangeClose = () => {
        setSiteChange(false);
    }

    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 text-center flex-grow">
                        Prosta Lista Leków
                    </h1>
                    <button className="absolute left-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleSiteChangeOpen}
                    > Zmiana Arkusza
                    </button>
                </div>
                <h2 className="text-center text-xl text-red-800 font-bold pt-4">
                    Stan na dzień: {currentDate.toLocaleDateString()}
                </h2>
                <h3 className="text-center font-semibold p-4 text-lg">
                    Zalogowany jako: {username}
                </h3>
                <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide">
                            <th className="px-2 py-4">Nazwa Leku</th>
                            <th className="px-2 py-4">Metoda Opakowania</th>
                            <th className="px-2 py-4">Równanie Opakowania</th>
                        </tr>
                    </thead>
                    <tbody className="text-left">
                        {Object.keys(medicines).map((category, categoryIndex) => (
                            <React.Fragment key={category}>
                                <tr className="bg-gray-300 text-xl">
                                    <td colSpan="13" className="font-bold p-4 hover:bg-pink-300">
                                        {categoryIndex + 1}. {category}
                                    </td>
                                </tr>
                                {Object.keys(medicines[category]).map((subcategory, subcategoryIndex) => {
                                    const showSubcategoryName = subcategory !== "null";
                                    return (
                                        <React.Fragment key={subcategory}>
                                            {showSubcategoryName && (
                                                <tr className="bg-gray-200">
                                                    <td colSpan="13" className="p-2 pl-4 font-semibold text-lg">
                                                        {subcategoryIndex + 1}. {subcategory}
                                                    </td>
                                                </tr>
                                            )}
                                            {Object.keys(medicines[category][subcategory]).map((subsubcategory, subsubcategoryIndex) => {
                                                const showSubsubcategoryName = subsubcategory !== "null";
                                                return (
                                                    <React.Fragment key={subsubcategory}>
                                                        {showSubsubcategoryName && (
                                                            <tr className="bg-gray-100">
                                                                <td colSpan="13" className="pl-6 text-lg">
                                                                    {subcategoryIndex + 1}.{indexToLetter(subsubcategoryIndex)}. {subsubcategory}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {medicines[category][subcategory][subsubcategory].map(
                                                            (medicine) => (
                                                                <tr key={medicine.lek_id}>
                                                                    <td className="pl-6 px-2 py-4">
                                                                        {medicine.lek_nazwa}
                                                                    </td>
                                                                    <td className="px-2 py-4">
                                                                        {medicine.lek_opakowanie}
                                                                    </td>
                                                                    <td className="px-2 py-4">
                                                                        {medicine.lek_opakowanie_equation || "Brak równania"}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MinMedicine;