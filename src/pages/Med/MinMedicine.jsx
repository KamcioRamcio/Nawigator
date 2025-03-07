import React, { useState, useEffect } from "react";
import apiUrl from "../../constants/api.js";
import SiteChange from "../../components/SiteChange.jsx";
import MinMedicineAdd from "../../components/MinMedicineAdd.jsx";
import ConstantsMedicine from "../../constants/constantsMedicine.js";
import MedicineAdd from "../../components/MedicineAdd.jsx";

function MinMedicine() {
    const [medicines, setMedicines] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const username = localStorage.getItem("username");
    const [editMode, setEditMode] = useState(false);
    const [editedValues, setEditedValues] = useState({});
    const [siteChange, setSiteChange] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [medicineAdd, setMedicineAdd] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        lek_min_nazwa: "",
        lek_min_pakowanie: "",
        lek_min_w_opakowaniu: "",
        id_kategorii: "",
        id_pod_kategorii: "",
        id_pod_pod_kategorii: "",
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const response = await fetch(apiUrl + "leki-min-kategorie");
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
    };

    const handleSiteChangeClose = () => {
        setSiteChange(false);
    };

    const handleAddMedicineOpen = () => {
        setMedicineAdd(true);
    };

    const handleAddMedicineClose = () => {
        setMedicineAdd(false);
    };

    const handleEdit = (medicineId, filed, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [medicineId]: {
                ...prev[medicineId],
                [filed]: value,
            }
        }));
    };


    const handleSave = async (medicineId) => {
        try {
            const editedMedicine = editedValues[medicineId];
            const medicineToUpdate = {
                nazwa_leku: editedMedicine.lek_min_nazwa,
                pakowanie: editedMedicine.lek_min_pakowanie,
                w_opakowaniu: editedMedicine.lek_min_w_opakowaniu,
                id_kategorii: editedMedicine.id_kategorii,
                id_pod_kategorii: editedMedicine.id_pod_kategorii,
                id_pod_pod_kategorii: editedMedicine.id_pod_pod_kategorii
            };

            const response = await fetch(`${apiUrl}leki-min/${medicineId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(medicineToUpdate),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(medicineToUpdate);

            setEditMode((prev) => ({
                ...prev,
                [medicineId]: false,
            }));

            setEditedValues((prev) => ({
                ...prev,
                [medicineId]: null,
            }));

            await fetchMedicines();
        } catch (error) {
            console.error("Błąd podczas aktualizacji leku:", error);
        }
    };


    const handleInputMedicine = (e) => {
        const { name, value } = e.target;
        setNewMedicine((prev) => ({
            ...prev,
            [name]: ["id_kategorii", "id_pod_kategorii", "id_pod_pod_kategorii"].includes(name) ? parseInt(value) : value,
        }));
    };

    const handleAddMedicine = async () => {
        try {
            const response = await fetch(apiUrl + "leki-min", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newMedicine),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Medicine updated", newMedicine);

            setNewMedicine({
                nazwa_leku: "",
                pakowanie: "",
                w_opakowaniu: "",
                id_kategorii: "",
                id_pod_kategorii: "",
                id_pod_pod_kategorii: "",
            });
            setSelectedCategory(null);
            setSelectedSubCategory(null);
        } catch (error) {
            console.error("Błąd podczas dodawania leku:", error);
        }
        fetchMedicines();
        setMedicineAdd(false);
    };

    const handleDeleteMedicine = async (medicineId) => {
        try {
            const response = await fetch(apiUrl + "leki-min/" + medicineId, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Medicine deleted", medicineId);
        } catch (error) {
            console.error("Błąd podczas usuwania leku:", error);
        }
        fetchMedicines();
    };

    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 text-center flex-grow">
                        Spis minimum leków
                    </h1>
                    <button className="absolute left-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleSiteChangeOpen}
                    > Zmiana Arkusza
                    </button>
                    <button className="absolute right-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleAddMedicineOpen}
                    >
                        Dodaj Pozycję
                    </button>
                    <MinMedicineAdd isOpen={medicineAdd} onClose={handleAddMedicineClose}>
                        <h2>ADD MEDICINE</h2>
                        <table>
                            <thead>
                            <tr>
                                <th className="px-12 py-4">Nazwa Leku</th>
                                <th className="px-12 py-4">Pakowanie</th>
                                <th className="px-12 py-4">W opakowaniu</th>
                                <th className="px-12 py-4">Kategoria</th>
                                <th className="px-12 py-4">Pod kategoria</th>
                                <th className="px-12 py-4">Pod pod kategoria</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        name="nazwa_leku"
                                        value={newMedicine.nazwa_leku}
                                        onChange={handleInputMedicine}
                                        placeholder="Nazwa Leku"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="pakowanie"
                                        value={newMedicine.pakowanie}
                                        onChange={handleInputMedicine}
                                        placeholder="Pakowanie"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="w_opakowaniu"
                                        value={newMedicine.w_opakowaniu}
                                        onChange={handleInputMedicine}
                                        placeholder="W opakowaniu"
                                    />
                                </td>
                                <td>
                                    <select
                                        name="id_kategorii"
                                        value={newMedicine.id_kategorii}
                                        onChange={(e) => {
                                            handleInputMedicine(e);
                                            setSelectedCategory(e.target.value);
                                        }}
                                    >
                                        <option value="">Wybierz kategorię</option>
                                        {ConstantsMedicine.CategoryOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        name="id_pod_kategorii"
                                        value={newMedicine.id_pod_kategorii}
                                        onChange={(e) => {
                                            handleInputMedicine(e);
                                            setSelectedSubCategory(e.target.value);
                                        }}
                                    >
                                        <option value="">Wybierz podkategorię</option>
                                        {selectedCategory && ConstantsMedicine.SubCategoryOptions[selectedCategory]?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        name="id_pod_pod_kategorii"
                                        value={newMedicine.id_pod_pod_kategorii}
                                        onChange={handleInputMedicine}
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
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <button className="p-4 bg-green-500 text-white font-bold rounded-lg" onClick={handleAddMedicine}>
                            Dodaj
                        </button>
                    </MinMedicineAdd>
                </div>
                <h2 className="text-center text-xl text-red-800 font-bold pt-4">
                    Stan na dzień: {currentDate.toLocaleDateString()}
                </h2>
                <h3 className="text-center font-semibold p-4 text-lg">
                    Zalogowany jako: {username}
                </h3>
                <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose} />
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide text-left ">
                        <th className="px-2 py-4">Nazwa Leku</th>
                        <th className="px-2 py-4">Pakowanie</th>
                        <th className="px-2 py-4">W opakowaniu</th>
                        <th className="px-2 py-4">Akcje</th>
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
                                                            <tr key={medicine.lek_min_id}
                                                                className={`${medicine.lek_przechowywanie !== "freezer" ? "bg-blue-200" : ""} border border-gray-700`}>
                                                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                value={editedValues[medicine.lek_min_id]?.lek_min_nazwa || ""}
                                                                                onChange={(e) =>
                                                                                    handleEdit(medicine.lek_min_id, "lek_min_nazwa", e.target.value)
                                                                                }
                                                                                className="border px-2 py-1 w-5/6"
                                                                            />
                                                                            <select
                                                                                name="id_kategorii"
                                                                                value={editedValues[medicine.lek_min_id]?.id_kategorii || ""}
                                                                                onChange={(e) => {
                                                                                    handleEdit(medicine.lek_min_id, "id_kategorii", parseInt(e.target.value));
                                                                                    setSelectedCategory(e.target.value);
                                                                                }}
                                                                                className="border px-2 py-1 mt-1 w-5/6"
                                                                            >
                                                                                <option value="">Wybierz kategorię</option>
                                                                                {ConstantsMedicine.CategoryOptions.map(option => (
                                                                                    <option key={option.value} value={option.value}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <select
                                                                                name="id_pod_kategorii"
                                                                                value={editedValues[medicine.lek_min_id]?.id_pod_kategorii || ""}
                                                                                onChange={(e) => {
                                                                                    handleEdit(medicine.lek_min_id, "id_pod_kategorii", parseInt(e.target.value));
                                                                                    setSelectedSubCategory(e.target.value);
                                                                                }}
                                                                                className="border px-2 py-1 mt-1 w-5/6"
                                                                            >
                                                                                <option value="">Wybierz podkategorię</option>
                                                                                {selectedCategory && ConstantsMedicine.SubCategoryOptions[selectedCategory]?.map(option => (
                                                                                    <option key={option.value} value={option.value}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <select
                                                                                name="id_pod_pod_kategorii"
                                                                                value={editedValues[medicine.lek_min_id]?.id_pod_pod_kategorii || ""}
                                                                                onChange={(e) =>
                                                                                    handleEdit(medicine.lek_min_id, "id_pod_pod_kategorii", parseInt(e.target.value))
                                                                                }
                                                                                className="border px-2 py-1 mt-1 w-5/6"
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
                                                                        </>
                                                                    ) : (
                                                                        medicine.lek_min_nazwa
                                                                    )}
                                                                </td>
                                                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <input
                                                                            type="text"
                                                                            value={editedValues[medicine.lek_min_id]?.lek_min_pakowanie || ""}
                                                                            onChange={(e) =>
                                                                                handleEdit(medicine.lek_min_id, "lek_min_pakowanie", e.target.value)
                                                                            }
                                                                            className="border px-2 py-1 w-5/6"
                                                                        />
                                                                    ) : (
                                                                        medicine.lek_min_pakowanie
                                                                    )}
                                                                </td>
                                                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <input
                                                                            type="text"
                                                                            value={editedValues[medicine.lek_min_id]?.lek_min_w_opakowaniu || ""}
                                                                            onChange={(e) =>
                                                                                handleEdit(medicine.lek_min_id, "lek_min_w_opakowaniu", e.target.value)
                                                                            }
                                                                            className="border px-2 py-1 w-5/6"
                                                                        />
                                                                    ) : (
                                                                        medicine.lek_min_w_opakowaniu
                                                                    )}
                                                                </td>
                                                                <td className="border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleSave(medicine.lek_min_id)}
                                                                                className="text-green-600 font-semibold mr-2"
                                                                            >
                                                                                Zapisz
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    setEditMode(prev => ({
                                                                                        ...prev,
                                                                                        [medicine.lek_min_id]: false,
                                                                                    }))
                                                                                }
                                                                                className="text-red-600 font-semibold"
                                                                            >
                                                                                Anuluj
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditMode(prev => ({
                                                                                    ...prev,
                                                                                    [medicine.lek_min_id]: true,
                                                                                }));
                                                                                setEditedValues(prev => ({
                                                                                    ...prev,
                                                                                    [medicine.lek_min_id]: medicine,
                                                                                }));
                                                                            }}
                                                                            className="text-blue-600 font-semibold"
                                                                        >
                                                                            Edytuj
                                                                        </button>

                                                                    )}
                                                                    <button className="px-4 " onClick={() => handleDeleteMedicine(medicine.lek_min_id)}>USUŃ</button>
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