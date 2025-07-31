import React, { useEffect, useState } from "react";
import apiUrl from "../../constants/api.js";
import AddItemModal from "../../components/AddItemModal.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsEquipment from "../../constants/constantsEquipment.js";
import { showEditButtonNoMain, showAddButton } from "../../constants/permisions.js";
import toastService from '../../utils/toast.js';
import {generateEqPDF} from "../../utils/EqPdfGenerator.js";
/**
 * EquipmentList Component
 * Displays a list of medical equipment, allowing for viewing, searching, adding, editing, and deleting.
 * The component supports a global edit mode for bulk updates and ensures responsiveness across devices.
 */
function EquipmentList() {
    // State management for equipment data and UI interactions
    const [equipments, setEquipments] = useState([]);
    const [globalEditMode, setGlobalEditMode] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const [siteChange, setSiteChange] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [addEquipment, setAddEquipment] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        eq_nazwa: "",
        eq_ilosc_wymagana: "",
        eq_ilosc_aktualna: "",
        eq_data: "",
        eq_termin: "",
        eq_ilosc_termin: "",
        eq_kategoria: "",
        eq_na_statku: "true",
        eq_torba_ratownika: "false",
    });
    const [searchQuery, setSearchQuery] = useState("");

    // User authentication and authorization details
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user?.position || "viewer";

    /**
     * useEffect Hook
     * Fetches equipment data on component mount and sets the current date.
     */
    useEffect(() => {
        fetchEquipment();
        setCurrentDate(new Date().toISOString().slice(0, 10));
    }, []);

    /**
     * Checks if any item within a category matches the current search query.
     * @param {object} categoryItems - Object containing subcategories and their equipment.
     * @returns {boolean} - True if any equipment matches the search, false otherwise.
     */
    const categoryHasMatches = (categoryItems) => {
        return Object.values(categoryItems).some(subcategory =>
            subcategory.some(equipment => matchesSearch(equipment))
        );
    };

    /**
     * Checks if any item within a subcategory matches the current search query.
     * @param {Array<object>} subcategoryItems - Array of equipment within a subcategory.
     * @returns {boolean} - True if any equipment matches the search, false otherwise.
     */
    const subcategoryHasMatches = (subcategoryItems) => {
        return subcategoryItems.some(equipment => matchesSearch(equipment));
    };

    /**
     * Filters equipment based on the search query.
     * @param {object} equipment - The equipment object to check.
     * @returns {boolean} - True if the equipment name includes the search query, false otherwise.
     */
    const matchesSearch = (equipment) => {
        const searchLower = searchQuery.toLowerCase();
        return equipment.sprzet_nazwa.toLowerCase().includes(searchLower);
    };

    /**
     * Fetches equipment data from the API.
     * Updates the `equipments` state upon successful retrieval.
     * Displays error toasts if the fetch operation fails.
     */
    const fetchEquipment = async () => {
        try {
            const response = await fetch(apiUrl + "sprzet-kategorie");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEquipments(data);
            console.log('Equipment fetched', data);
        } catch (error) {
            console.error('Fetch error:', error);
            toastService.error(`Błąd podczas ładowania sprzętu: ${error.message}`);
        }
    };

    /**
     * Handles changes to individual equipment fields when in global edit mode.
     * Updates the `editedEquipment` state and sets `hasChanges` to true.
     * @param {string} equipmentId - The ID of the equipment being edited.
     * @param {string} field - The field name being updated (e.g., 'sprzet_nazwa').
     * @param {string|number} value - The new value for the field.
     */
    const handleEdit = (equipmentId, field, value) => {
        setEditedEquipment(prev => ({
            ...prev,
            [equipmentId]: {
                ...prev[equipmentId],
                [field]: value,
                sprzet_kto_zmienil: username
            }
        }));
        setHasChanges(true);
    };

    /**
     * Toggles the global edit mode.
     * If entering edit mode, initializes `editedEquipment` with current equipment data.
     * If exiting edit mode with unsaved changes, prompts for confirmation.
     */
    const handleGlobalEditToggle = () => {
        if (userPosition === "viewer") {
            toastService.info("Brak uprawnień do edycji.");
            return;
        }

        if (globalEditMode) {
            if (hasChanges) {
                if (!confirm("Masz niezapisane zmiany. Czy na pewno chcesz wyjść z trybu edycji?")) {
                    return;
                }
            }
            setGlobalEditMode(false);
            setEditedEquipment({});
            setHasChanges(false);
        } else {
            const initialValues = {};
            Object.keys(equipments).forEach(category => {
                const categoryItems = equipments[category];
                Object.keys(categoryItems).forEach(subcategory => {
                    const subcategoryItems = categoryItems[subcategory];
                    subcategoryItems.forEach(equipment => {
                        initialValues[equipment.sprzet_id] = { ...equipment };
                    });
                });
            });
            setEditedEquipment(initialValues);
            setGlobalEditMode(true);
        }
    };

    /**
     * Saves all changes made in global edit mode to the backend.
     * Iterates through `editedEquipment` and sends PUT requests for each modified item.
     * Provides toast notifications for success, partial success, or failure.
     */
    const handleSaveAll = async () => {
        const equipmentIds = Object.keys(editedEquipment);
        if (equipmentIds.length === 0) {
            toastService.info('Brak zmian do zapisania');
            return;
        }

        const savePromises = equipmentIds.map(async (equipmentId) => {
            try {
                const stringEquipmentId = String(equipmentId);
                let foundEquipment = null;
                for (const category of Object.values(equipments)) {
                    for (const subcategory of Object.values(category)) {
                        const found = subcategory.find(eq => String(eq.sprzet_id) === stringEquipmentId);
                        if (found) {
                            foundEquipment = found;
                            break;
                        }
                    }
                    if (foundEquipment) break;
                }

                if (!foundEquipment) {
                    console.error(`Equipment with ID ${equipmentId} not found in data`);
                    return { success: false, id: equipmentId, error: "Equipment not found in data structure" };
                }

                const response = await fetch(apiUrl + "sprzet/" + equipmentId, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editedEquipment[equipmentId])
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

        const results = await Promise.all(savePromises);
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

    const handleGeneratePDF = () => {
        const allEqData = [];

        Object.keys(equipments).forEach(category => {
            const categoryItems = equipments[category];
            Object.keys(categoryItems).forEach(subcategory => {
                const subcategoryItems = categoryItems[subcategory];
                subcategoryItems.forEach(equipment => {
                    allEqData.push({
                        nazwa: equipment.sprzet_nazwa,
                        data_waznosci: equipment.sprzet_data_waznosci,
                        ilosc: equipment.sprzet_ilosc_aktualna,
                        termin: equipment.sprzet_termin,
                        id_kategorii: equipment.id_kategorii,
                        id_pod_kategorii: equipment.id_pod_kategorii,
                    });
                });
            });
        });

        generateEqPDF(allEqData, currentDate);
        toastService.success("PDF został wygenerowany i pobrany");
    }

    /**
     * Handles the deletion of a single equipment item.
     * Prompts for user confirmation before proceeding with the deletion.
     * Displays toast notifications based on the outcome of the delete operation.
     * @param {string} equipmentId - The ID of the equipment to be deleted.
     */
    const handleDelete = async (equipmentId) => {
        if (!confirm("Czy na pewno chcesz usunąć tę pozycję? Ta operacja jest nieodwracalna.")) {
            return;
        }
        try {
            const response = await fetch(apiUrl + "sprzet/delete/" + equipmentId, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status()}`);
            }
            console.log("Equipment deleted:", equipmentId);
            toastService.info('Sprzęt został usunięty');
        } catch (error) {
            console.log("Error deleting equipment:", error);
            toastService.error(`Błąd podczas usuwania sprzętu: ${error.message}`);
        }
        fetchEquipment();
    };

    /**
     * Opens the SiteChange modal.
     */
    const handleSiteChangeOpen = () => {
        setSiteChange(true);
    };

    /**
     * Closes the SiteChange modal.
     */
    const handleSiteChangeClose = () => {
        setSiteChange(false);
    };

    /**
     * Opens the AddEquipment modal.
     */
    const handleAddEquipmentOpen = () => {
        setAddEquipment(true);
    };

    /**
     * Closes the AddEquipment modal.
     */
    const handleAddEquipmentClose = () => {
        setAddEquipment(false);
    };

    /**
     * Handles input changes for the new equipment form.
     * Updates the `newEquipment` state.
     * Parses category and subcategory values to integers.
     * @param {object} e - The event object from the input change.
     */
    const handleInputEquipment = (e) => {
        const { name, value } = e.target;
        setNewEquipment(prev => ({
            ...prev,
            [name]: ["eq_kategoria", "eq_podkategoria"].includes(name) ? parseInt(value, 10) : value
        }));
    };

    /**
     * Adds a new equipment item to the backend.
     * Sends a POST request with the new equipment data.
     * Displays toast notifications based on the outcome of the add operation.
     * Resets the `newEquipment` form after successful addition.
     */
    const handleAddEquipment = async () => {
        try {
            const response = await fetch(apiUrl + "sprzet-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEquipment)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toastService.success(`Sprzęt "${newEquipment.eq_nazwa}" został dodany pomyślnie`);
            setNewEquipment({
                eq_nazwa: "",
                eq_ilosc_wymagana: "",
                eq_ilosc_aktualna: "",
                eq_data: "",
                eq_termin: "",
                eq_ilosc_termin: "",
                eq_na_statku: "true",
                eq_torba_ratownika: "false",
                eq_kategoria: "",
                eq_podkategoria: "",
            });
        } catch (error) {
            console.error('Fetch error:', error);
            toastService.error(`Błąd podczas dodawania sprzętu: ${error.message}`);
        }
        fetchEquipment();
    };

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center py-4 md:py-6 px-4 md:px-8 border-b bg-gray-200 sticky top-0 z-30">
                    {/* Site Change Button */}
                    <button
                        className="rounded-3xl bg-slate-900 text-white font-bold text-base md:text-lg p-2 md:p-3 mb-2 md:mb-0 md:ml-8 z-10"
                        onClick={handleSiteChangeOpen}
                    >
                        Zmiana Arkusza
                    </button>

                    {/* Page Title */}
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 p-2 text-center md:mx-auto md:absolute md:left-0 md:right-0">
                        Spis Sprzętu Medycznego
                    </h1>

                    {/* User Info and Action Buttons */}
                    <div className="flex flex-col md:flex-row items-center mt-2 md:mt-0">
                        <div className="flex flex-col items-end mr-0 md:mr-6 text-sm text-center md:text-right">
                            <p className="text-red-800 font-semibold">
                                Stan na dzień: {currentDate}
                            </p>
                            <p className="font-medium">
                                Zalogowany jako {username}
                            </p>
                        </div>

                        {/* Global Edit Button */}
                        {showEditButtonNoMain(userPosition) && (
                            <button
                                className={`rounded-3xl ${globalEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-base md:text-lg p-2 md:p-3 mt-2 md:mt-0 md:mr-3 z-10`}
                                onClick={globalEditMode ? handleSaveAll : handleGlobalEditToggle}
                            >
                                {globalEditMode ? 'Zapisz wszystko' : 'Edytuj wszystko'}
                            </button>
                        )}

                        <button className="bg-pink-400 hover:bg-pink-500 text-white font-bold p-4 rounded-3xl mr-2 flex items-center z-40 relative"
                                onClick={handleGeneratePDF}
                                >
                            <span className="mr-1">📄</span> Generuj PDF
                        </button>

                        {/* Cancel Edit Button */}
                        {globalEditMode && showEditButtonNoMain(userPosition) && (
                            <button
                                className="rounded-3xl bg-gray-500 hover:bg-gray-600 text-white font-bold text-base md:text-lg p-2 md:p-3 mt-2 md:mt-0 md:mr-3 z-10"
                                onClick={handleGlobalEditToggle}
                            >
                                Anuluj
                            </button>
                        )}

                        {/* Add Item Button */}
                        {showAddButton(userPosition) && (
                            <button
                                className="rounded-3xl bg-slate-900 text-white font-bold text-base md:text-lg p-2 md:p-3 mt-2 md:mt-0 md:mr-10 z-10"
                                onClick={handleAddEquipmentOpen}
                            >
                                Dodaj Pozycję
                            </button>
                        )}
                    </div>

                    {/* Add Equipment Modal */}
                    <AddItemModal isOpen={addEquipment} onClose={handleAddEquipmentClose} title="Dodaj Wyposażenie">
                        <h2 className="text-xl font-bold mb-4">Dodaj Wyposażenie</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nazwa*
                                </label>
                                <input
                                    type="text"
                                    name="eq_nazwa"
                                    value={newEquipment.eq_nazwa}
                                    onChange={handleInputEquipment}
                                    className="border rounded-md p-2 w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ilość wymagana
                                </label>
                                <input
                                    type="number"
                                    name="eq_ilosc_wymagana"
                                    value={newEquipment.eq_ilosc_wymagana}
                                    onChange={handleInputEquipment}
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ilość aktualna
                                </label>
                                <input
                                    type="number"
                                    name="eq_ilosc_aktualna"
                                    value={newEquipment.eq_ilosc_aktualna}
                                    onChange={handleInputEquipment}
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data ważności
                                </label>
                                <input
                                    type="date"
                                    name="eq_data"
                                    value={newEquipment.eq_data}
                                    onChange={handleInputEquipment}
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Termin
                                </label>
                                <select
                                    name="eq_termin"
                                    value={newEquipment.eq_termin}
                                    onChange={handleInputEquipment}
                                    className="border rounded-md p-2 w-full"
                                >
                                    <option value="">Wybierz termin</option>
                                    {ConstantsEquipment.StatusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ilość/Termin
                                </label>
                                <select
                                    name="eq_ilosc_termin"
                                    value={newEquipment.eq_ilosc_termin}
                                    onChange={handleInputEquipment}
                                    className="border rounded-md p-2 w-full"
                                >
                                    <option value="">Wybierz Ilość/Termin</option>
                                    {ConstantsEquipment.EquipmentStatusOptions.map(option => (
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
                                    name="eq_kategoria"
                                    value={newEquipment.eq_kategoria}
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
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Podkategoria
                                </label>
                                <select
                                    name="eq_podkategoria"
                                    value={newEquipment.eq_podkategoria}
                                    onChange={handleInputEquipment}
                                    className="border rounded-md p-2 w-full"
                                    disabled={!selectedCategory}
                                >
                                    <option value="">Wybierz podkategorię</option>
                                    {ConstantsEquipment.SubCategoryOptions[selectedCategory]?.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
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
                                onClick={() => {
                                    handleAddEquipment();
                                    handleAddEquipmentClose();
                                }}
                            >
                                Dodaj
                            </button>
                        </div>
                    </AddItemModal>
                </div>

                <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>

                {/* Search Bar Section */}
                <div className="sticky top-[100px] bg-white z-20 p-1">
                    <div className="flex justify-center items-center w-full md:w-1/2 mx-auto my-4 relative">
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

                {/* Equipment Table Section */}
                <div className="">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-200 sticky top-[180px] z-10">
                        <tr>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wyroby Medyczne</th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Ważności</th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ilość Aktualna</th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">Termin</th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kto Zmienił</th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(equipments).map((category, categoryIndex) => {
                            const categoryItems = equipments[category];
                            const hasCategoryMatches = searchQuery === "" || categoryHasMatches(categoryItems);

                            return hasCategoryMatches ? (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-300 text-base md:text-xl">
                                        <td colSpan="6" className="font-bold p-2 md:p-4 bg-slate-500 text-white">{categoryIndex + 1}. {category}</td>
                                    </tr>
                                    {Object.keys(categoryItems).map((subcategory, subcategoryIndex) => {
                                        const showSubcategoryName = subcategory !== "null";
                                        const subcategoryItems = categoryItems[subcategory];
                                        const hasSubcategoryMatches = searchQuery === "" || subcategoryHasMatches(subcategoryItems);

                                        return hasSubcategoryMatches ? (
                                            <React.Fragment key={subcategory}>
                                                {showSubcategoryName && (
                                                    <tr className="bg-gray-200 text-sm md:text-base">
                                                        <td colSpan="6" className="font-semibold p-2 md:p-4 bg-slate-400 text-white">{subcategoryIndex + 1}. {subcategory}</td>
                                                    </tr>
                                                )}
                                                {subcategoryItems
                                                    .filter(matchesSearch)
                                                    .map(equipment => (
                                                        <tr key={equipment.sprzet_id} className="border-b border-gray-200 hover:bg-gray-50">
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] md:max-w-[500px] overflow-hidden text-ellipsis">
                                                                {globalEditMode ? (
                                                                    <div className="flex flex-col space-y-1">
                                                                        <input
                                                                            type="text"
                                                                            value={editedEquipment[equipment.sprzet_id]?.sprzet_nazwa || ""}
                                                                            onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_nazwa", e.target.value)}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        />
                                                                        <select
                                                                            name="id_kategorii"
                                                                            value={editedEquipment[equipment.sprzet_id]?.id_kategorii || ""}
                                                                            onChange={(e) => {
                                                                                handleEdit(equipment.sprzet_id, "id_kategorii", e.target.value)
                                                                                setSelectedCategory(e.target.value)
                                                                            }}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        >
                                                                            <option value="">Wybierz Kategorie</option>
                                                                            {ConstantsEquipment.CategoryOptions.map(option => (
                                                                                <option key={option.value} value={option.value}>
                                                                                    {option.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <select
                                                                            name="id_pod_kategorii"
                                                                            value={editedEquipment[equipment.sprzet_id]?.id_pod_kategorii || ""}
                                                                            onChange={(e) => {
                                                                                handleEdit(equipment.sprzet_id, "id_pod_kategorii", e.target.value)
                                                                                setSelectedCategory(e.target.value)
                                                                            }}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        >
                                                                            <option value="">Wybierz Pod Kategorie</option>
                                                                            {selectedCategory && ConstantsEquipment.SubCategoryOptions[selectedCategory]?.map(option => (
                                                                                <option key={option.value} value={option.value}>
                                                                                    {option.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ) : (
                                                                    equipment.sprzet_nazwa
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {globalEditMode ? (
                                                                    <input
                                                                        type="date"
                                                                        value={editedEquipment[equipment.sprzet_id]?.sprzet_data_waznosci || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_data_waznosci", e.target.value)}
                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                    />
                                                                ) : (
                                                                    equipment.sprzet_data_waznosci
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {globalEditMode ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_aktualna || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_aktualna", e.target.value)}
                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                    />
                                                                ) : (
                                                                    equipment.sprzet_ilosc_aktualna
                                                                )}
                                                            </td>
                                                            <td className={`${equipment.sprzet_termin !== "Ważny" ? "font-bold text-red-700" : ""} px-2 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900`}>
                                                                {equipment.sprzet_termin}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {equipment.sprzet_kto_zmienil}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                {/* Delete button only visible when not in global edit mode */}
                                                                {!globalEditMode && (
                                                                    <button
                                                                        onClick={() => handleDelete(equipment.sprzet_id)}
                                                                        className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded hover:bg-red-200"
                                                                    >
                                                                        Usuń
                                                                    </button>
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
            </div>
        </div>

    )


}

export default EquipmentList;
