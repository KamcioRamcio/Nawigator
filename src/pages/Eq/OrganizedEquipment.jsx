import React, {useEffect, useState} from "react";
import apiUrl from "../../constants/api.js";
import EquipmentAdd from "../../components/EquipmentAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsEquipment from "../../constants/constantsEquipment.js";
import {showEditButtonNoMain, showAddButton} from "../../constants/permisions.js";
import toastService from '../../utils/toast.js';

function OrganizedEquipment() {
    const [equipments, setEquipments] = useState([]);
    // Change from individual edit mode to global edit mode
    const [globalEditMode, setGlobalEditMode] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState({});
    // Track whether there are unsaved changes
    const [hasChanges, setHasChanges] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user.position || "viewer";
    const [siteChange, setSiteChange] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [selectedSubCategory, setSelectedSubCategory] = useState(0);
    const [addEquipment, setAddEquipment] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        nazwa_sprzetu: "", data_waznosci: "", ilosc: "", na_statku: true, id_kategorii: "", id_pod_kategorii: "",
    });

    useEffect(() => {
        fetchEquipment();
        setCurrentDate(new Date().toISOString().slice(0, 10));
    }, []);

    const categoryHasMatches = (categoryItems) => {
        return Object.values(categoryItems).some(subcategory =>
            subcategory.some(equipment => matchesSearch(equipment))
        );
    };

    const subcategoryHasMatches = (subcategoryItems) => {
        return subcategoryItems.some(equipment => matchesSearch(equipment));
    };

    const fetchEquipment = async () => {
        try {
            const response = await fetch(apiUrl + "sprzet-zgrany-kategorie");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEquipments(data);
            console.log('Equipment fetched', data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // Modified handle edit to work with global edit mode
    const handleEdit = (equipmentId, field, value) => {
        setEditedEquipment(prev => ({
            ...prev,
            [equipmentId]: {
                ...prev[equipmentId],
                [field]: value,
                sprzet_zgrany_kto_zmienil: username
            }
        }));

        // Set hasChanges flag to true
        setHasChanges(true);
    }

    // New function to handle global edit mode
    const handleGlobalEditToggle = () => {
        if (userPosition === "viewer") {
            return;
        }

        if (globalEditMode) {
            // If exiting edit mode with changes, ask for confirmation
            if (hasChanges) {
                if (!confirm("Masz niezapisane zmiany. Czy na pewno chcesz wyjść z trybu edycji?")) {
                    return;
                }
            }
            // Exiting edit mode
            setGlobalEditMode(false);
            setEditedEquipment({});
            setHasChanges(false);
        } else {
            // Entering edit mode - initialize editedEquipment
            const initialValues = {};

            // Loop through all equipment to initialize edit values
            Object.keys(equipments).forEach(category => {
                const categoryItems = equipments[category];
                Object.keys(categoryItems).forEach(subcategory => {
                    const subcategoryItems = categoryItems[subcategory];
                    subcategoryItems.forEach(equipment => {
                        initialValues[equipment.sprzet_zgrany_id] = {
                            ...equipment
                        };
                    });
                });
            });

            setEditedEquipment(initialValues);
            setGlobalEditMode(true);
        }
    };

    // New function to save all changes at once
    const handleSaveAll = async () => {
        // Get all equipment IDs that have been edited
        const equipmentIds = Object.keys(editedEquipment);
        if (equipmentIds.length === 0) {
            toastService.info('Brak zmian do zapisania');
            return;
        }

        const savePromises = equipmentIds.map(async (equipmentId) => {
            try {
                // Convert equipmentId to string to ensure consistent comparison
                const stringEquipmentId = String(equipmentId);

                // Find the original equipment in the nested structure
                let originalEquipment = null;
                for (const category in equipments) {
                    for (const subcategory in equipments[category]) {
                        const found = equipments[category][subcategory].find(
                            item => String(item.sprzet_zgrany_id) === stringEquipmentId
                        );
                        if (found) {
                            originalEquipment = found;
                            break;
                        }
                    }
                    if (originalEquipment) break;
                }

                // If equipment not found, handle gracefully
                if (!originalEquipment) {
                    console.error(`Equipment with ID ${equipmentId} not found in data`);
                    return { success: false, id: equipmentId, error: "Equipment not found in data structure" };
                }

                // Prepare the data to send
                const dataToSend = {
                    nazwa_sprzetu: editedEquipment[equipmentId].sprzet_zgrany_nazwa,
                    data_waznosci: editedEquipment[equipmentId].sprzet_zgrany_data_waznosci,
                    ilosc: editedEquipment[equipmentId].sprzet_zgrany_ilosc,
                    na_statku: editedEquipment[equipmentId].sprzet_zgrany_na_statku,
                    kto_zmienil: editedEquipment[equipmentId].sprzet_zgrany_kto_zmienil || username,
                    id_kategorii: editedEquipment[equipmentId].id_kategorii !== undefined ?
                        editedEquipment[equipmentId].id_kategorii : originalEquipment?.id_kategorii,
                    id_pod_kategorii: editedEquipment[equipmentId].id_pod_kategorii !== undefined ?
                        editedEquipment[equipmentId].id_pod_kategorii : originalEquipment?.id_pod_kategorii,
                };

                // Make the API call
                const response = await fetch(apiUrl + "sprzet-zgrany/" + equipmentId, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return { success: true, id: equipmentId };
            } catch (error) {
                console.error(`Error updating equipment ${equipmentId}:`, error);
                return { success: false, id: equipmentId, error: error.message };
            }
        });

        // Wait for all save operations to complete
        const results = await Promise.all(savePromises);

        // Count successes and failures
        const successes = results.filter(r => r.success).length;
        const failures = results.filter(r => !r.success).length;

        if (failures === 0) {
            toastService.success(`Zapisano wszystkie zmiany (${successes} pozycji)`);
            setGlobalEditMode(false);
            setEditedEquipment({});
            setHasChanges(false);
        } else if (successes === 0) {
            toastService.error(`Błąd podczas zapisywania zmian. Żadna pozycja nie została zaktualizowana.`);
        } else {
            toastService.warning(`Zapisano częściowo: ${successes} pozycji, ${failures} błędów`);
        }

        fetchEquipment();
    };

    const handleSave = async (equipmentId) => {
        try {
            let originalEquipment = null;

            for (const category in equipments) {
                for (const subcategory in equipments[category]) {
                    const found = equipments[category][subcategory].find(item => item.sprzet_zgrany_id === equipmentId);
                    if (found) {
                        originalEquipment = found;
                        break;
                    }
                }
                if (originalEquipment) break;
            }

            const dataToSend = {
                nazwa_sprzetu: editedEquipment[equipmentId].sprzet_zgrany_nazwa,
                data_waznosci: editedEquipment[equipmentId].sprzet_zgrany_data_waznosci,
                ilosc: editedEquipment[equipmentId].sprzet_zgrany_ilosc,
                na_statku: editedEquipment[equipmentId].sprzet_zgrany_na_statku,
                kto_zmienil: editedEquipment[equipmentId].sprzet_zgrany_kto_zmienil || username,
                id_kategorii: editedEquipment[equipmentId].id_kategorii !== undefined ? editedEquipment[equipmentId].id_kategorii : originalEquipment?.id_kategorii,
                id_pod_kategorii: editedEquipment[equipmentId].id_pod_kategorii !== undefined ? editedEquipment[equipmentId].id_pod_kategorii : originalEquipment?.id_pod_kategorii,
            };

            const response = await fetch(apiUrl + "sprzet-zgrany/" + equipmentId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toastService.success('Sprzęt został zaktualizowany pomyślnie');
        } catch (error) {
            console.error('Fetch error:', error);
            toastService.error(`Błąd podczas aktualizacji sprzętu: ${error.message}`);
        }
        fetchEquipment();
    }


    const handleDelete = async (equipmentId) => {
        if (!confirm("Czy na pewno chcesz usunąć tę pozycję? Ta operacja jest nieodwracalna.")) {
            return;
        }
        try {
            const response = await fetch(apiUrl + "sprzet-zgrany/delete/" + equipmentId, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toastService.info('Sprzęt został usunięty');
        } catch (error) {
            console.log("Error deleting equipment:", error);
            toastService.error(`Błąd podczas usuwania sprzętu: ${error.message}`);
        }
        fetchEquipment()
    }

    const handleSiteChangeOpen = () => {
        setSiteChange(true)
    }

    const handleSiteChangeClose = () => {
        setSiteChange(false)
    }

    const handleAddEquipmentOpen = () => {
        setAddEquipment(true)
    }

    const handleAddEquipmentClose = () => {
        setAddEquipment(false)
    }

    const handleInputEquipment = (e) => {
        const {name, value} = e.target;
        setNewEquipment(prev => ({
            ...prev, [name]: ["id_kategorii", "id_pod_kategorii"].includes(name) ? parseInt(value, 10) : value
        }))
    }

    const handleAddEquipment = async () => {
        try {
            const response = await fetch(apiUrl + "/sprzet-zgrany-all", {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify(newEquipment)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toastService.success(`Sprzęt "${newEquipment.nazwa_sprzetu}" został dodany pomyślnie`);
            setNewEquipment({
                nazwa_sprzetu: "",
                data_waznosci: "",
                ilosc: "",
                na_statku: true,
                id_kategorii: "",
                id_pod_kategorii: "",
            });
            fetchEquipment();
            setAddEquipment(false);
        } catch (error) {
            console.error('Fetch error:', error);
            toastService.error(`Błąd podczas dodawania sprzętu: ${error.message}`);
        }
    }

    const [searchQuery, setSearchQuery] = useState("");
    const matchesSearch = (equipment) => {
        const searchLower = searchQuery.toLowerCase();
        return equipment.sprzet_zgrany_nazwa.toLowerCase().includes(searchLower)
    }

    return (<div className="bg-gray-100 min-h-screen pb-10">
        <div className="mx-auto bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center py-6 border-b bg-gray-200 sticky top-0 z-30">
                <button className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 ml-8 z-10"
                        onClick={handleSiteChangeOpen}>
                    Zmiana Arkusza
                </button>

                <h1 className="text-2xl font-bold text-gray-800 p-2 text-center mx-auto absolute left-0 right-0">
                    Zgrany Spis Sprzętu
                </h1>

                <div className="flex items-center">
                    <div className="flex flex-col items-end mr-6 text-sm">
                        <p className="text-red-800 font-semibold">
                            Stan na dzień: {currentDate}
                        </p>
                        <p className="font-medium">
                            Zalogowany jako {username}
                        </p>
                    </div>

                    {/* Global edit button added here */}
                    {showEditButtonNoMain(userPosition) && (
                        <button
                            className={`rounded-3xl ${globalEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-lg p-3 mr-3 z-10`}
                            onClick={globalEditMode ? handleSaveAll : handleGlobalEditToggle}
                        >
                            {globalEditMode ? 'Zapisz wszystko' : 'Edytuj wszystko'}
                        </button>
                    )}

                    {/* Cancel edit button, only appears when in edit mode */}
                    {globalEditMode && showEditButtonNoMain(userPosition) && (
                        <button
                            className="rounded-3xl bg-gray-500 hover:bg-gray-600 text-white font-bold text-lg p-3 mr-3 z-10"
                            onClick={handleGlobalEditToggle}
                        >
                            Anuluj
                        </button>
                    )}

                    {showAddButton(userPosition) && (
                        <button className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 mr-10 z-10"
                                onClick={handleAddEquipmentOpen}>
                            Dodaj Pozycję
                        </button>
                    )}
                </div>

                <EquipmentAdd isOpen={addEquipment} onClose={handleAddEquipmentClose}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nazwa Sprzętu*
                            </label>
                            <input
                                type="text"
                                name="nazwa_sprzetu"
                                value={newEquipment.nazwa_sprzetu}
                                onChange={handleInputEquipment}
                                className="border rounded-md p-2 w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data Ważności
                            </label>
                            <input
                                type="date"
                                name="data_waznosci"
                                value={newEquipment.data_waznosci}
                                onChange={handleInputEquipment}
                                className="border rounded-md p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ilość
                            </label>
                            <input
                                type="number"
                                name="ilosc"
                                value={newEquipment.ilosc}
                                onChange={handleInputEquipment}
                                className="border rounded-md p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Na Statku
                            </label>
                            <select
                                name="na_statku"
                                value={newEquipment.na_statku}
                                onChange={handleInputEquipment}
                                className="border rounded-md p-2 w-full"
                            >
                                <option value="">Na statku spis podstawowy?</option>
                                <option value="true">Tak</option>
                                <option value="false">Nie</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategoria*
                            </label>
                            <select
                                name="id_kategorii"
                                value={newEquipment.id_kategorii}
                                onChange={(e) => {
                                    handleInputEquipment(e);
                                    setSelectedCategory(parseInt(e.target.value, 10))
                                }}
                                className="border rounded-md p-2 w-full"
                                required
                            >
                                <option value="">Wybierz kategorię</option>
                                {ConstantsEquipment.CategoryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Podkategoria
                            </label>
                            <select
                                name="id_pod_kategorii"
                                value={newEquipment.id_pod_kategorii}
                                onChange={handleInputEquipment}
                                className="border rounded-md p-2 w-full"
                                disabled={!selectedCategory}
                            >
                                <option value="">Wybierz podkategorię</option>
                                {ConstantsEquipment.SubCategoryOptions[selectedCategory]?.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                            onClick={handleAddEquipmentClose}
                        >
                            Anuluj
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            onClick={handleAddEquipment}
                        >
                            Dodaj
                        </button>
                    </div>
                </EquipmentAdd>

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
                <thead className="text-left sticky top-[180px] z-10 bg-gray-200">
                <tr>
                    <th className="px-2 py-4">Nazwa Sprzętu</th>
                    <th className="px-2 py-4">Data Ważności</th>
                    <th className="px-2 py-4">Ilość</th>
                    <th className="px-2 py-4">Kto Zmienił</th>
                    <th className="px-2 py-4 w-20">Akcje</th>
                </tr>
                </thead>
                <tbody className="text-left">
                {Object.keys(equipments).map((category, categoryIndex) => {
                    const categoryItems = equipments[category];
                    const hasCategoryMatches = searchQuery === "" || categoryHasMatches(categoryItems);

                    return hasCategoryMatches ? (
                        <React.Fragment key={category}>
                            <tr className="bg-gray-300 text-xl">
                                <td colSpan="13" className="font-bold p-4 bg-slate-400">{categoryIndex + 1}. {category}</td>
                            </tr>
                            {Object.keys(categoryItems).map((subcategory, subcategoryIndex) => {
                                const showSubcategoryName = subcategory !== "null";
                                const subcategoryItems = categoryItems[subcategory];
                                const hasSubcategoryMatches = searchQuery === "" || subcategoryHasMatches(subcategoryItems);

                                return hasSubcategoryMatches ? (
                                    <React.Fragment key={subcategory}>
                                        {showSubcategoryName && (
                                            <tr className="bg-gray-200">
                                                <td colSpan="13" className="font-semibold p-4 bg-slate-300">{subcategoryIndex + 1}. {subcategory}</td>
                                            </tr>
                                        )}
                                        {subcategoryItems
                                            .filter(matchesSearch)
                                            .map(equipment => (
                                                <tr key={equipment.sprzet_zgrany_id}
                                                    className={`${equipment.sprzet_zgrany_na_statku === "true" || equipment.sprzet_zgrany_na_statku === 1 ? "text-black" : "text-red-600"} border border-gray-700`}>
                                                    <td className="pl-6 px-2 py-4 max-w-[500px] border-r border-l border-gray-700">
                                                        {globalEditMode ? (<>
                                                            <input
                                                                type="text"
                                                                value={editedEquipment[equipment.sprzet_zgrany_id]?.sprzet_zgrany_nazwa || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_zgrany_id, "sprzet_zgrany_nazwa", e.target.value)}
                                                                className="border px-2 py-1 w-5/6"
                                                            />
                                                            <select
                                                                name="id_kategorii"
                                                                value={editedEquipment[equipment.sprzet_zgrany_id]?.id_kategorii || ""}
                                                                onChange={(e) => {
                                                                    handleEdit(equipment.sprzet_zgrany_id, "id_kategorii", e.target.value);
                                                                    setSelectedCategory(parseInt(e.target.value, 10));
                                                                }}
                                                                className="border px-2 my-1 w-5/6"
                                                            >
                                                                <option value="">Wybierz Kategorie</option>
                                                                {ConstantsEquipment.CategoryOptions.map(option => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>))}
                                                            </select>
                                                            <select
                                                                name="id_pod_kategorii"
                                                                value={editedEquipment[equipment.sprzet_zgrany_id]?.id_pod_kategorii || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_zgrany_id, "id_pod_kategorii", e.target.value)}
                                                                className="border px-2 my-1 w-5/6"
                                                                disabled={!selectedCategory}
                                                            >
                                                                <option value="">Wybierz Podkategorie</option>
                                                                {ConstantsEquipment.SubCategoryOptions[selectedCategory]?.map(option => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>))}
                                                            </select>
                                                            <select
                                                                name="na_statku"
                                                                value={editedEquipment[equipment.sprzet_zgrany_id]?.sprzet_zgrany_na_statku || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_zgrany_id, "sprzet_zgrany_na_statku", e.target.value)}
                                                                className="border px-2 my-1 w-5/6"
                                                            >
                                                                <option value="">Na statku spis podstawowy?</option>
                                                                <option value="true">Tak</option>
                                                                <option value="false">Nie</option>

                                                            </select>
                                                        </>) : (equipment.sprzet_zgrany_nazwa)}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                        {globalEditMode ? (<input
                                                            type="date"
                                                            value={editedEquipment[equipment.sprzet_zgrany_id]?.sprzet_zgrany_data_waznosci || ""}
                                                            onChange={(e) => handleEdit(equipment.sprzet_zgrany_id, "sprzet_zgrany_data_waznosci", e.target.value)}
                                                            className="w-full"
                                                        />) : (equipment.sprzet_zgrany_data_waznosci)}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                        {globalEditMode ? (<input
                                                            type="number"
                                                            value={editedEquipment[equipment.sprzet_zgrany_id]?.sprzet_zgrany_ilosc || ""}
                                                            onChange={(e) => handleEdit(equipment.sprzet_zgrany_id, "sprzet_zgrany_ilosc", e.target.value)}
                                                            className="w-full"
                                                        />) : (equipment.sprzet_zgrany_ilosc)}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                        {equipment.sprzet_zgrany_kto_zmienil}
                                                    </td>
                                                    <td className="w-20 p-2">
                                                        {/* Remove individual edit buttons, keep delete button when not in edit mode */}
                                                        {!globalEditMode && (
                                                            <div className="flex flex-col space-y-2">
                                                                <button
                                                                    onClick={() => handleDelete(equipment.sprzet_zgrany_id)}
                                                                    className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded flex items-center"
                                                                >
                                                                    Usuń
                                                                </button>
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
                </tbody>
            </table>
        </div>
    </div>)
}

export default OrganizedEquipment;