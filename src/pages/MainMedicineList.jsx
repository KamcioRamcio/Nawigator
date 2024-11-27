import React, {useEffect, useState} from "react";
import apiUrl from "./api.js";
import MedicineAdd from "../components/MedicineAdd";
import SiteChange from "../components/SiteChange.jsx";
import ConstantsMedicine from "../constants/constantsMedicine.js";


function MainMedicineList() {
    const [medicines, setMedicines] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [editMode, setEditMode] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const username = localStorage.getItem("username");
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
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        fetchMedicines();
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
        const { name, value } = e.target;
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


    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 text-center flex-grow">
                        Zestawienie Leków MV Nawigator XXI
                    </h1>
                    <button className="absolute right-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleAddMedicineOpen}
                    >Dodaj Pozycję</button>
                    <button className="absolute left-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                        onClick={handleSiteChangeOpen}
                    > Zmiana Arkusza
                    </button>

                    <MedicineAdd isOpen={medicineAdd} onClose={handleAddMedicineClose}>
                        <h2>ADD MEDICINE</h2>
                        <table>
                            <thead>
                            <tr>
                                <th className="px-12 py-4">Nazwa Leku</th>
                                <th className="px-12 py-4">Ilość</th>
                                <th className="px-12 py-4">Opakowanie</th>
                                <th className="px-12 py-4">Data ważności</th>
                                <th className="px-12 py-4">Status leku</th>
                                <th className="px-12 py-6">Ilość minimalna</th>
                                <th className="px-12 py-4">Przechowywanie</th>
                                <th className="px-12 py-4">Kategoria</th>
                                <th className="px-12 py-4">Pod kategoria</th>
                                <th className="px-12 py-4">Pod Pod Kategoria</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        name="lek_nazwa"
                                        value={newMedicine.lek_nazwa}
                                        onChange={handleInputMedicine}
                                        placeholder="Nazwa Leku"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        name="lek_ilosc"
                                        value={newMedicine.lek_ilosc}
                                        onChange={handleInputMedicine}
                                        placeholder="Ilość"
                                    />
                                </td>
                                <td>
                                    <select
                                        name="lek_opakowanie"
                                        value={newMedicine.lek_opakowanie}
                                        onChange={handleInputMedicine}
                                    >
                                        <option value="">Wybierz opakowanie</option>
                                        {ConstantsMedicine.BoxTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        name="lek_data"
                                        value={newMedicine.lek_data}
                                        onChange={handleInputMedicine}
                                    />
                                </td>
                                <td>
                                    <select
                                        name="lek_status"
                                        value={newMedicine.lek_status}
                                        onChange={handleInputMedicine}
                                    >
                                        <option value="">Wybierz status</option>
                                        {ConstantsMedicine.MedicineStatusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        name="lek_ilosc_minimalna"
                                        value={newMedicine.lek_ilosc_minimalna}
                                        onChange={handleInputMedicine}
                                        placeholder="Ilość minimalna"
                                    />
                                </td>
                                <td>
                                    <select
                                        name="lek_przechowywanie"
                                        value={newMedicine.lek_przechowywanie}
                                        onChange={handleInputMedicine}
                                    >
                                        <option value="">Wybierz przechowywanie</option>
                                        {ConstantsMedicine.StoringOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        name="lek_kategoria"
                                        value={newMedicine.lek_kategoria}
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
                                        name="lek_podkategoria"
                                        value={newMedicine.lek_podkategoria}
                                        onChange={(e) => {
                                            handleInputMedicine(e);
                                            setSelectedSubCategory(e.target.value);
                                        }}
                                    >   <option value="">Wybierz podkategorię</option>
                                        {selectedCategory && ConstantsMedicine.SubCategoryOptions[selectedCategory]?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        name="lek_podpodkategoria"
                                        value={newMedicine.lek_podpodkategoria}
                                        onChange={handleInputMedicine}
                                    >   <option value="">Wybierz podpodkategorię</option>
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
                        <button className="p-4 bg-slate-300 rounded-3xl" onClick={handleAddMedicine}>
                            Dodaj
                        </button>
                    </MedicineAdd>
                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose} />
                </div>
                <h2 className="text-center text-xl text-red-800 font-bold pt-4 ">
                    Stan na dzień : {currentDate.toLocaleDateString()}
                </h2>
                <h3 className="text-center font-semibold p-4 text-lg">
                    Zalogowany jako {username}
                </h3>
                <table className="w-full">
                    <thead className="text-ceter">
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide">
                        <th className="px-2 py-4">Nazwa Leku</th>
                        <th className="px-2 py-4">Ilość</th>
                        <th className="px-2 py-4">Opakowanie</th>
                        <th className="px-2 py-4">Data ważności</th>
                        <th className="px-2 py-4">Status leku</th>
                        <th className="px-2 py-6">Ilość minimalna</th>
                        <th className="px-2 py-4">Rozchód</th>
                        <th className="px-2 py-4">Aktualnie na statku</th>
                        <th className="px-2 py-4 ">Status</th>
                        <th className="px-2 py-4 ">Ważny Status</th>
                        <th className="px-2 py-4">Kto Zmienił</th>
                        <th className="px-2 py-4">Akcje</th>
                    </tr>
                    </thead>
                    <tbody className="text-left">
                    {Object.keys(medicines).map((category, categoryIndex) => (
                        <React.Fragment key={category}>
                            <tr className="bg-gray-300 text-xl">
                                <td colSpan="13" className="font-bold p-4 hover:bg-pink-300">{categoryIndex +1}. {category}</td>
                            </tr>
                            {Object.keys(medicines[category]).map((subcategory, subcategoryIndex) => {
                                const showSubcategoryName = subcategory !== "null";
                                return (
                                <React.Fragment key={subcategory}>
                                    {showSubcategoryName && (
                                    <tr className="bg-gray-200">
                                        <td colSpan="13" className="p-2 pl-4 font-semibold text-lg">{subcategoryIndex+1}. {subcategory}</td>
                                    </tr>)}
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
                                                {medicines[category][subcategory][subsubcategory].map(medicine => (
                                                    <tr key={medicine.lek_id}>
                                                        <td className="pl-6 px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <input
                                                                    type="text"
                                                                    value={editedValues[medicine.lek_id]?.lek_nazwa || ""}
                                                                    onChange={(e) =>
                                                                        handleEdit(medicine.lek_id, "lek_nazwa", e.target.value)
                                                                    }
                                                                    className="border px-2 py-1 w-5/6"
                                                                />
                                                            ) : (
                                                                medicine.lek_nazwa
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <input
                                                                    type="number"
                                                                    value={editedValues[medicine.lek_id]?.lek_ilosc || ""}
                                                                    onChange={(e) =>
                                                                        handleEdit(medicine.lek_id, "lek_ilosc", e.target.value)
                                                                    }
                                                                    className="border px-2 py-1 w-5/6"
                                                                />
                                                            ) : (
                                                                medicine.lek_ilosc
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <select
                                                                    value={editedValues[medicine.lek_id]?.lek_opakowanie || ""}
                                                                    onChange={(e) =>
                                                                        handleEdit(medicine.lek_id, "lek_opakowanie", e.target.value)
                                                                    }
                                                                    className="border px-2 py-1 w-5/6"
                                                                >
                                                                    {ConstantsMedicine.BoxTypeOptions.map(option => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                medicine.lek_opakowanie
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">
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
                                                        <td className="px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <select
                                                                    value={editedValues[medicine.lek_id]?.lek_status || ""}
                                                                    onChange={(e) =>
                                                                        handleEdit(medicine.lek_id, "lek_status", e.target.value)
                                                                    }
                                                                    className="border px-2 py-1 w-5/6"
                                                                >
                                                                    {ConstantsMedicine.MedicineStatusOptions.map(option => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                medicine.lek_status
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">
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
                                                        <td className="px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <input
                                                                type = "number"
                                                                value = {editedValues[medicine.lek_id]?.rozchod_ilosc || ""}
                                                                onChange = {(e) =>
                                                                    handleEdit(medicine.lek_id, "rozchod_ilosc", e.target.value)
                                                                }
                                                                className="border px-2 py-1 w-5/6"
                                                                />
                                                            ) : (
                                                                medicine.rozchod_ilosc
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <input
                                                                    type = "number"
                                                                    value = {editedValues[medicine.lek_id]?.stan_magazynowy_ilosc || ""}
                                                                    onChange = {(e) =>
                                                                        handleEdit(medicine.lek_id, "stan_magazynowy", e.target.value)
                                                                    }
                                                                    className="border px-2 py-1 w-5/6"
                                                                />
                                                            ) : (
                                                                medicine.stan_magazynowy_ilosc
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <select
                                                                    value={editedValues[medicine.lek_id]?.stan_magazynowy_status || ""}
                                                                    onChange={(e) =>
                                                                        handleEdit(medicine.lek_id, "stan_magazynowy_status", e.target.value)
                                                                    }
                                                                    className="border px-2 py-1 w-5/6"
                                                                >
                                                                    {ConstantsMedicine.StatusOptions.map(option => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                medicine.stan_magazynowy_status
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">
                                                            {editMode[medicine.lek_id] ? (
                                                                <input
                                                                type = "text"
                                                                value = {editedValues[medicine.lek_id]?.stan_magazynowy_important_status || ""}
                                                                onChange = {(e) =>
                                                                    handleEdit(medicine.lek_id, "stan_magazynowy_important_status", e.target.value)
                                                                }
                                                                className="border px-2 py-1 w-5/6"
                                                                />
                                                            ) : (
                                                                medicine.stan_magazynowy_important_status
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4">{medicine.rozchod_kto_zmienil}</td>
                                                        <td>
                                                            {editMode[medicine.lek_id] ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleSave(medicine.lek_id)}
                                                                        className="text-green-600 font-semibold mr-2"
                                                                    >
                                                                        Zapisz
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setEditMode(prev => ({
                                                                                ...prev,
                                                                                [medicine.lek_id]: false,
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
                                                                            [medicine.lek_id]: true,
                                                                        }));
                                                                        setEditedValues(prev => ({
                                                                            ...prev,
                                                                            [medicine.lek_id]: medicine,
                                                                        }));
                                                                    }}
                                                                    className="text-blue-600 font-semibold"
                                                                >
                                                                    Edytuj
                                                                </button>

                                                            )}
                                                            <button className="px-4 " onClick={() => handleDeleteMedicine(medicine.lek_id)}>USUŃ</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        }
                    )}

                        </React.Fragment>
                    ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
}

export default MainMedicineList