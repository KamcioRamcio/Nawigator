import React, {useEffect, useState, useRef} from "react";
import apiUrl from "../../constants/api.js";
import AddItemModal from "../../components/AddItemModal.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsEquipment from "../../constants/constantsEquipment.js";
import AddToOrderModal from '../../components/AddToOrderModal.jsx';
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import UtilizationButton from "../../components/UtilizationButton.jsx";
import { showEditButton, showDeleteButton, showUtilizationButton, showAddButton, showPredictedStatusButton, showOrderButton } from "../../constants/permisions.js";
import EquipmentStatusPreview from "../../components/EquipmentStatusPreview.jsx";
import toastService from '../../utils/toast.js';
import {apiError} from "../../utils/apiError.js";
// jsPDF + embedded font (~2MB) load only when a PDF is generated
const generateMainEqPDF = (...args) => import("../../utils/mainEqPdfGenerator.js").then((m) => m.generateMainEqPDF(...args));

function MainEquipmentList() {
    const [equipments, setEquipments] = useState([]);
    // Change from individual edit mode to global edit mode
    const [globalEditMode, setGlobalEditMode] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState({});

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const [hasChanges, setHasChanges] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user?.position || "viewer";
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [siteChange, setSiteChange] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [addEquipment, setAddEquipment] = useState(false);
    const [showActions, setShowActions] = useState({}) // Changed from boolean to object
    const [singleEditMode, setSingleEditMode] = useState({}); // Track which items are in single edit mode
    const [newEquipment, setNewEquipment] = useState({
        eq_nazwa: "",
        eq_ilosc_wymagana: "",
        eq_ilosc_aktualna: "",
        eq_data: "",
        eq_termin: "",
        eq_ilosc_termin: "",
        eq_na_statku: "",
        eq_torba_ratownika: "",
        eq_kategoria: "",
        eq_podkategoria: "",
    });

    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef(null);

    useEffect(() => {
        const calculateHeaderHeight = () => {
            const headerElement = headerRef.current;

            if (headerElement) {
                const headerRect = headerElement.getBoundingClientRect();
                setHeaderHeight(headerRect.height);
            }
        };

        // Calculate on mount and window resize
        calculateHeaderHeight();
        window.addEventListener('resize', calculateHeaderHeight);

        return () => window.removeEventListener('resize', calculateHeaderHeight);
    }, []);

    useEffect(() => {
        fetchEquipment();
        setCurrentDate(new Date().toLocaleDateString('pl-PL'));
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
            const response = await fetch(apiUrl + "sprzet-kategorie");
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
        if (userPosition === "viewer") {
            return;
        }

        const userEditFields = ["sprzet_ilosc_aktualna"]

        if (userPosition !== "admin" && !userEditFields.includes(field)) {
            alert("Tylko administrator może edytować te pola.");
            return;
        }

        // Handle boolean conversion explicitly
        let processedValue = value;
        if (field === "sprzet_na_statku" || field === "sprzet_torba_ratownika") {
            processedValue = value === "true" ? "true" : "false";
        }

        setEditedEquipment(prev => (
            {
                ...prev,
                [equipmentId]: {
                    ...prev[equipmentId],
                    [field]: processedValue,
                    ...(field === 'id_kategorii' ? {id_pod_kategorii: null} : {}),
                    sprzet_kto_zmienil: username
                }
            }
        ));

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
                        initialValues[equipment.sprzet_id] = {
                            ...equipment,
                            sprzet_na_statku: equipment.sprzet_na_statku === 1 ? "true" : "false",
                            sprzet_torba_ratownika: equipment.sprzet_torba_ratownika === 1 ? "true" : "false"
                        };
                    });
                });
            });

            setEditedEquipment(initialValues);
            setGlobalEditMode(true);
        }
    };

    const handleGeneratePDF = () => {
        const allEqData = [];

        Object.keys(equipments).forEach(category => {
            const categoryItems = equipments[category];
            Object.keys(categoryItems).forEach(subcategory => {
                const subcategoryItems = categoryItems[subcategory];
                subcategoryItems.forEach(equipment => {
                    if (matchesSearch(equipment)) {
                        allEqData.push({
                            nazwa: equipment.sprzet_nazwa,
                            ilosc: equipment.sprzet_ilosc_aktualna,
                            data: equipment.sprzet_data_waznosci,
                            ilosc_wymagana: equipment.sprzet_ilosc_wymagana,
                            uwagi: equipment.sprzet_status,
                            termin: equipment.sprzet_termin,
                            ilosc_termin: equipment.sprzet_ilosc_termin,
                            id_kategorii: equipment.id_kategorii,
                            id_pod_kategorii: equipment.id_pod_kategorii,
                        });
                    }
                });
            });
        })

        generateMainEqPDF(allEqData, currentDate);
        toastService.success("PDF został wygenerowany i pobrany");
    }

    const handleAddToOrderClick = (equipment) => {
        setSelectedEquipment(equipment);
        setIsOrderModalOpen(true);
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

                // Find the equipment in the nested structure, accounting for possible type mismatches
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

                // If equipment not found, handle gracefully
                if (!foundEquipment) {
                    console.error(`Equipment with ID ${equipmentId} not found in data`);
                    return { success: false, id: equipmentId, error: "Equipment not found in data structure" };
                }

                const response = await fetch(apiUrl + "sprzet/" + equipmentId, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
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

    // Function to enable editing for a single item
    const handleSingleEditToggle = (equipmentId) => {
        if (userPosition === "viewer") {
            return;
        }

        if (singleEditMode[equipmentId]) {
            // Exiting single edit mode for this item
            if (editedEquipment[equipmentId]) {
                if (!confirm("Masz niezapisane zmiany. Czy na pewno chcesz anulować edycję?")) {
                    return;
                }
            }
            setSingleEditMode(prev => ({
                ...prev,
                [equipmentId]: false
            }));
            // Clear edited values for this item
            setEditedEquipment(prev => {
                const newEdited = { ...prev };
                delete newEdited[equipmentId];
                return newEdited;
            });
        } else {
            // Entering single edit mode - find and initialize the equipment
            let foundEquipment = null;
            Object.keys(equipments).forEach(category => {
                const categoryItems = equipments[category];
                Object.keys(categoryItems).forEach(subcategory => {
                    const subcategoryItems = categoryItems[subcategory];
                    const found = subcategoryItems.find(eq => eq.sprzet_id === equipmentId);
                    if (found) {
                        foundEquipment = found;
                    }
                });
            });

            if (foundEquipment) {
                setEditedEquipment(prev => ({
                    ...prev,
                    [equipmentId]: {
                        ...foundEquipment,
                        sprzet_na_statku: foundEquipment.sprzet_na_statku === 1 ? "true" : "false",
                        sprzet_torba_ratownika: foundEquipment.sprzet_torba_ratownika === 1 ? "true" : "false"
                    }
                }));
                setSingleEditMode(prev => ({
                    ...prev,
                    [equipmentId]: true
                }));
            }
        }
    };

    // Function to save a single edited item
    const handleSaveSingle = async (equipmentId) => {
        if (!editedEquipment[equipmentId]) {
            toastService.info('Brak zmian do zapisania');
            return;
        }

        try {
            const response = await fetch(apiUrl + "sprzet/" + equipmentId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedEquipment[equipmentId])
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toastService.success('Zmiany zostały zapisane');

            // Exit single edit mode for this item
            setSingleEditMode(prev => ({
                ...prev,
                [equipmentId]: false
            }));

            // Clear edited values for this item
            setEditedEquipment(prev => {
                const newEdited = { ...prev };
                delete newEdited[equipmentId];
                return newEdited;
            });

            // Refresh data
            fetchEquipment();
        } catch (error) {
            console.error(`Error updating equipment ${equipmentId}:`, error);
            toastService.error('Błąd podczas zapisywania zmian');
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Convert from dd-mm-yyyy to yyyy-mm-dd
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
    };

    // Original save method preserved for compatibility
    const handleSave = async (equipmentId) => {
        try {
            const response = await fetch(apiUrl + "sprzet/" + equipmentId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedEquipment[equipmentId])
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toastService.success('Sprzęt został zaktualizowany pomyślnie');

            console.log('Equipment updated', editedEquipment[equipmentId]);
        } catch (error) {
            console.error('Fetch error:', error);
            toastService.error(`Błąd podczas aktualizacji sprzętu: ${error.message}`);
        }
        fetchEquipment()
    }

    const handleDelete = async (equipmentId) => {
        try {
            const response = await fetch(apiUrl + "sprzet/delete/" + equipmentId, {
                method: "DELETE",

            });
            if (!response.ok) {
                throw new Error(await apiError(response));
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
            ...prev,
            [name]: ["sprzet_kategoria", "sprzet_podkategoria"].includes(name) ? parseInt(value, 10) : value
        }))
    }

    const handleAddEquipment = async () => {
        try {
            const response = await fetch(apiUrl + "sprzet-all", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newEquipment)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toastService.success(`Sprzęt "${newEquipment.eq_nazwa}" został dodany pomyślnie`);
            handleAddEquipmentClose();
            setNewEquipment({
                eq_nazwa: "",
                eq_ilosc_wymagana: "",
                eq_ilosc_aktualna: "",
                eq_data: "",
                eq_termin: "",
                eq_ilosc_termin: "",
                eq_na_statku: "",
                eq_torba_ratownika: "",
                eq_kategoria: "",
                eq_podkategoria: "",
            });
        } catch (error) {
            console.error('Fetch error:', error);
            toastService.error(`Błąd podczas dodawania sprzętu: ${error.message}`);
        }
        fetchEquipment()
    }

    const renderStatusCheckButton = () => (
        showPredictedStatusButton(userPosition) && (
            <button
                onClick={() => setIsStatusModalOpen(true)}
                className="bg-slate-900 text-white text-lg px-4 py-2 rounded-xl hover:bg-slate-500"
            >
                Sprawdź statusy w przyszłej dacie
            </button>
        )
    );

    const [searchQuery, setSearchQuery] = useState("");
    const matchesSearch = (equipment) => {
        if (!searchQuery.trim() && statusFilter === "all") return true;

        const queryMatch = !searchQuery.trim() ||
            (equipment.sprzet_nazwa && equipment.sprzet_nazwa.toLowerCase().includes(searchQuery.toLowerCase()));

        const statusMatch = statusFilter === "all" ||
            equipment.sprzet_termin === statusFilter ||
            equipment.sprzet_ilosc_termin === statusFilter ||
            (statusFilter === "W zamówieniu" && equipment.sprzet_ilosc_termin?.includes("W zamówieniu"));
        ;

        return queryMatch && statusMatch;
    };

    const handleDeleteEquipment = (equipmentId) => {
        setConfirmAction(() => () => handleDelete(equipmentId));
        setConfirmMessage("Czy na pewno chcesz usunąć tę pozycję? Ta operacja jest nieodwracalna.");
        setConfirmDialogOpen(true);
    };

    const addItemModalContent = (
        <AddItemModal isOpen={addEquipment} onClose={handleAddEquipmentClose} title="Dodaj Wyposażenie">
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
                        {ConstantsEquipment.EquipmentStatusOptions.map(option => (
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
                        {ConstantsEquipment.StatusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Na statku
                    </label>
                    <select
                        name="eq_na_statku"
                        value={newEquipment.eq_na_statku}
                        onChange={handleInputEquipment}
                        className="border rounded-md p-2 w-full"
                    >
                        <option value="">Wybierz</option>
                        <option value="true">Tak</option>
                        <option value="false">Nie</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        W torbie ratownika
                    </label>
                    <select
                        name="eq_torba_ratownika"
                        value={newEquipment.eq_torba_ratownka}
                        onChange={handleInputEquipment}
                        className="border rounded-md p-2 w-full"
                    >
                        <option value="">Wybierz</option>
                        <option value="true">Tak</option>
                        <option value="false">Nie</option>
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
                    onClick={handleAddEquipment}
                >
                    Dodaj
                </button>
            </div>
        </AddItemModal>
    )

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                {/* Header Section */}
                <div ref={headerRef} className="md:sticky top-0 z-30 bg-white">
                    <div className="flex flex-col md:flex-row items-center justify-between py-3 md:py-3 px-4 md:px-8 border-b bg-gray-200">
                        {/* Left Section - Site Change Button and User Info */}
                        <div className="flex flex-col md:flex-row items-center">
                            <button
                                className="rounded-3xl bg-slate-900 text-white font-bold text-base md:text-lg p-2 md:p-3 mb-2 md:mb-0 md:mr-6 z-10"
                                onClick={handleSiteChangeOpen}
                            >
                                Zmiana Arkusza
                            </button>

                            <div className="flex flex-col items-start text-sm text-left">
                                <p className="text-red-800 font-semibold">
                                    Stan na dzień: {currentDate}
                                </p>
                                <p className="font-medium">
                                    Zalogowany jako {username}
                                </p>
                            </div>
                        </div>

                        {/* Center Section - Page Title */}
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 p-2 text-center">
                            Główny Spis Sprzętu
                        </h1>

                        {/* Right Section - Action Buttons */}
                        <div className="flex flex-row flex-wrap justify-center items-center gap-2 md:gap-3 mt-2 md:mt-0">
                            {/* Global edit button */}
                            {showEditButton(userPosition) && (
                                <button
                                    className={`rounded-3xl ${globalEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-base md:text-lg p-2 md:p-3 z-10`}
                                    onClick={globalEditMode ? handleSaveAll : handleGlobalEditToggle}
                                >
                                    {globalEditMode ? 'Zapisz wszystko' : 'Edytuj wszystko'}
                                </button>
                            )}

                            {/* Cancel edit button, only appears when in edit mode */}
                            {globalEditMode && showEditButton(userPosition) && (
                                <button
                                    className="rounded-3xl bg-gray-500 hover:bg-gray-600 text-white font-bold text-base md:text-lg p-2 md:p-3 z-10"
                                    onClick={handleGlobalEditToggle}
                                >
                                    Anuluj
                                </button>
                            )}

                            {/* PDF Generation Button */}
                            <button
                                className="bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-3xl p-2 md:p-3 flex items-center z-10"
                                onClick={handleGeneratePDF}
                            >
                                <span className="mr-1">📄</span> Generuj PDF
                            </button>

                            {/* Add Item Button */}
                            {showAddButton(userPosition) && (
                                <button
                                    className="rounded-3xl bg-slate-900 text-white font-bold text-base md:text-lg p-2 md:p-3 z-10"
                                    onClick={handleAddEquipmentOpen}
                                >
                                    Dodaj Pozycję
                                </button>
                            )}
                        </div>

                        {/* Add Medicine Modal */}
                        {addItemModalContent}

                        <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white z-20">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-6 py-3 px-3 md:px-0 border-b border-gray-200">
                            {renderStatusCheckButton()}

                            <div className="relative w-full md:w-1/3">
                                <input
                                    type="text"
                                    placeholder="Szukaj sprzęt..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Status Filter dropdown */}
                            <div className="relative w-full md:w-1/4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Wszystkie statusy</option>
                                    <option value="all">------------</option>
                                    <option value="W porządku">W porządku</option>
                                    <option value="Zamówione">Zamówione</option>
                                    <option value="W zamówieniu">W zamówieniu</option>
                                    <option value="Uwaga Ilość">Uwaga Ilość</option>
                                    <option value="Do zamówienia">Do zamówienia</option>
                                    <option value="all">------------</option>
                                    <option value="Ważny">Ważny</option>
                                    <option value="Przeterminowane">Przeterminowany</option>
                                    <option value="Ważność 1 miesiąc">Ważność 1 miesiąc</option>
                                    <option value="Ważność 3 miesiące">Ważność 3 miesiące</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Equipment Table Section */}
                <div className="relative max-md:overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead
                            className="bg-gray-200 z-10"
                            style={{top: `${headerHeight}px`}}
                        >
                        <tr className="text-gray-700 uppercase text-xs md:text-sm tracking-wider">
                            <th scope="col" className="px-2 py-3 text-left">Wyroby Medyczne</th>
                            <th scope="col" className="px-2 py-3 text-left">Ilość Aktualna</th>
                            <th scope="col" className="px-2 py-3 text-left">Data Ważności</th>
                            <th scope="col" className="px-2 py-3 text-left">Ilość Wymagana</th>
                            <th scope="col" className="px-2 py-3 text-left">Uwagi</th>
                            <th scope="col" className="px-2 py-3 text-left">Termin</th>
                            <th scope="col" className="px-2 py-3 text-left">Ilość/Termin</th>
                            <th scope="col" className="px-2 py-3 text-left">Kto Zmienił</th>
                            <th scope="col" className="px-2 py-3 text-left w-20">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(equipments).map((category, categoryIndex) => {
                            const categoryItems = equipments[category];
                            const hasCategoryMatches = categoryHasMatches(categoryItems);

                            return hasCategoryMatches ? (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-300 text-base md:text-xl">
                                        <td colSpan="9" className="font-bold p-2 md:p-4 bg-slate-900 text-white">
                                            {categoryIndex + 1}. {category}
                                        </td>
                                    </tr>
                                    {Object.keys(categoryItems).map((subcategory, subcategoryIndex) => {
                                        const showSubcategoryName = subcategory !== "null";
                                        const subcategoryItems = categoryItems[subcategory];
                                        const hasSubcategoryMatches = subcategoryHasMatches(subcategoryItems);

                                        return hasSubcategoryMatches ? (
                                            <React.Fragment key={subcategory}>
                                                {showSubcategoryName && (
                                                    <tr className="bg-gray-200 text-sm md:text-base">
                                                        <td colSpan="9"
                                                            className="p-2 pl-4 md:p-4 md:pl-6 font-semibold bg-slate-700 text-white">
                                                            {categoryIndex + 1}.{subcategoryIndex + 1}. {subcategory}
                                                        </td>
                                                    </tr>
                                                )}
                                                {subcategoryItems
                                                    .filter(matchesSearch)
                                                    .map(equipment => (
                                                        <tr key={equipment.sprzet_id}
                                                            className={`${equipment.sprzet_torba_ratownika === 1 ? "bg-green-100" : ""} border-b border-gray-200 hover:bg-gray-50`}>
                                                            <td className="px-2 py-2 md:py-4  text-sm max-w-[150px] md:max-w-[250px] overflow-hidden text-ellipsis">
                                                                {(globalEditMode || singleEditMode[equipment.sprzet_id]) ? (
                                                                    <div className="flex flex-col space-y-1">
                                                                        <textarea
                                                                            value={editedEquipment[equipment.sprzet_id]?.sprzet_nazwa || ""}
                                                                            onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_nazwa", e.target.value)}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                            rows={3}
                                                                        />
                                                                        <select
                                                                            name="id_kategorii"
                                                                            value={editedEquipment[equipment.sprzet_id]?.id_kategorii || ""}
                                                                            onChange={(e) => {
                                                                                handleEdit(equipment.sprzet_id, "id_kategorii", e.target.value)
                                                                            }}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        >
                                                                            <option value="">Wybierz kategorię</option>
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
                                                                            }}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        >
                                                                            <option value="">Wybierz podkategorię</option>
                                                                            {ConstantsEquipment.SubCategoryOptions[editedEquipment[equipment.sprzet_id]?.id_kategorii]?.map(option => (
                                                                                <option key={option.value} value={option.value}>
                                                                                    {option.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <select
                                                                            name="sprzet_na_statku"
                                                                            value={editedEquipment[equipment.sprzet_id]?.sprzet_na_statku || ""}
                                                                            onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_na_statku", e.target.value)}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        >
                                                                            <option value="">Spis Podstawowy brak na statku</option>
                                                                            <option value="true">Tak</option>
                                                                            <option value="false">Nie</option>
                                                                        </select>
                                                                        <select
                                                                            name="sprzet_torba_ratownika"
                                                                            value={editedEquipment[equipment.sprzet_id]?.sprzet_torba_ratownika || ""}
                                                                            onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_torba_ratownika", e.target.value)}
                                                                            className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        >
                                                                            <option value="">W torbie ratownika</option>
                                                                            <option value="true">Tak</option>
                                                                            <option value="false">Nie</option>
                                                                        </select>
                                                                    </div>
                                                                ) : (
                                                                    <div className="max-h-32 overflow-y-auto wrap-break-word">{
                                                                        equipment.sprzet_nazwa
                                                                    }</div>
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                {(globalEditMode || singleEditMode[equipment.sprzet_id]) ? (
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
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                {(globalEditMode || singleEditMode[equipment.sprzet_id]) ? (
                                                                    <input
                                                                        type="date"
                                                                        value={formatDateForInput(editedEquipment[equipment.sprzet_id]?.sprzet_data_waznosci) || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_data_waznosci", e.target.value)}
                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                    />
                                                                ) : (
                                                                    equipment.sprzet_data_waznosci
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                {(globalEditMode || singleEditMode[equipment.sprzet_id]) ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_wymagana || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_wymagana", e.target.value)}
                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                    />
                                                                ) : (
                                                                    equipment.sprzet_ilosc_wymagana
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 text-sm">
                                                                {(globalEditMode || singleEditMode[equipment.sprzet_id]) ? (
                                                                    <textarea
                                                                        value={editedEquipment[equipment.sprzet_id]?.sprzet_status || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_status", e.target.value)}
                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                        rows={3}
                                                                    />
                                                                ) : (
                                                                    <div className="max-h-32 max-w-64 overflow-y-auto wrap-break-word">
                                                                        {equipment.sprzet_status}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className={`${equipment.sprzet_termin !== "Ważny" ? "font-bold text-red-700" : ""} px-2 py-2 md:py-4 whitespace-nowrap text-sm`}>
                                                                {equipment.sprzet_termin}
                                                            </td>
                                                            <td className={`
                                                                ${equipment.sprzet_ilosc_termin === "W porządku" ? "font-bold text-green-600" : ""}
                                                                ${equipment.sprzet_ilosc_termin === "Zamówione" ? "font-bold text-blue-600" : ""}
                                                                ${equipment.sprzet_ilosc_termin?.includes("W zamówieniu") ? "font-bold text-violet-600" : ""}
                                                                ${(equipment.sprzet_ilosc_termin === "Uwaga Ilość" || equipment.sprzet_ilosc_termin === "Do zamówienia") ? "font-bold text-orange-600" : ""}
                                                                px-2 py-2 md:py-4 whitespace-nowrap text-sm
                                                            `}>
                                                                {equipment.sprzet_ilosc_termin}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                {equipment.sprzet_kto_zmienil}
                                                            </td>
                                                            <td className="px-2 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex flex-col space-y-1">
                                                                    {/* Toggle Button for Actions */}
                                                                    <button
                                                                        onClick={() => setShowActions(prev => ({
                                                                            ...prev,
                                                                            [equipment.sprzet_id]: !prev[equipment.sprzet_id]
                                                                        }))}
                                                                        className="text-gray-600 text-sm py-1 px-1 rounded-sm hover:bg-gray-200"
                                                                    >
                                                                        {showActions[equipment.sprzet_id] ? '⬆️' : '⚙️'}
                                                                    </button>

                                                                    {showActions[equipment.sprzet_id] && (
                                                                        <div className="flex flex-col space-y-1 mt-1">
                                                                            {/* Show Edit/Save button when not in global edit mode */}
                                                                            {showEditButton(userPosition) && !globalEditMode && (
                                                                                singleEditMode[equipment.sprzet_id] ? (
                                                                                    <div className="flex flex-col space-y-1">
                                                                                        <button
                                                                                            onClick={() => handleSaveSingle(equipment.sprzet_id)}
                                                                                            className="bg-green-100 text-green-700 text-xs py-1 px-2 rounded-sm hover:bg-green-200 flex items-center justify-center"
                                                                                        >
                                                                                            <span className="mr-1">💾</span>Zapisz
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleSingleEditToggle(equipment.sprzet_id)}
                                                                                            className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded-sm hover:bg-gray-200 flex items-center justify-center"
                                                                                        >
                                                                                            <span className="mr-1">✖️</span>Anuluj
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => handleSingleEditToggle(equipment.sprzet_id)}
                                                                                        className="bg-yellow-100 text-yellow-700 text-xs py-1 px-2 rounded-sm hover:bg-yellow-200 flex items-center justify-center"
                                                                                    >
                                                                                        <span className="mr-1">✏️</span>Edytuj
                                                                                    </button>
                                                                                )
                                                                            )}

                                                                            {showDeleteButton(userPosition) && !globalEditMode && !singleEditMode[equipment.sprzet_id] && (
                                                                                <button
                                                                                    onClick={() => handleDeleteEquipment(equipment.sprzet_id)}
                                                                                    className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded-sm hover:bg-red-200 flex items-center justify-center"
                                                                                >
                                                                                    <span className="mr-1">🗑️</span>Usuń
                                                                                </button>
                                                                            )}

                                                                            {showOrderButton(userPosition) && !globalEditMode && !singleEditMode[equipment.sprzet_id] && (
                                                                                <button
                                                                                    onClick={() => handleAddToOrderClick(equipment)}
                                                                                    className="bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded-sm hover:bg-blue-200 flex items-center justify-center"
                                                                                >
                                                                                    <span className="mr-1">🛒</span>Zamów
                                                                                </button>
                                                                            )}

                                                                            {showUtilizationButton(userPosition) && !globalEditMode && !singleEditMode[equipment.sprzet_id] && (
                                                                                <UtilizationButton item={equipment} itemType="equipment" onUtilizationComplete={fetchEquipment} />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
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
            <EquipmentStatusPreview
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}/>
            <AddToOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                equipment={selectedEquipment}
            />

            <ConfirmDialog
                isOpen={confirmDialogOpen}
                message={confirmMessage}
                onConfirm={() => {
                    setConfirmDialogOpen(false);
                    confirmAction && confirmAction();
                }}
                onCancel={() => setConfirmDialogOpen(false)}
            />
        </div>
    )
}

export default MainEquipmentList;
