import React, { useEffect, useState } from "react";
import apiUrl from "../../constants/api.js";
import ConstantsMedicine from "../../constants/constantsMedicine.js";
import AddItemModal from "../../components/AddItemModal.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import { showEditButtonNoMain, showAddButton } from "../../constants/permisions.js";
import toastService from '../../utils/toast.js';

/**
 * MedicineList Component
 * Displays a list of medicines, allowing for viewing, searching, adding, editing, and deleting.
 * The component supports a global edit mode for bulk updates and ensures responsiveness across devices.
 */
function MedicineList() {
    // State management for medicine data and UI interactions
    const [medicines, setMedicines] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [globalEditMode, setGlobalEditMode] = useState(false);
    const [editedValues, setEditedValues] = useState({});
    const [medicineAdd, setMedicineAdd] = useState(false);
    const [siteChange, setSiteChange] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
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
    const [searchQuery, setSearchQuery] = useState("");

    // User authentication and authorization details
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user?.position || "viewer";

    /**
     * useEffect Hook
     * Fetches medicine data on component mount.
     */
    useEffect(() => {
        fetchMedicines();
    }, []);

    /**
     * Checks if any medicine within a category matches the current search query.
     * @param {object} categoryItems - Object containing subcategories and their medicines.
     * @returns {boolean} - True if any medicine matches the search, false otherwise.
     */
    const categoryHasMatches = (categoryItems) => {
        return Object.keys(categoryItems).some(subcategory =>
            Object.keys(categoryItems[subcategory]).some(subsubcategory =>
                categoryItems[subcategory][subsubcategory].some(medicine => matchesSearch(medicine))
            )
        );
    };

    /**
     * Checks if any medicine within a subcategory matches the current search query.
     * @param {object} subcategoryItems - Object containing sub-subcategories and their medicines.
     * @returns {boolean} - True if any medicine matches the search, false otherwise.
     */
    const subcategoryHasMatches = (subcategoryItems) => {
        return Object.keys(subcategoryItems).some(subsubcategory =>
            subcategoryItems[subsubcategory].some(medicine => matchesSearch(medicine))
        );
    };

    /**
     * Checks if any medicine within a sub-subcategory matches the current search query.
     * @param {Array<object>} subsubcategoryItems - Array of medicines within a sub-subcategory.
     * @returns {boolean} - True if any medicine matches the search, false otherwise.
     */
    const subsubcategoryHasMatches = (subsubcategoryItems) => {
        return subsubcategoryItems.some(medicine => matchesSearch(medicine));
    };

    /**
     * Filters medicines based on the search query.
     * @param {object} medicine - The medicine object to check.
     * @returns {boolean} - True if the medicine name includes the search query, false otherwise.
     */
    const matchesSearch = (medicine) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return medicine.lek_nazwa?.toLowerCase().includes(query);
    };

    /**
     * Fetches medicine data from the API.
     * Updates the `medicines` state upon successful retrieval.
     * Displays error toasts if the fetch operation fails.
     */
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
            toastService.error(`Błąd podczas ładowania leków: ${error.message}`);
        }
    };

    /**
     * Opens the Add Medicine modal.
     */
    const handleAddMedicineOpen = () => {
        setMedicineAdd(true);
    };

    /**
     * Closes the Add Medicine modal.
     */
    const handleAddMedicineClose = () => {
        setMedicineAdd(false);
    };

    /**
     * Opens the Site Change modal.
     */
    const handleSiteChangeOpen = () => {
        setSiteChange(true);
    };

    /**
     * Closes the Site Change modal.
     */
    const handleSiteChangeClose = () => {
        setSiteChange(false);
    };

    /**
     * Converts a numerical index to a corresponding lowercase letter (a, b, c...). Used for sub-subcategory numbering.
     * @param {number} index - The numerical index.
     * @returns {string} - The corresponding lowercase letter.
     */
    const indexToLetter = (index) => {
        return String.fromCharCode(97 + index);
    };

    /**
     * Handles changes to individual medicine fields when in global edit mode.
     * Updates the `editedValues` state and sets `hasChanges` to true.
     * @param {string} medicineId - The ID of the medicine being edited.
     * @param {string} field - The field name being updated (e.g., 'lek_nazwa').
     * @param {string|number} value - The new value for the field.
     */
    const handleEdit = (medicineId, field, value) => {
        setEditedValues(prev => ({
            ...prev,
            [medicineId]: {
                ...prev[medicineId],
                [field]: value,
                rozchod_kto_zmienil: username,
            },
        }));
        setHasChanges(true);
    };

    /**
     * Toggles the global edit mode.
     * If entering edit mode, initializes `editedValues` with current medicine data.
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
            setEditedValues({});
            setHasChanges(false);
        } else {
            const initialValues = {};
            Object.keys(medicines).forEach(category => {
                const categoryItems = medicines[category];
                Object.keys(categoryItems).forEach(subcategory => {
                    const subcategoryItems = categoryItems[subcategory];
                    Object.keys(subcategoryItems).forEach(subsubcategory => {
                        const medicineItems = subcategoryItems[subsubcategory];
                        medicineItems.forEach(medicine => {
                            initialValues[medicine.lek_id] = { ...medicine };
                        });
                    });
                });
            });
            setEditedValues(initialValues);
            setGlobalEditMode(true);
        }
    };

    /**
     * Saves all changes made in global edit mode to the backend.
     * Iterates through `editedValues` and sends PUT requests for each modified item.
     * Provides toast notifications for success, partial success, or failure.
     */
    const handleSaveAll = async () => {
        const medicineIds = Object.keys(editedValues);
        if (medicineIds.length === 0) {
            toastService.info('Brak zmian do zapisania');
            return;
        }

        const savePromises = medicineIds.map(async (medicineId) => {
            try {
                const response = await fetch(apiUrl + "leki/" + medicineId, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editedValues[medicineId]),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return { success: true, id: medicineId };
            } catch (error) {
                console.error(`Error updating medicine ${medicineId}:`, error);
                return { success: false, id: medicineId, error: error.message };
            }
        });

        const results = await Promise.all(savePromises);
        const successes = results.filter(r => r.success).length;
        const failures = results.filter(r => !r.success).length;

        if (failures === 0) {
            toastService.success(`Zapisano wszystkie zmiany (${successes} pozycji)`);
            setGlobalEditMode(false);
            setEditedValues({});
            setHasChanges(false);
        } else if (successes === 0) {
            toastService.error(`Błąd podczas zapisywania zmian. Żadna pozycja nie została zaktualizowana.`);
        } else {
            toastService.warning(`Zapisano częściowo: ${successes} pozycji, ${failures} błędów`);
        }
        fetchMedicines();
    };

    /**
     * Handles input changes for the new medicine form.
     * Updates the `newMedicine` state.
     * Parses category, subcategory, and sub-subcategory values to integers.
     * @param {object} e - The event object from the input change.
     */
    const handleInputMedicine = (e) => {
        const { name, value } = e.target;
        setNewMedicine((prev) => ({
            ...prev,
            [name]: ["lek_kategoria", "lek_podkategoria", "lek_podpodkategoria"].includes(name) ? parseInt(value, 10) : value
        }));
    };

    /**
     * Adds a new medicine item to the backend.
     * Sends a POST request with the new medicine data.
     * Displays toast notifications based on the outcome of the add operation.
     * Resets the `newMedicine` form and selected categories after successful addition.
     */
    const handleAddMedicine = async () => {
        try {
            const response = await fetch(apiUrl + "leki-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMedicine),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toastService.success(`Lek "${newMedicine.lek_nazwa}" został dodany pomyślnie`);
            // Reset form
            setNewMedicine({
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
            setSelectedCategory(null);
            setSelectedSubCategory(null);
            fetchMedicines();
            setMedicineAdd(false);
        } catch (error) {
            console.error("Error adding medicine:", error);
            toastService.error(`Błąd podczas dodawania leku: ${error.message}`);
        }
    };

    /**
     * Handles the deletion of a medicine item.
     * Prompts for user confirmation before proceeding with the deletion.
     * Displays toast notifications based on the outcome of the delete operation.
     * @param {string} medicineId - The ID of the medicine to be deleted.
     */
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
            toastService.info('Lek został usunięty');
        } catch (error) {
            console.error("Error deleting medicine:", error);
            toastService.error(`Błąd podczas usuwania leku: ${error.message}`);
        }
        fetchMedicines();
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
                        Zestawienie Leków
                    </h1>

                    {/* User Info and Action Buttons */}
                    <div className="flex flex-col md:flex-row items-center mt-2 md:mt-0">
                        <div className="flex flex-col items-end mr-0 md:mr-6 text-sm text-center md:text-right">
                            <p className="text-red-800 font-semibold">
                                Stan na dzień: {currentDate.toDateString()}
                            </p>
                            <p className="font-medium">
                                Zalogowany jako {username}
                            </p>
                        </div>

                        {/* Global edit button added here */}
                        {showEditButtonNoMain(userPosition) && (
                            <button
                                className={`rounded-3xl ${globalEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-base md:text-lg p-2 md:p-3 mt-2 md:mt-0 md:mr-3 z-10`}
                                onClick={globalEditMode ? handleSaveAll : handleGlobalEditToggle}
                            >
                                {globalEditMode ? 'Zapisz wszystko' : 'Edytuj wszystko'}
                            </button>
                        )}

                        {/* Cancel edit button, only appears when in edit mode */}
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
                                onClick={handleAddMedicineOpen}
                            >
                                Dodaj Pozycję
                            </button>
                        )}
                    </div>

                    {/* Add Medicine Modal */}
                    <AddItemModal isOpen={medicineAdd} onClose={handleAddMedicineClose} title="Dodaj Nowy Lek">
                        <h2 className="text-xl font-bold mb-4">Dodaj Nowy Lek</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    required
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
                    </AddItemModal>

                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
                </div>

                {/* Search Bar Section */}
                <div className="sticky top-[100px] bg-white z-20 p-1">
                    <div className="flex justify-center items-center w-full md:w-1/2 mx-auto my-4 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
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

                {/* Medicines Table Section */}
                <div className="">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-200 sticky top-[180px] z-10">
                        <tr className="text-gray-700 uppercase text-xs md:text-sm tracking-wider">
                            <th scope="col" className="px-2 py-3 text-left">Nazwa Leku</th>
                            <th scope="col" className="px-2 py-3 text-left">Aktualnie na statku</th>
                            <th scope="col" className="px-2 py-3 text-left">Ilość minimalna</th>
                            <th scope="col" className="px-2 py-3 text-left">Data ważności</th>
                            <th scope="col" className="px-2 py-3 text-left">Status</th>
                            <th scope="col" className="px-2 py-3 text-left">Kto Zmienił</th>
                            <th scope="col" className="px-2 py-3 text-left w-20">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(medicines).map((category, categoryIndex) => {
                            const categoryItems = medicines[category];
                            const hasCategoryMatches = searchQuery === "" || categoryHasMatches(categoryItems);

                            return hasCategoryMatches ? (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-300 text-base md:text-xl">
                                        <td colSpan="7" className="font-bold p-2 md:p-4 bg-slate-500 text-white">        {categoryIndex + 1}. {category === 'Uncategorized' ? 'Brak kategorii' : category}
                                        </td>
                                    </tr>
                                    {Object.keys(categoryItems).map((subcategory, subcategoryIndex) => {
                                        const showSubcategoryName = subcategory !== "null";
                                        const subcategoryItems = categoryItems[subcategory];
                                        const hasSubcategoryMatches = searchQuery === "" || subcategoryHasMatches(subcategoryItems);

                                        return hasSubcategoryMatches ? (
                                            <React.Fragment key={subcategory}>
                                                {showSubcategoryName && (
                                                    <tr className="bg-gray-200 text-sm md:text-base">
                                                        <td colSpan="7" className="p-2 pl-4 md:p-4 md:pl-6 font-semibold bg-slate-900 text-white">{subcategoryIndex + 1}. {subcategory}</td>
                                                    </tr>
                                                )}
                                                {Object.keys(subcategoryItems).map((subsubcategory, subsubcategoryIndex) => {
                                                    const showSubsubcategoryName = subsubcategory !== "null";
                                                    const subsubcategoryItems = subcategoryItems[subsubcategory];
                                                    const hasSubsubcategoryMatches = subsubcategoryHasMatches(subsubcategoryItems);

                                                    return hasSubsubcategoryMatches ? (
                                                        <React.Fragment key={subsubcategory}>
                                                            {showSubsubcategoryName && (
                                                                <tr className="bg-gray-100 text-xs md:text-sm">
                                                                    <td colSpan="7" className="pl-4 md:pl-6 py-2 bg-slate-300 text-white">
                                                                        {subcategoryIndex + 1}.{indexToLetter(subsubcategoryIndex)}. {subsubcategory}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {subsubcategoryItems
                                                                .filter(matchesSearch)
                                                                .map(medicine => (
                                                                    <tr key={medicine.lek_id}
                                                                        className={`${medicine.lek_przechowywanie === "freezer" ? "bg-blue-100" : ""} border-b border-gray-200 hover:bg-gray-50`}>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm max-w-[150px] md:max-w-[250px] overflow-hidden text-ellipsis">
                                                                            {globalEditMode ? (
                                                                                <div className="flex flex-col space-y-1">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={editedValues[medicine.lek_id]?.lek_nazwa || ""}
                                                                                        onChange={(e) => handleEdit(medicine.lek_id, "lek_nazwa", e.target.value)}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                    />
                                                                                    <select
                                                                                        name="id_kategorii"
                                                                                        value={editedValues[medicine.lek_id]?.id_kategorii || ""}
                                                                                        onChange={(e) => {
                                                                                            handleEdit(medicine.lek_id, "id_kategorii", parseInt(e.target.value));
                                                                                            setSelectedCategory(e.target.value);
                                                                                        }}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
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
                                                                                        value={editedValues[medicine.lek_id]?.id_pod_kategorii || ""}
                                                                                        onChange={(e) => {
                                                                                            handleEdit(medicine.lek_id, "id_pod_kategorii", parseInt(e.target.value));
                                                                                            setSelectedSubCategory(e.target.value);
                                                                                        }}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                        disabled={!editedValues[medicine.lek_id]?.id_kategorii}
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
                                                                                        value={editedValues[medicine.lek_id]?.id_pod_pod_kategorii || ""}
                                                                                        onChange={(e) => handleEdit(medicine.lek_id, "id_pod_pod_kategorii", parseInt(e.target.value))}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                        disabled={!editedValues[medicine.lek_id]?.id_pod_kategorii}
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
                                                                            ) : (
                                                                                medicine.lek_nazwa
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {medicine.stan_magazynowy_ilosc}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {globalEditMode ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={editedValues[medicine.lek_id]?.lek_ilosc_minimalna || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_id, "lek_ilosc_minimalna", e.target.value)}
                                                                                    className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                />
                                                                            ) : (
                                                                                medicine.lek_ilosc_minimalna
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {globalEditMode ? (
                                                                                <input
                                                                                    type="date"
                                                                                    value={editedValues[medicine.lek_id]?.lek_data || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_id, "lek_data", e.target.value)}
                                                                                    className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                />
                                                                            ) : (
                                                                                medicine.lek_data
                                                                            )}
                                                                        </td>
                                                                        <td className={`${medicine.lek_status !== "Ważny" ? "font-bold text-red-700" : ""} px-2 py-2 md:py-4 whitespace-nowrap text-sm`}>
                                                                            {medicine.lek_status}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {medicine.rozchod_kto_zmienil}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                            {/* Delete button only visible when not in global edit mode */}
                                                                            {!globalEditMode && (
                                                                                <button
                                                                                    onClick={() => handleDeleteMedicine(medicine.lek_id)}
                                                                                    className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded hover:bg-red-200"
                                                                                >
                                                                                    Usuń
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
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
        </div>
    );
}

export default MedicineList;
