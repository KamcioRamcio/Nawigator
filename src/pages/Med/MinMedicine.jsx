// src/pages/medicine/MinMedicine.jsx
import React, { useEffect, useState } from "react";
import apiUrl from "../../constants/api.js";
import MedicineAdd from "../../components/MedicineAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsMedicine from "../../constants/constantsMedicine.js";

function MinMedicine() {
    const username = localStorage.getItem("username");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [medicines, setMedicines] = useState({});
    const [editMode, setEditMode] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const [medicineAdd, setMedicineAdd] = useState(false);
    const [siteChange, setSiteChange] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [editSelectedCategory, setEditSelectedCategory] = useState({});
    const [editSelectedSubCategory, setEditSelectedSubCategory] = useState({});
    const [newMedicine, setNewMedicine] = useState({
        nazwa_leku: "",
        pakowanie: "",
        w_opakowaniu: "",
        id_kategorii: "",
        id_pod_kategorii: "",
        id_pod_pod_kategorii: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(apiUrl + "leki-min-kategorie");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMedicines(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching medicines:", error);
            setError("Failed to load medicines data");
            setIsLoading(false);
        }
    };

    const handleAddMedicineOpen = () => {
        setMedicineAdd(true);
    };

    const handleAddMedicineClose = () => {
        setMedicineAdd(false);
        // Reset form state
        setNewMedicine({
            nazwa_leku: "",
            pakowanie: "",
            w_opakowaniu: "",
            id_kategorii: "",
            id_pod_kategorii: "",
            id_pod_pod_kategorii: ""
        });
        setSelectedCategory(null);
        setSelectedSubCategory(null);
    };

    const handleSiteChangeOpen = () => {
        setSiteChange(true);
    };

    const handleSiteChangeClose = () => {
        setSiteChange(false);
    };

    const indexToLetter = (index) => {
        return String.fromCharCode(97 + index);
    };

    const handleInputMedicine = (e) => {
        const { name, value } = e.target;
        setNewMedicine(prev => ({
            ...prev,
            [name]: ["id_kategorii", "id_pod_kategorii", "id_pod_pod_kategorii"].includes(name)
                ? (value ? parseInt(value, 10) : "")
                : value
        }));
    };

    const validateForm = () => {
        if (!newMedicine.nazwa_leku) {
            alert("Nazwa leku jest wymagana");
            return false;
        }

        if (!newMedicine.id_kategorii) {
            alert("Kategoria jest wymagana");
            return false;
        }

        return true;
    };

    const handleAddMedicine = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const payload = {
                ...newMedicine,
                // Ensure null is sent instead of empty string for optional foreign keys
                id_pod_kategorii: newMedicine.id_pod_kategorii || null,
                id_pod_pod_kategorii: newMedicine.id_pod_pod_kategorii || null
            };

            const response = await fetch(apiUrl + "leki-min", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }

            await fetchMedicines();
            handleAddMedicineClose();
        } catch (error) {
            console.error("Error adding medicine:", error);
            alert(`Failed to add medicine: ${error.message}`);
        }
    };

    const handleEdit = (medicineId, field, value) => {
        setEditedValues(prev => ({
            ...prev,
            [medicineId]: {
                ...prev[medicineId],
                [field]: ["id_kategorii", "id_pod_kategorii", "id_pod_pod_kategorii"].includes(field)
                    ? (value ? parseInt(value, 10) : null)
                    : value
            }
        }));
    };

    const validateEdit = (medicineId) => {
        const values = editedValues[medicineId];
        if (!values.nazwa_leku) {
            alert("Nazwa leku jest wymagana");
            return false;
        }


        return true;
    };

    const handleSave = async (medicineId) => {
        if (!validateEdit(medicineId)) {
            return;
        }

        try {
            const payload = {
                ...editedValues[medicineId],
                // Ensure null is sent instead of empty string for optional foreign keys
                id_pod_kategorii: editedValues[medicineId].id_pod_kategorii || null,
                id_pod_pod_kategorii: editedValues[medicineId].id_pod_pod_kategorii || null
            };

            const response = await fetch(apiUrl + "leki-min/" + medicineId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }

            setEditMode(prev => ({
                ...prev,
                [medicineId]: false,
            }));

            await fetchMedicines();
        } catch (error) {
            console.error("Error updating medicine:", error);
            alert(`Failed to update medicine: ${error.message}`);
        }
    };

    const handleDelete = async (medicineId) => {
        if (!confirm("Czy na pewno chcesz usunąć tę pozycję? Ta operacja jest nieodwracalna.")) {
            return;
        }

        try {
            const response = await fetch(apiUrl + "leki-min/" + medicineId, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchMedicines();
        } catch (error) {
            console.error("Error deleting medicine:", error);
            alert("Failed to delete medicine");
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 text-center flex-grow">
                        Minimalna Lista Leków MV Nawigator XXI
                    </h1>
                    <button
                        className="absolute right-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                        onClick={handleAddMedicineOpen}
                    >
                        Dodaj Pozycję
                    </button>
                    <button
                        className="absolute left-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                        onClick={handleSiteChangeOpen}
                    >
                        Zmiana Arkusza
                    </button>

                    <MedicineAdd isOpen={medicineAdd} onClose={handleAddMedicineClose}>
                        <h2 className="text-xl font-bold mb-4">Dodaj Lek do Listy Minimalnej</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nazwa Leku*
                                </label>
                                <input
                                    type="text"
                                    name="nazwa_leku"
                                    value={newMedicine.nazwa_leku}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pakowanie
                                </label>
                                <select
                                    name="pakowanie"
                                    value={newMedicine.pakowanie}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                >
                                    <option value="">Wybierz opakowanie</option>
                                    {ConstantsMedicine.BoxTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    W Opakowaniu
                                </label>
                                <input
                                    type="text"
                                    name="w_opakowaniu"
                                    value={newMedicine.w_opakowaniu}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategoria*
                                </label>
                                <select
                                    name="id_kategorii"
                                    value={newMedicine.id_kategorii}
                                    onChange={(e) => {
                                        handleInputMedicine(e);
                                        setSelectedCategory(e.target.value);
                                        // Reset dependent fields
                                        setSelectedSubCategory(null);
                                        setNewMedicine(prev => ({
                                            ...prev,
                                            id_pod_kategorii: "",
                                            id_pod_pod_kategorii: ""
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
                                    name="id_pod_kategorii"
                                    value={newMedicine.id_pod_kategorii}
                                    onChange={(e) => {
                                        handleInputMedicine(e);
                                        setSelectedSubCategory(e.target.value);
                                        // Reset dependent field
                                        setNewMedicine(prev => ({
                                            ...prev,
                                            id_pod_pod_kategorii: ""
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
                                    name="id_pod_pod_kategorii"
                                    value={newMedicine.id_pod_pod_kategorii}
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
                        <div className="mt-6 flex justify-end">
                            <button
                                className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                                onClick={handleAddMedicineClose}
                            >
                                Anuluj
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                onClick={handleAddMedicine}
                            >
                                Dodaj
                            </button>
                        </div>
                    </MedicineAdd>

                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose} />
                </div>
                <div className="">
                    <h2 className="text-center text-xl text-red-800 font-bold pt-4">
                        Stan na dzień : {currentDate.toLocaleDateString()}
                    </h2>
                    <h3 className="text-center font-semibold p-4 text-lg">
                        Zalogowany jako {username}
                    </h3>

                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide text-left">
                            <th className="px-4 py-3 border">Nazwa Leku</th>
                            <th className="px-4 py-3 border">Pakowanie</th>
                            <th className="px-4 py-3 border">W Opakowaniu</th>
                            <th className="px-4 py-3 border">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="text-left">
                        {Object.keys(medicines).map((category, categoryIndex) => (
                            <React.Fragment key={category}>
                                <tr className="bg-gray-300 text-xl">
                                    <td colSpan="4" className="font-bold p-4 hover:bg-pink-300">
                                        {categoryIndex + 1}. {category}
                                    </td>
                                </tr>
                                {Object.keys(medicines[category]).map((subcategory, subcategoryIndex) => {
                                    const showSubcategoryName = subcategory !== "null";
                                    return (
                                        <React.Fragment key={subcategory}>
                                            {showSubcategoryName && (
                                                <tr className="bg-gray-200">
                                                    <td colSpan="4" className="p-2 pl-8 font-semibold text-lg">
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
                                                                <td colSpan="4" className="pl-12 text-lg">
                                                                    {subcategoryIndex + 1}.{indexToLetter(subsubcategoryIndex)}. {subsubcategory}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {medicines[category][subcategory][subsubcategory].map(medicine => (
                                                            <tr key={medicine.lek_min_id} className="border border-gray-700">
                                                                <td className="pl-16 px-4 py-3 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                value={editedValues[medicine.lek_min_id]?.nazwa_leku || ""}
                                                                                onChange={(e) => handleEdit(medicine.lek_min_id, "nazwa_leku", e.target.value)}
                                                                                className="border px-2 py-1 w-full mb-2"
                                                                                required
                                                                            />
                                                                            <select
                                                                                value={editedValues[medicine.lek_min_id]?.id_kategorii || ""}
                                                                                onChange={(e) => {
                                                                                    handleEdit(medicine.lek_min_id, "id_kategorii", e.target.value);
                                                                                    setEditSelectedCategory({
                                                                                        ...editSelectedCategory,
                                                                                        [medicine.lek_min_id]: e.target.value
                                                                                    });
                                                                                    // Reset dependent fields when category changes
                                                                                    setEditSelectedSubCategory({
                                                                                        ...editSelectedSubCategory,
                                                                                        [medicine.lek_min_id]: null
                                                                                    });
                                                                                    handleEdit(medicine.lek_min_id, "id_pod_kategorii", null);
                                                                                    handleEdit(medicine.lek_min_id, "id_pod_pod_kategorii", null);
                                                                                }}
                                                                                className="border px-2 py-1 w-full mb-2"
                                                                            >
                                                                                <option value="">Wybierz kategorię</option>
                                                                                {ConstantsMedicine.CategoryOptions.map(option => (
                                                                                    <option key={option.value} value={option.value}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <select
                                                                                value={editedValues[medicine.lek_min_id]?.id_pod_kategorii || ""}
                                                                                onChange={(e) => {
                                                                                    handleEdit(medicine.lek_min_id, "id_pod_kategorii", e.target.value);
                                                                                    setEditSelectedSubCategory({
                                                                                        ...editSelectedSubCategory,
                                                                                        [medicine.lek_min_id]: e.target.value
                                                                                    });
                                                                                    // Reset sub-subcategory when subcategory changes
                                                                                    handleEdit(medicine.lek_min_id, "id_pod_pod_kategorii", null);
                                                                                }}
                                                                                className="border px-2 py-1 w-full mb-2"
                                                                                disabled={!editedValues[medicine.lek_min_id]?.id_kategorii}
                                                                            >
                                                                                <option value="">Wybierz podkategorię</option>
                                                                                {editedValues[medicine.lek_min_id]?.id_kategorii &&
                                                                                    ConstantsMedicine.SubCategoryOptions[editedValues[medicine.lek_min_id]?.id_kategorii]?.map(option => (
                                                                                        <option key={option.value} value={option.value}>
                                                                                            {option.label}
                                                                                        </option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                            <select
                                                                                value={editedValues[medicine.lek_min_id]?.id_pod_pod_kategorii || ""}
                                                                                onChange={(e) => handleEdit(medicine.lek_min_id, "id_pod_pod_kategorii", e.target.value)}
                                                                                className="border px-2 py-1 w-full"
                                                                                disabled={!editedValues[medicine.lek_min_id]?.id_pod_kategorii}
                                                                            >
                                                                                <option value="">Wybierz podpodkategorię</option>
                                                                                {editedValues[medicine.lek_min_id]?.id_kategorii &&
                                                                                    editedValues[medicine.lek_min_id]?.id_pod_kategorii &&
                                                                                    Array.isArray(ConstantsMedicine.SubSubCategoryOptions[editedValues[medicine.lek_min_id]?.id_kategorii]?.[editedValues[medicine.lek_min_id]?.id_pod_kategorii]) &&
                                                                                    ConstantsMedicine.SubSubCategoryOptions[editedValues[medicine.lek_min_id]?.id_kategorii][editedValues[medicine.lek_min_id]?.id_pod_kategorii].map(option => (
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
                                                                <td className="px-4 py-3 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <select
                                                                            value={editedValues[medicine.lek_min_id]?.pakowanie || ""}
                                                                            onChange={(e) => handleEdit(medicine.lek_min_id, "pakowanie", e.target.value)}
                                                                            className="border px-2 py-1 w-full"
                                                                        >
                                                                            <option value="">Wybierz opakowanie</option>
                                                                            {ConstantsMedicine.BoxTypeOptions.map(option => (
                                                                                <option key={option.value} value={option.value}>
                                                                                    {option.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        medicine.lek_min_pakowanie
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 border-r border-l border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <input
                                                                            type="text"
                                                                            value={editedValues[medicine.lek_min_id]?.w_opakowaniu || ""}
                                                                            onChange={(e) => handleEdit(medicine.lek_min_id, "w_opakowaniu", e.target.value)}
                                                                            className="border px-2 py-1 w-full"
                                                                        />
                                                                    ) : (
                                                                        medicine.lek_min_w_opakowaniu
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 border border-gray-700">
                                                                    {editMode[medicine.lek_min_id] ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleSave(medicine.lek_min_id)}
                                                                                className="text-green-600 font-semibold mr-2"
                                                                            >
                                                                                Zapisz
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditMode(prev => ({
                                                                                    ...prev,
                                                                                    [medicine.lek_min_id]: false,
                                                                                }))}
                                                                                className="text-gray-950 m-2 font-semibold"
                                                                            >
                                                                                Anuluj
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(medicine.lek_min_id)}
                                                                                className="text-red-600 font-semibold m-2"
                                                                            >
                                                                                Usuń
                                                                            </button>
                                                                        </>

                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditMode(prev => ({
                                                                                        ...prev,
                                                                                        [medicine.lek_min_id]: true,
                                                                                    }));
                                                                                    // Initialize with current values including category IDs
                                                                                    setEditedValues(prev => ({
                                                                                        ...prev,
                                                                                        [medicine.lek_min_id]: {
                                                                                            nazwa_leku: medicine.lek_min_nazwa,
                                                                                            pakowanie: medicine.lek_min_pakowanie,
                                                                                            w_opakowaniu: medicine.lek_min_w_opakowaniu,
                                                                                            id_kategorii: medicine.id_kategorii,
                                                                                            id_pod_kategorii: medicine.id_pod_kategorii,
                                                                                            id_pod_pod_kategorii: medicine.id_pod_pod_kategorii
                                                                                        }
                                                                                    }));
                                                                                    // Set edit category state to correctly initialize dropdowns
                                                                                    setEditSelectedCategory({
                                                                                        ...editSelectedCategory,
                                                                                        [medicine.lek_min_id]: medicine.id_kategorii
                                                                                    });
                                                                                    setEditSelectedSubCategory({
                                                                                        ...editSelectedSubCategory,
                                                                                        [medicine.lek_min_id]: medicine.id_pod_kategorii
                                                                                    });
                                                                                }}
                                                                                className="text-blue-600 font-semibold mr-2"
                                                                            >
                                                                                Edytuj
                                                                            </button>

                                                                        </>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
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
        </div>
    );
}

export default MinMedicine;
