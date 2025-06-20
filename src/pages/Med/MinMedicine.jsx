import React, {useEffect, useState} from "react";
import apiUrl from "../../constants/api.js";
import MedicineAdd from "../../components/MedicineAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsMedicine from "../../constants/constantsMedicine.js";
import {showEditButtonNoMain, showAddButton} from "../../constants/permisions.js";
import toastService from '../../utils/toast.js';


function MinMedicine() {
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user.position || "viewer";
    const [currentDate, setCurrentDate] = useState(new Date());
    const [medicines, setMedicines] = useState({});
    // Change from individual edit mode to global edit mode
    const [globalEditMode, setGlobalEditMode] = useState(false);
    const [editedValues, setEditedValues] = useState({});
    // Track whether there are unsaved changes
    const [hasChanges, setHasChanges] = useState(false);
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
        const {name, value} = e.target;
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
            toastService.success(`Lek "${newMedicine.nazwa_leku}" został dodany do minimum leków`);

            await fetchMedicines();
            handleAddMedicineClose();
        } catch (error) {
            console.error("Error adding medicine:", error);
            toastService.error(`Błąd podczas dodawania leku: ${error.message}`);
        }
    };

    // Modified handle edit to work with global edit mode
    const handleEdit = (medicineId, field, value) => {
        if (field === 'id_kategorii') {
            setEditedValues(prev => ({
                ...prev,
                [medicineId]: {
                    ...prev[medicineId],
                    [field]: value,
                    id_pod_kategorii: null,
                    id_pod_pod_kategorii: null,
                }
            }));
        } else if (field === 'id_pod_kategorii') {
            setEditedValues(prev => ({
                ...prev,
                [medicineId]: {
                    ...prev[medicineId],
                    [field]: value,
                    id_pod_pod_kategorii: null,
                }
            }));
        } else {
            setEditedValues(prev => ({
                ...prev,
                [medicineId]: {
                    ...prev[medicineId],
                    [field]: value,
                }
            }));
        }

        // Set hasChanges flag to true
        setHasChanges(true);
    };

    const validateEdit = (medicineId) => {
        const values = editedValues[medicineId];
        if (!values.nazwa_leku) {
            alert("Nazwa leku jest wymagana");
            return false;
        }

        return true;
    };

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
            setEditedValues({});
            setHasChanges(false);
        } else {
            // Entering edit mode - initialize editedValues
            const initialValues = {};

            // Loop through all medicines to initialize edit values
            Object.keys(medicines).forEach(category => {
                const categoryItems = medicines[category];
                Object.keys(categoryItems).forEach(subcategory => {
                    const subcategoryItems = categoryItems[subcategory];
                    Object.keys(subcategoryItems).forEach(subsubcategory => {
                        const medicineItems = subcategoryItems[subsubcategory];
                        medicineItems.forEach(medicine => {
                            initialValues[medicine.lek_min_id] = {
                                nazwa_leku: medicine.lek_min_nazwa,
                                pakowanie: medicine.lek_min_pakowanie,
                                w_opakowaniu: medicine.lek_min_w_opakowaniu,
                                przechowywanie: medicine.leki_min_przechowywanie,
                                na_statku_spis_podstawowy: medicine.leki_min_na_statku_spis_podstawowy,
                                id_kategorii: medicine.id_kategorii,
                                id_pod_kategorii: medicine.id_pod_kategorii,
                                id_pod_pod_kategorii: medicine.id_pod_pod_kategorii
                            };
                        });
                    });
                });
            });

            setEditedValues(initialValues);
            setGlobalEditMode(true);
        }
    };

    // New function to save all changes at once
    const handleSaveAll = async () => {
        // Get all medicine IDs that have been edited
        const medicineIds = Object.keys(editedValues);
        if (medicineIds.length === 0) {
            toastService.info('Brak zmian do zapisania');
            return;
        }

        // Validate all edits first
        for (const medicineId of medicineIds) {
            if (!validateEdit(medicineId)) {
                return;
            }
        }

        const savePromises = medicineIds.map(async (medicineId) => {
            try {
                // Convert medicineId to string to ensure consistent comparison
                const stringMedicineId = String(medicineId);

                // Find the medicine in the nested structure, accounting for possible type mismatches
                const medicine = Object.values(medicines)
                    .flatMap(category => Object.values(category))
                    .flatMap(subcategory => Object.values(subcategory))
                    .flatMap(subsubcategory => subsubcategory)
                    .find(med => String(med.lek_min_id) === stringMedicineId);

                // If medicine not found, handle gracefully
                if (!medicine) {
                    console.error(`Medicine with ID ${medicineId} not found in data`);
                    return { success: false, id: medicineId, error: "Medicine not found in data structure" };
                }

                // Use editedValues as the primary source of data
                const dataToSend = {
                    nazwa_leku: editedValues[medicineId]?.nazwa_leku || medicine.lek_min_nazwa,
                    pakowanie: editedValues[medicineId]?.pakowanie || medicine.lek_min_pakowanie,
                    w_opakowaniu: editedValues[medicineId]?.w_opakowaniu || medicine.lek_min_w_opakowaniu,
                    przechowywanie: editedValues[medicineId]?.przechowywanie !== undefined ?
                        editedValues[medicineId].przechowywanie :
                        medicine.leki_min_przechowywanie,
                    na_statku_spis_podstawowy: editedValues[medicineId]?.na_statku_spis_podstawowy !== undefined ?
                        editedValues[medicineId].na_statku_spis_podstawowy :
                        medicine.leki_min_na_statku_spis_podstawowy,
                    id_kategorii: editedValues[medicineId]?.id_kategorii !== undefined ?
                        (editedValues[medicineId].id_kategorii === "" ? null : editedValues[medicineId].id_kategorii) :
                        medicine.id_kategorii,
                    id_pod_kategorii: editedValues[medicineId]?.id_pod_kategorii !== undefined ?
                        (editedValues[medicineId].id_pod_kategorii === "" ? null : editedValues[medicineId].id_pod_kategorii) :
                        medicine.id_pod_kategorii,
                    id_pod_pod_kategorii: editedValues[medicineId]?.id_pod_pod_kategorii !== undefined ?
                        (editedValues[medicineId].id_pod_pod_kategorii === "" ? null : editedValues[medicineId].id_pod_pod_kategorii) :
                        medicine.id_pod_pod_kategorii
                };

                const response = await fetch(apiUrl + "leki-min/" + medicineId, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataToSend),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                return { success: true, id: medicineId };
            } catch (error) {
                console.error(`Error updating medicine ${medicineId}:`, error);
                return { success: false, id: medicineId, error: error.message };
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
            setEditedValues({});
            setHasChanges(false);
        } else if (successes === 0) {
            toastService.error(`Błąd podczas zapisywania zmian. Żadna pozycja nie została zaktualizowana.`);
        } else {
            toastService.warning(`Zapisano częściowo: ${successes} pozycji, ${failures} błędów`);
        }

        fetchMedicines();
    };

    const handleSave = async (medicineId) => {
        if (!validateEdit(medicineId)) {
            return;
        }

        try {
            // Convert medicineId to string to ensure consistent comparison
            const stringMedicineId = String(medicineId);

            // Find the medicine in the nested structure, accounting for possible type mismatches
            const medicine = Object.values(medicines)
                .flatMap(category => Object.values(category))
                .flatMap(subcategory => Object.values(subcategory))
                .flatMap(subsubcategory => subsubcategory)
                .find(med => String(med.lek_min_id) === stringMedicineId);

            // If medicine not found, handle gracefully
            if (!medicine) {
                console.error(`Medicine with ID ${medicineId} not found in data`);
                toastService.error(`Błąd: Nie znaleziono leku o ID ${medicineId}`);
                return;
            }

            const dataToSend = {
                nazwa_leku: editedValues[medicineId]?.nazwa_leku || medicine.lek_min_nazwa,
                pakowanie: editedValues[medicineId]?.pakowanie || medicine.lek_min_pakowanie,
                w_opakowaniu: editedValues[medicineId]?.w_opakowaniu || medicine.lek_min_w_opakowaniu,
                przechowywanie: editedValues[medicineId]?.przechowywanie !== undefined ?
                    editedValues[medicineId].przechowywanie :
                    medicine.leki_min_przechowywanie,
                na_statku_spis_podstawowy: editedValues[medicineId]?.na_statku_spis_podstawowy !== undefined ?
                    editedValues[medicineId].na_statku_spis_podstawowy :
                    medicine.leki_min_na_statku_spis_podstawowy,
                id_kategorii: editedValues[medicineId]?.id_kategorii !== undefined ?
                    (editedValues[medicineId].id_kategorii === "" ? null : editedValues[medicineId].id_kategorii) :
                    medicine.id_kategorii,

                id_pod_kategorii: editedValues[medicineId]?.id_pod_kategorii !== undefined ?
                    (editedValues[medicineId].id_pod_kategorii === "" ? null : editedValues[medicineId].id_pod_kategorii) :
                    medicine.id_pod_kategorii,

                id_pod_pod_kategorii: editedValues[medicineId]?.id_pod_pod_kategorii !== undefined ?
                    (editedValues[medicineId].id_pod_pod_kategorii === "" ? null : editedValues[medicineId].id_pod_pod_kategorii) :
                    medicine.id_pod_pod_kategorii
            };

            console.log("Complete data being sent:", dataToSend);

            const response = await fetch(apiUrl + "leki-min/" + medicineId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }
            toastService.success('Dane leku zostały zaktualizowane pomyślnie');

            await fetchMedicines();
        } catch (error) {
            console.error("Error updating medicine:", error);
            toastService.error(`Błąd podczas aktualizacji leku: ${error.message}`);
        }
    };

    const [searchQuery, setSearchQuery] = useState("");
    const matchesSearch = (medicine) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            medicine.lek_min_nazwa?.toLowerCase().includes(query)
        )
    }


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
            toastService.info('Lek został usunięty z minimum leków');

            await fetchMedicines();
        } catch (error) {
            console.error("Error deleting medicine:", error);
            toastService.error(`Błąd podczas usuwania leku: ${error.message}`);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
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
                        Spis Minimum Leków
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
                                    onClick={handleAddMedicineOpen}>
                                Dodaj Pozycję
                            </button>
                        )}
                    </div>

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
                                    Jednostki
                                </label>
                                <select
                                    name="pakowanie"
                                    value={newMedicine.pakowanie}
                                    onChange={handleInputMedicine}
                                    className="border rounded-md p-2 w-full"
                                >
                                    <option value="">Wybierz jednostki</option>
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
                <table className="w-full border-collapse">
                    <thead className="text-left sticky top-[182px] z-10">
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide text-left">
                        <th className="px-4 py-3">Nazwa Leku</th>
                        <th className="px-4 py-3">Jednostki</th>
                        <th className="px-4 py-3">W Opakowaniu</th>
                        <th className="px-4 py-3 w-20">Akcje</th>
                    </tr>
                    </thead>
                    <tbody className="text-left">
                    {Object.keys(medicines).map((category, categoryIndex) => {
                        const categoryItems = medicines[category];
                        const hasCategoryMatches = searchQuery === "" || categoryHasMatches(categoryItems);

                        return hasCategoryMatches ? (
                            <React.Fragment key={category}>
                                <tr className="bg-gray-300 text-xl">
                                    <td colSpan="4" className="font-bold p-4 bg-slate-500">
                                        {categoryIndex + 1}. {category}
                                    </td>
                                </tr>
                                {Object.keys(categoryItems).map((subcategory, subcategoryIndex) => {
                                    const showSubcategoryName = subcategory !== "null";
                                    const subcategoryItems = categoryItems[subcategory];
                                    const hasSubcategoryMatches = searchQuery === "" || subcategoryHasMatches(subcategoryItems);

                                    return hasSubcategoryMatches ? (
                                        <React.Fragment key={subcategory}>
                                            {showSubcategoryName && (
                                                <tr className="bg-gray-200">
                                                    <td colSpan="4" className="p-2 pl-8 font-semibold text-lg bg-slate-400">
                                                        {subcategoryIndex + 1}. {subcategory}
                                                    </td>
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
                                                                <td colSpan="4" className="pl-12 text-lg bg-slate-300">
                                                                    {subcategoryIndex + 1}.{indexToLetter(subsubcategoryIndex)}. {subsubcategory}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {subsubcategoryItems
                                                            .filter(matchesSearch)
                                                            .map(medicine => (
                                                                <tr key={medicine.lek_min_id}
                                                                    className={`${medicine.leki_min_przechowywanie === "freezer" ? "bg-blue-200" : medicine.leki_min_przechowywanie === "narkotyk" ? "bg-orange-200" : ""} ${medicine.leki_min_na_statku_spis_podstawowy === 1 ? "text-red-600" : ""} border border-gray-700`}>
                                                                    <td className="pl-16 px-4 py-3 border-r border-l border-gray-700">
                                                                        {globalEditMode ? (
                                                                            <>
                                                                                <input
                                                                                    type="text"
                                                                                    value={editedValues[medicine.lek_min_id]?.nazwa_leku || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_min_id, "nazwa_leku", e.target.value)}
                                                                                    className="border px-2 py-1 w-full mb-1"
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
                                                                                    className="border px-2 py-1 w-full mb-1"
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
                                                                                    className="border px-2 py-1 w-full mb-1"
                                                                                    disabled={!editedValues[medicine.lek_min_id]?.id_kategorii}
                                                                                >
                                                                                    <option value="">Wybierz podkategorię
                                                                                    </option>
                                                                                    {editedValues[medicine.lek_min_id]?.id_kategorii &&
                                                                                        ConstantsMedicine.SubCategoryOptions[editedValues[medicine.lek_min_id]?.id_kategorii]?.map(option => (
                                                                                            <option key={option.value}
                                                                                                    value={option.value}>
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
                                                                                    <option value="">Wybierz podpodkategorię
                                                                                    </option>
                                                                                    {editedValues[medicine.lek_min_id]?.id_kategorii &&
                                                                                        editedValues[medicine.lek_min_id]?.id_pod_kategorii &&
                                                                                        Array.isArray(ConstantsMedicine.SubSubCategoryOptions[editedValues[medicine.lek_min_id]?.id_kategorii]?.[editedValues[medicine.lek_min_id]?.id_pod_kategorii]) &&
                                                                                        ConstantsMedicine.SubSubCategoryOptions[editedValues[medicine.lek_min_id]?.id_kategorii][editedValues[medicine.lek_min_id]?.id_pod_kategorii].map(option => (
                                                                                            <option key={option.value}
                                                                                                    value={option.value}>
                                                                                                {option.label}
                                                                                            </option>
                                                                                        ))
                                                                                    }
                                                                                </select>
                                                                                <select
                                                                                    name="przechowywanie"
                                                                                    value={editedValues[medicine.lek_min_id]?.przechowywanie || medicine.leki_min_przechowywanie || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_min_id, "przechowywanie", e.target.value)}
                                                                                    className="border px-2 py-1 my-1 w-full"
                                                                                >
                                                                                    <option value="">Wybierz przechowywanie
                                                                                    </option>
                                                                                    {ConstantsMedicine.StoringOptions.map(option => (
                                                                                        <option key={option.value}
                                                                                                value={option.value}>
                                                                                            {option.label}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                                <select
                                                                                    name="na_statku_spis_podstawowy"
                                                                                    value={editedValues[medicine.lek_min_id]?.na_statku_spis_podstawowy || medicine.leki_min_na_statku_spis_podstawowy || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_min_id, "na_statku_spis_podstawowy", e.target.value)}
                                                                                    className="border px-2 py-1 w-full"
                                                                                >
                                                                                    <option value="">Spis Podstawowy Brak na
                                                                                        statku
                                                                                    </option>
                                                                                    <option value="1">Tak</option>
                                                                                    <option value="0">Nie</option>
                                                                                </select>
                                                                            </>
                                                                        ) : (
                                                                            medicine.lek_min_nazwa
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3 border-r border-l border-gray-700">
                                                                        {globalEditMode ? (
                                                                            <select
                                                                                value={editedValues[medicine.lek_min_id]?.pakowanie || ""}
                                                                                onChange={(e) => handleEdit(medicine.lek_min_id, "pakowanie", e.target.value)}
                                                                                className="border px-2 py-1 w-full"
                                                                            >
                                                                                <option value="">Wybierz opakowanie</option>
                                                                                {ConstantsMedicine.BoxTypeOptions.map(option => (
                                                                                    <option key={option.value}
                                                                                            value={option.value}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        ) : (
                                                                            medicine.lek_min_pakowanie
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3 border-r border-l border-gray-700">
                                                                        {globalEditMode ? (
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
                                                                    <td className="px-4 py-3 border border-gray-700 w-20 ">
                                                                        {!globalEditMode && (
                                                                            <button
                                                                                onClick={() => handleDelete(medicine.lek_min_id)}
                                                                                className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded flex items-center"
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
                            </React.Fragment>
                        ) : null;
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MinMedicine;