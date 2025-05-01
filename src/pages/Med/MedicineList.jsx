import React, {useEffect, useState} from "react";
import apiUrl from "../../constants/api.js";
import ConstantsMedicine from "../../constants/constantsMedicine.js";
import MedicineAdd from "../../components/MedicineAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import {showEditButtonNoMain, showAddButton, showPredictedStatusButton} from "../../constants/permisions.js";


function MedicineList() {
    const [medicines, setMedicines] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [editMode, setEditMode] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user.position;
    const [medicineAdd, setMedicineAdd] = useState(false);
    const [siteChange, setSiteChange] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [newMedicine, setNewMedicine] = useState({
        lek_nazwa: "",
        lek_ilosc: "",
        lek_opakowanie: "",
        lek_data: "",
        lek_status: "",
        lek_ilosc_minimalna: "",
        lek_przechowywanie: "",
        lek_kategoria: "",
        lek_podkategoria: "",
        lek_podpodkategoria: "",
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    // Add these helper functions before the return statement
    const categoryHasMatches = (categoryItems) => {
        return Object.keys(categoryItems).some(subcategory =>
            Object.keys(categoryItems[subcategory]).some(subsubcategory =>
                categoryItems[subcategory][subsubcategory].some(medicine => matchesSearch(medicine))
            )
        );
    };

    const subcategoryHasMatches = (subcategoryItems) => {
        return Object.keys(subcategoryItems).some(subsubcategory =>
            subcategoryItems[subsubcategory].some(medicine => matchesSearch(medicine))
        );
    };

    const subsubcategoryHasMatches = (subsubcategoryItems) => {
        return subsubcategoryItems.some(medicine => matchesSearch(medicine));
    };


    const fetchMedicines = async () => {
        try {
            const response = await fetch(apiUrl + "leki-kategorie");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMedicines(data);
            console.log("Medicines fetched:", data);
        } catch (error) {
            console.error("Error fetching medicines:", error);
        }
    }


    const handleAddMedicineOpen = () => {
        setMedicineAdd(true);
    }

    const handleAddMedicineClose = () => {
        setMedicineAdd(false);
    }

    const handleSiteChangeOpen = () => {
        setSiteChange(true);
    }

    const handleSiteChangeClose = () => {
        setSiteChange(false);
    }

    const indexToLetter = (index) => {
        return String.fromCharCode(97 + index);
    }

    const handleEdit = (medicineId, field, value) => {

        setEditedValues(prev => ({
            ...prev,
            [medicineId]: {
                ...prev[medicineId],
                [field]: value,
                rozchod_kto_zmienil: username,
            },

        }));
    };

    const handleSave = async (medicineId) => {
        try {
            const response = await fetch(apiUrl + "leki/" + medicineId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedValues[medicineId]),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setEditMode(prev => ({
                ...prev,
                [medicineId]: false,
            }));
            console.log("Medicine updated:", editedValues[medicineId]);
        } catch (error) {
            console.error("Error updating medicine:", error);
        }

        fetchMedicines();
    }


    const handleInputMedicine = (e) => {
        const {name, value} = e.target;
        setNewMedicine((prev) => ({
            ...prev,
            [name]: ["lek_kategoria", "lek_podkategoria", "lek_podpodkategoria"].includes(name) ? parseInt(value, 10) : value
        }));
    };

    const handleAddMedicine = async () => {
        try {
            const response = await fetch(apiUrl + "leki-all", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newMedicine),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Medicine added:", newMedicine);
        } catch (error) {
            console.error("Error adding medicine:", error);
        }
        fetchMedicines();
        setMedicineAdd(false);
    }

    const handleDeleteMedicine = async (medicineId) => {
        if (!confirm("Czy na pewno chcesz usunąć tę pozycję? Ta operacja jest nieodwracalna.")) {
            return;
        }
        try {
            const response = await fetch(apiUrl + "leki/delete/" + medicineId, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Medicine deleted:", medicineId);
        } catch (error) {
            console.error("Error deleting medicine:", error);
        }
        fetchMedicines();
    }

    const [searchQuery, setSearchQuery] = useState("");

    const matchesSearch = (medicine) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            medicine.lek_nazwa?.toLowerCase().includes(query)
        );
    }


    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg ">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200 sticky top-0 z-30">
                    <button className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 ml-8 z-10"
                            onClick={handleSiteChangeOpen}>
                        Zmiana Arkusza
                    </button>

                    <h1 className="text-2xl font-bold text-gray-800 p-2 text-center mx-auto absolute left-0 right-0">
                        Zestawienie Leków
                    </h1>

                    <div className="flex items-center">
                        <div className="flex flex-col items-end mr-6 text-sm">
                            <p className="text-red-800 font-semibold">
                                Stan na dzień: {currentDate.toLocaleDateString()}
                            </p>
                            <p className="font-medium">
                                Zalogowany jako {username}
                            </p>
                        </div>

                        {showAddButton(userPosition) && (
                            <button className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 mr-10 z-10"
                                    onClick={handleAddMedicineOpen}>
                                Dodaj Pozycję
                            </button>
                        )}
                    </div>

                    <MedicineAdd isOpen={medicineAdd} onClose={handleAddMedicineClose}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nazwa Leku*
                                </label>
                                <input
                                    type="text"
                                    name="lek_nazwa"
                                    value={newMedicine.lek_nazwa}
                                    onChange={handleInputMedicine}
                                    placeholder="Nazwa Leku"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ilość
                                </label>
                                <input
                                    type="number"
                                    name="lek_ilosc"
                                    value={newMedicine.lek_ilosc}
                                    onChange={handleInputMedicine}
                                    placeholder="Ilość"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data ważności
                                </label>
                                <input
                                    type="date"
                                    name="lek_data"
                                    value={newMedicine.lek_data}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ilość minimalna
                                </label>
                                <input
                                    type="number"
                                    name="lek_ilosc_minimalna"
                                    value={newMedicine.lek_ilosc_minimalna}
                                    onChange={handleInputMedicine}
                                    placeholder="Ilość minimalna"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Przechowywanie
                                </label>
                                <select
                                    name="lek_przechowywanie"
                                    value={newMedicine.lek_przechowywanie}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                >
                                    <option value="">Wybierz przechowywanie</option>
                                    {ConstantsMedicine.StoringOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="lek_status"
                                    value={newMedicine.lek_status}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                >
                                    <option value="">Wybierz status</option>
                                    {ConstantsMedicine.MedicineStatusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategoria*
                                </label>
                                <select
                                    name="lek_kategoria"
                                    value={newMedicine.lek_kategoria}
                                    onChange={(e) => {
                                        handleInputMedicine(e);
                                        setSelectedCategory(e.target.value);
                                        // Reset dependent fields
                                        setSelectedSubCategory(null);
                                        setNewMedicine(prev => ({
                                            ...prev,
                                            lek_podkategoria: "",
                                            lek_podpodkategoria: ""
                                        }));
                                    }}
                                    className="border rounded-md p-2 w-full"
                                    required
                                >
                                    <option value="">Wybierz kategorię</option>
                                    {ConstantsMedicine.CategoryOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Podkategoria
                                </label>
                                <select
                                    name="lek_podkategoria"
                                    value={newMedicine.lek_podkategoria}
                                    onChange={(e) => {
                                        handleInputMedicine(e);
                                        setSelectedSubCategory(e.target.value);
                                        // Reset dependent field
                                        setNewMedicine(prev => ({
                                            ...prev,
                                            lek_podpodkategoria: ""
                                        }));
                                    }}
                                    className="border rounded-md p-2 w-full"
                                    disabled={!selectedCategory}
                                >
                                    <option value="">Wybierz podkategorię</option>
                                    {selectedCategory &&
                                        ConstantsMedicine.SubCategoryOptions[selectedCategory]?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Podpodkategoria
                                </label>
                                <select
                                    name="lek_podpodkategoria"
                                    value={newMedicine.lek_podpodkategoria}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                    disabled={!selectedSubCategory}
                                >
                                    <option value="">Wybierz podpodkategorię</option>
                                    {Array.isArray(ConstantsMedicine.SubSubCategoryOptions[selectedCategory]?.[selectedSubCategory]) &&
                                        ConstantsMedicine.SubSubCategoryOptions[selectedCategory][selectedSubCategory].map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <button className="p-4 bg-slate-300 rounded-3xl" onClick={handleAddMedicine}>
                            Dodaj
                        </button>
                    </MedicineAdd>
                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
                </div>
                <div className="sticky top-[100px] bg-white z-20 p-1">
                    <div className="flex justify-center items-center w-1/2 mx-auto my-4 relative">
                        <div className="absolute left-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Szukaj leków..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <table className="w-full">
                    <thead className="text-left sticky top-[180px] z-10">
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide">
                        <th className="px-2 py-4">Nazwa Leku</th>
                        <th className="px-2 py-4">Aktualnie na statku</th>
                        <th className="px-2 py-6">Ilość minimalna</th>
                        <th className="px-2 py-4">Data ważności</th>
                        <th className="px-2 py-4 ">Status</th>
                        <th className="px-2 py-4">Kto Zmienił</th>
                        <th className="px-2 py-4 w-20">Akcje</th>
                    </tr>
                    </thead>
                    <tbody className="text-left">
                    {Object.keys(medicines).map((category, categoryIndex) => {
                        const categoryItems = medicines[category];
                        const hasCategoryMatches = searchQuery === "" || categoryHasMatches(categoryItems);

                        return hasCategoryMatches ? (
                            <React.Fragment key={category}>
                                <tr className="bg-gray-300 text-xl">
                                    <td colSpan="13" className="font-bold p-4 bg-slate-500">{categoryIndex + 1}. {category}</td>
                                </tr>
                                {Object.keys(categoryItems).map((subcategory, subcategoryIndex) => {
                                    const showSubcategoryName = subcategory !== "null";
                                    const subcategoryItems = categoryItems[subcategory];
                                    const hasSubcategoryMatches = searchQuery === "" || subcategoryHasMatches(subcategoryItems);

                                    return hasSubcategoryMatches ? (
                                        <React.Fragment key={subcategory}>
                                            {showSubcategoryName && (
                                                <tr className="bg-gray-200">
                                                    <td colSpan="13" className="p-2 pl-4 bg-slate-400 font-semibold text-lg">{subcategoryIndex + 1}. {subcategory}</td>
                                                </tr>
                                            )}
                                            {Object.keys(subcategoryItems).map((subsubcategory, subsubcategoryIndex) => {
                                                const showSubsubcategoryName = subsubcategory !== "null";
                                                const subsubcategoryItems = subcategoryItems[subsubcategory];
                                                const hasSubsubcategoryMatches = searchQuery === "" || subsubcategoryHasMatches(subsubcategoryItems);

                                                return hasSubsubcategoryMatches ? (
                                                    <React.Fragment key={subsubcategory}>
                                                        {showSubsubcategoryName && (
                                                            <tr className="bg-gray-100">
                                                                <td colSpan="13" className="pl-6 text-lg bg-slate-300">
                                                                    {subcategoryIndex + 1}.{indexToLetter(subsubcategoryIndex)}. {subsubcategory}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {subsubcategoryItems
                                                            .filter(matchesSearch)
                                                            .map(medicine => (
                                                            <tr key={medicine.lek_id}
                                                                className={`${medicine.lek_przechowywanie === "freezer" ? "bg-blue-200" : ""} border border-gray-700`}>
                                                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_id] ? (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                value={editedValues[medicine.lek_id]?.lek_nazwa || ""}
                                                                                onChange={(e) =>
                                                                                    handleEdit(medicine.lek_id, "lek_nazwa", e.target.value)
                                                                                }
                                                                                className="border px-2 py-1 w-5/6"
                                                                            />
                                                                            <select
                                                                                name="id_kategorii"
                                                                                value={editedValues[medicine.lek_id]?.id_kategorii || ""}
                                                                                onChange={(e) => {
                                                                                    handleEdit(medicine.lek_id, "id_kategorii", parseInt(e.target.value));
                                                                                    setSelectedCategory(e.target.value);
                                                                                }}
                                                                                className="border px-2 py-1 mt-1 w-5/6"
                                                                            >
                                                                                <option value="">Wybierz kategorię</option>
                                                                                {ConstantsMedicine.CategoryOptions.map(option => (
                                                                                    <option key={option.value}
                                                                                            value={option.value}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <select
                                                                                name="id_pod_kategorii"
                                                                                value={editedValues[medicine.lek_id]?.id_pod_kategorii || ""}
                                                                                onChange={(e) => {
                                                                                    handleEdit(medicine.lek_id, "id_pod_kategorii", parseInt(e.target.value));
                                                                                    setSelectedSubCategory(e.target.value);
                                                                                }}
                                                                                className="border px-2 py-1 mt-1 w-5/6"
                                                                            >
                                                                                <option value="">Wybierz podkategorię
                                                                                </option>
                                                                                {selectedCategory && ConstantsMedicine.SubCategoryOptions[selectedCategory]?.map(option => (
                                                                                    <option key={option.value}
                                                                                            value={option.value}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <select
                                                                                name="id_pod_pod_kategorii"
                                                                                value={editedValues[medicine.lek_id]?.id_pod_pod_kategorii || ""}
                                                                                onChange={(e) =>
                                                                                    handleEdit(medicine.lek_id, "id_pod_pod_kategorii", parseInt(e.target.value))
                                                                                }
                                                                                className="border px-2 py-1 mt-1 w-5/6"
                                                                            >
                                                                                <option value="">Wybierz podpodkategorię
                                                                                </option>
                                                                                {Array.isArray(ConstantsMedicine.SubSubCategoryOptions[selectedCategory]?.[selectedSubCategory]) &&
                                                                                    ConstantsMedicine.SubSubCategoryOptions[selectedCategory][selectedSubCategory].map(option => (
                                                                                        <option key={option.value}
                                                                                                value={option.value}>
                                                                                            {option.label}
                                                                                        </option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                        </>
                                                                    ) : (
                                                                        medicine.lek_nazwa
                                                                    )}
                                                                </td>

                                                                <td className="px-2 py-4 border-r border-l border-gray-700">
                                                                    {medicine.stan_magazynowy_ilosc}
                                                                </td>
                                                                <td className="px-2 py-4 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_id] ? (
                                                                        <input
                                                                            type="number"
                                                                            value={editedValues[medicine.lek_id]?.lek_ilosc_minimalna || ""}
                                                                            onChange={(e) =>
                                                                                handleEdit(medicine.lek_id, "lek_ilosc_minimalna", e.target.value)
                                                                            }
                                                                            className="border px-2 py-1 w-5/6"
                                                                        />
                                                                    ) : (
                                                                        medicine.lek_ilosc_minimalna
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-4 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_id] ? (
                                                                        <input
                                                                            type="date"
                                                                            value={editedValues[medicine.lek_id]?.lek_data || ""}
                                                                            onChange={(e) =>
                                                                                handleEdit(medicine.lek_id, "lek_data", e.target.value)
                                                                            }
                                                                            className="border px-2 py-1 w-5/6"
                                                                        />
                                                                    ) : (
                                                                        medicine.lek_data
                                                                    )}
                                                                </td>
                                                                <td className={`${medicine.lek_status !== "Ważny" ? "font-bold text-red-700" : ""} px-2 py-4 border-r border-l border-gray-700`}>
                                                                    {medicine.lek_status}
                                                                </td>
                                                                <td className="px-2 py-4border-r border-l border-gray-700">
                                                                    {medicine.rozchod_kto_zmienil}</td>
                                                                <td className="px-2 py-4 border-r border-l border-gray-700 w-20">
                                                                    {editMode[medicine.lek_id] ? (
                                                                        <div className="flex flex-col space-y-2">
                                                                            <button
                                                                                onClick={() => handleSave(medicine.lek_id)}
                                                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded"
                                                                            >
                                                                                Zapisz
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditMode(prev => ({
                                                                                    ...prev,
                                                                                    [medicine.lek_id]: false,
                                                                                }))}
                                                                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded"
                                                                            >
                                                                                Anuluj
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteMedicine(medicine.lek_id)}
                                                                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
                                                                            >
                                                                                Usuń
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col space-y-2">
                                                                            {showEditButtonNoMain(userPosition) && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditMode(prev => ({
                                                                                            ...prev,
                                                                                            [medicine.lek_id]: true,
                                                                                        }));
                                                                                        setEditedValues(prev => ({
                                                                                            ...prev,
                                                                                            [medicine.lek_id]: medicine,
                                                                                        }));
                                                                                    }}
                                                                                    className="bg-slate-900 hover:bg-slate-700 text-white font-semibold py-1 px-3 rounded"
                                                                                >
                                                                                    Edytuj
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            ))}
                                                    </React.Fragment>
                                                ) : null;
                                            })}
                                        </React.Fragment>
                                    ) : null;
                                })}
                            </React.Fragment>
                        ) : null;
                    })}
                    </tbody>

                </table>
            </div>
        </div>
    );
}

export default MedicineList;