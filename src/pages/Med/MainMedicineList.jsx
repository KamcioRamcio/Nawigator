import React, {useEffect, useState, useRef} from "react";
import apiUrl from "../../constants/api.js";
import AddItemModal from "../../components/AddItemModal.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsMedicine from "../../constants/constantsMedicine.js";
import AddToOrderModal from '../../components/AddToOrderModal.jsx';
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import UtilizationButton from "../../components/UtilizationButton.jsx";
import {
    showEditButton,
    showDeleteButton,
    showUtilizationButton,
    showAddButton,
    showPredictedStatusButton,
    showOrderButton
} from "../../constants/permisions.js";
import MedicineStatusPreview from "../../components/MedicineStatusPreview.jsx";
import toastService from '../../utils/toast.js';
import {generateMainMedicinePDF} from '../../utils/mainMedicinePdfGenerator.js';


function MainMedicineList() {
    const [medicines, setMedicines] = useState([]);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const [globalEditMode, setGlobalEditMode] = useState(false);
    const [editedValues, setEditedValues] = useState({});
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user.position || "viewer";
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [medicineAdd, setMedicineAdd] = useState(false);
    const [siteChange, setSiteChange] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionsVisibility, setActionsVisibility] = useState({});
    const [singleEditMode, setSingleEditMode] = useState({}); // Track which items are in single edit mode
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [newMedicine, setNewMedicine] = useState({
        lek_nazwa: "",
        lek_ilosc: "",
        lek_opakowanie: "",
        lek_data: "",
        lek_status: "",
        lek_ilosc_minimalna: "",
        lek_przechowywanie: "",
        lek_na_statku_spis_podstawowy: "",
        lek_kategoria: "",
        lek_podkategoria: "",
        lek_podpodkategoria: "",
    });
    // Track whether there are unsaved changes
    const [hasChanges, setHasChanges] = useState(false);

    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef(null);


    // Date formatting
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Convert from dd-mm-yyyy to yyyy-mm-dd
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetchAllData();
        setCurrentDate(new Date().toLocaleDateString('pl-PL'));
    }, []);

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

    const handleGeneratePDF = () => {
        // Prepare data for all medicines in the table
        const allMedicineData = [];

        Object.keys(medicines).forEach(category => {
            const categoryItems = medicines[category];
            Object.keys(categoryItems).forEach(subcategory => {
                const subcategoryItems = categoryItems[subcategory];
                Object.keys(subcategoryItems).forEach(subsubcategory => {
                    const medicineItems = subcategoryItems[subsubcategory];
                    medicineItems.forEach(medicine => {
                        if (matchesSearch(medicine)) {
                            allMedicineData.push({
                                nazwa: medicine.lek_nazwa,
                                ilosc: medicine.lek_ilosc,
                                opakowanie: medicine.lek_opakowanie,
                                data: medicine.lek_data,
                                status: medicine.lek_status,
                                ilos_mininalna: medicine.lek_ilosc_minimalna,
                                rozchod_ilosc: medicine.rozchod_ilosc,
                                stan_magazynowy_status: medicine.stan_magazynowy_status,
                                id_kategorii: medicine.id_kategorii,
                                id_pod_kategorii: medicine.id_pod_kategorii,
                                id_pod_pod_kategorii: medicine.id_pod_pod_kategorii,
                                rozchod_kto_zmienil: medicine.rozchod_kto_zmienil,
                                stan_magazynowy_important_status: medicine.stan_magazynowy_important_status,
                            });
                        }
                    });
                });
            });
        });


        // Generate the PDF with the formatted date
        generateMainMedicinePDF(allMedicineData, currentDate);
        toastService.success("PDF został wygenerowany i pobrany");
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
    const handleAddToOrderClick = (medicine) => {
        setSelectedMedicine(medicine);
        setIsOrderModalOpen(true);
    };



    // Modified handle edit to work with global edit mode
    const handleEdit = (medicineId, field, value) => {
        if (userPosition === "viewer") {
            return
        }

        const userEditFields = ["rozchod_ilosc", "stan_magazynowy_ilosc"]

        if (userPosition !== "admin" && !userEditFields.includes(field)) {
            alert("Tylko administartor może edytować te pola");
            return;
        }

        if (field === 'id_kategorii') {
            setEditedValues(prev => ({
                ...prev,
                [medicineId]: {
                    ...prev[medicineId],
                    [field]: value,
                    id_pod_kategorii: null,
                    id_pod_pod_kategorii: null,
                    rozchod_kto_zmienil: username
                }
            }));
        } else if (field === 'id_pod_kategorii') {
            setEditedValues(prev => ({
                ...prev,
                [medicineId]: {
                    ...prev[medicineId],
                    [field]: value,
                    id_pod_pod_kategorii: null,
                    rozchod_kto_zmienil: username
                }
            }));
        } else {
            setEditedValues(prev => ({
                ...prev,
                [medicineId]: {
                    ...prev[medicineId],
                    [field]: value,
                    rozchod_kto_zmienil: username
                }
            }));
        }

        // Set hasChanges flag to true
        setHasChanges(true);
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
                            initialValues[medicine.lek_id] = {...medicine};
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

        const savePromises = medicineIds.map(async (medicineId) => {
            try {
                const dataToSend = {...editedValues[medicineId]};

                if (dataToSend.id_kategorii === '') dataToSend.id_kategorii = null;
                if (dataToSend.id_pod_kategorii === '') dataToSend.id_pod_kategorii = null;
                if (dataToSend.id_pod_pod_kategorii === '') dataToSend.id_pod_pod_kategorii = null;
                if (dataToSend.lek_data) {
                    // Check if it's already in yyyy-MM-dd format
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dataToSend.lek_data)) {
                        const [year, month, day] = dataToSend.lek_data.split('-');
                        dataToSend.lek_data = `${day}-${month}-${year}`;
                    }
                    // If it's already in dd-MM-yyyy format, no conversion needed
                }

                const response = await fetch(apiUrl + "leki/" + medicineId, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataToSend),
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

    // Function to enable editing for a single medicine item
    const handleSingleEditToggle = (medicineId) => {
        if (userPosition === "viewer") {
            return;
        }

        if (singleEditMode[medicineId]) {
            // Exiting single edit mode for this item
            if (editedValues[medicineId]) {
                if (!confirm("Masz niezapisane zmiany. Czy na pewno chcesz anulować edycję?")) {
                    return;
                }
            }
            setSingleEditMode(prev => ({
                ...prev,
                [medicineId]: false
            }));
            // Clear edited values for this item
            setEditedValues(prev => {
                const newEdited = { ...prev };
                delete newEdited[medicineId];
                return newEdited;
            });
        } else {
            // Entering single edit mode - find and initialize the medicine
            let foundMedicine = null;
            Object.keys(medicines).forEach(category => {
                const categoryItems = medicines[category];
                Object.keys(categoryItems).forEach(subcategory => {
                    const subcategoryItems = categoryItems[subcategory];
                    Object.keys(subcategoryItems).forEach(subsubcategory => {
                        const medicineItems = subcategoryItems[subsubcategory];
                        const found = medicineItems.find(med => med.lek_id === medicineId);
                        if (found) {
                            foundMedicine = found;
                        }
                    });
                });
            });

            if (foundMedicine) {
                setEditedValues(prev => ({
                    ...prev,
                    [medicineId]: { ...foundMedicine }
                }));
                setSingleEditMode(prev => ({
                    ...prev,
                    [medicineId]: true
                }));
            }
        }
    };

    // Function to save a single edited medicine item
    const handleSaveSingle = async (medicineId) => {
        if (!editedValues[medicineId]) {
            toastService.info('Brak zmian do zapisania');
            return;
        }

        try {
            const dataToSend = {...editedValues[medicineId]};

            if (dataToSend.id_kategorii === '') dataToSend.id_kategorii = null;
            if (dataToSend.id_pod_kategorii === '') dataToSend.id_pod_kategorii = null;
            if (dataToSend.id_pod_pod_kategorii === '') dataToSend.id_pod_pod_kategorii = null;
            if (dataToSend.lek_data) {
                // Check if it's already in yyyy-MM-dd format
                if (/^\d{4}-\d{2}-\d{2}$/.test(dataToSend.lek_data)) {
                    const [year, month, day] = dataToSend.lek_data.split('-');
                    dataToSend.lek_data = `${day}-${month}-${year}`;
                }
                // If it's already in dd-MM-yyyy format, no conversion needed
            }

            const response = await fetch(apiUrl + "leki/" + medicineId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toastService.success('Zmiany zostały zapisane');

            // Exit single edit mode for this item
            setSingleEditMode(prev => ({
                ...prev,
                [medicineId]: false
            }));

            // Clear edited values for this item
            setEditedValues(prev => {
                const newEdited = { ...prev };
                delete newEdited[medicineId];
                return newEdited;
            });

            // Refresh data
            fetchMedicines();
        } catch (error) {
            console.error(`Error updating medicine ${medicineId}:`, error);
            toastService.error('Błąd podczas zapisywania zmian');
        }
    };


    const handleInputMedicine = (e) => {
        const {name, value} = e.target;
        setNewMedicine((prev) => ({
            ...prev,
            [name]: ["lek_kategoria", "lek_podkategoria", "lek_podpodkategoria"].includes(name) ? parseInt(value, 10) : value
        }));
    };

    const handleAddMedicine = async () => {
        try {
            if (!newMedicine.lek_nazwa || newMedicine.lek_nazwa.trim() === "") {
                alert("Nazwa leku jest wymagana");
                return;
            }

            if (!newMedicine.lek_kategoria) {
                alert("Kategoria jest wymagana");
                return;
            }

            const payload = {
                lek_nazwa: newMedicine.lek_nazwa,
                lek_ilosc: newMedicine.lek_ilosc || "",
                lek_opakowanie: newMedicine.lek_opakowanie || "",
                lek_data: newMedicine.lek_data || "",
                lek_status: newMedicine.lek_status || "",
                lek_ilosc_minimalna: newMedicine.lek_ilosc_minimalna || "",
                lek_przechowywanie: newMedicine.lek_przechowywanie || "",
                lek_na_statku_spis_podstawowy: newMedicine.lek_na_statku_spis_podstawowy || "",
                lek_kategoria: newMedicine.lek_kategoria || null,
                lek_podkategoria: newMedicine.lek_podkategoria || null,
                lek_podpodkategoria: newMedicine.lek_podpodkategoria || null,
            };

            const response = await fetch(apiUrl + "leki-all", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
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
                lek_na_statku_spis_podstawowy: "",
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


    const handleDeleteMedicine = (medicineId) => {
        setConfirmMessage("Czy na pewno chcesz usunąć tę pozycję? Ta operacja jest nieodwracalna.");
        setConfirmAction(() => () => performDeleteMedicine(medicineId));
        setConfirmDialogOpen(true);
    };

    const performDeleteMedicine = async (medicineId) => {
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

    const matchesSearch = (medicine) => {
        if (!searchQuery.trim() && statusFilter === "all") return true;

        const queryMatch = !searchQuery.trim() ||
            medicine.lek_nazwa?.toLowerCase().includes(searchQuery.toLowerCase());

        const statusMatch = statusFilter === "all" ||
            medicine.stan_magazynowy_status === statusFilter ||
            medicine.lek_status === statusFilter ||
            (statusFilter === "W zamówieniu" &&
                medicine.stan_magazynowy_status?.includes("W zamówieniu"));

        return queryMatch && statusMatch;
    };


    // AddItemModal content stored in a variable
    const addItemModalContent = (
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
                        step="0.05"
                        name="lek_ilosc"
                        value={newMedicine.lek_ilosc}
                        onChange={handleInputMedicine}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opakowanie
                    </label>
                    <select
                        name="lek_opakowanie"
                        value={newMedicine.lek_opakowanie}
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
                        Status leku
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
                        Ilość minimalna
                    </label>
                    <input
                        type="number"
                        step="0.05"
                        name="lek_ilosc_minimalna"
                        value={newMedicine.lek_ilosc_minimalna}
                        onChange={handleInputMedicine}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Na statku spis
                        podstawowy?</label>
                    <select
                        name="lek_na_statku_spis_podstawowy"
                        value={newMedicine.na_statku_spis_podstawowy}
                        onChange={handleInputMedicine}
                        className="border rounded-md p-2 w-full"
                    >
                        <option value="">Wybierz statku spis podstawowy</option>
                        <option value="1">Tak</option>
                        <option value="0">Nie</option>
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
    );


    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                {/* Header Section */}
                <div ref={headerRef} className="sticky top-0 z-30 bg-white">
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
                            Główny Spis Leków
                        </h1>

                        {/* Right Section - Action Buttons */}
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mt-2 md:mt-0">
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
                                    onClick={handleAddMedicineOpen}
                                >
                                    Dodaj Pozycję
                                </button>
                            )}
                        </div>

                        {/* Add Medicine Modal */}
                        {addItemModalContent}

                        <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
                    </div>

                    {/* Search and Filter Section - Sticks below header */}
                    <div className="bg-white z-20 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 py-3">
                            {renderStatusCheckButton()}

                            <div className="relative w-full md:w-1/3">
                                <input
                                    type="text"
                                    placeholder="Szukaj leków..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                {/* Medicines Table Section */}
                <div className="relative">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead
                            className="bg-gray-200 sticky"
                            style={{top: `${headerHeight}px`}}
                        >
                        <tr className="text-gray-700 uppercase text-xs md:text-sm tracking-wider">
                            <th scope="col" className="px-2 py-3 text-left">Nazwa Leku</th>
                            <th scope="col" className="px-2 py-3 text-left">Ilość</th>
                            <th scope="col" className="px-2 py-3 text-left">Opakowanie</th>
                            <th scope="col" className="px-2 py-3 text-left">Data ważności</th>
                            <th scope="col" className="px-2 py-3 text-left">Status leku</th>
                            <th scope="col" className="px-2 py-3 text-left">Ilość minimalna</th>
                            <th scope="col" className="px-2 py-3 text-left">Rozchód</th>
                            <th scope="col" className="px-2 py-3 text-left">Aktualnie na statku</th>
                            <th scope="col" className="px-2 py-3 text-left">Status</th>
                            <th scope="col" className="px-2 py-3 text-left">Uwagi</th>
                            <th scope="col" className="px-2 py-3 text-left">Kto Zmienił</th>
                            <th scope="col" className="px-2 py-3 text-left w-20">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(medicines).map((category, categoryIndex) => {
                            const categoryItems = medicines[category];
                            const hasCategoryMatches = categoryHasMatches(categoryItems);

                            return hasCategoryMatches ? (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-300 text-base md:text-xl">
                                        <td colSpan="12" className="font-bold p-2 md:p-4 bg-slate-900 text-white">
                                            {categoryIndex + 1}. {category === 'Uncategorized' ? 'Brak kategorii' : category}
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
                                                        <td colSpan="12" className="p-2 pl-4 md:p-4 md:pl-6 font-semibold bg-slate-700 text-white">{categoryIndex + 1}.{subcategoryIndex + 1}. {subcategory}</td>
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
                                                                    <td colSpan="12" className="pl-4 md:pl-6 py-2 bg-slate-600 text-white">
                                                                        {categoryIndex + 1}.{subcategoryIndex + 1}.{indexToLetter(subsubcategoryIndex)}. {subsubcategory}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {subsubcategoryItems
                                                                .filter(matchesSearch)
                                                                .map(medicine => (
                                                                    <tr key={medicine.lek_id}
                                                                        className={`${medicine.lek_przechowywanie === "freezer" ? "bg-blue-100" : medicine.lek_przechowywanie === "narkotyk" ? "bg-orange-100" : ""} ${medicine.lek_na_statku_spis_podstawowy === 1 ? "text-red-600" : "text-gray-900"} border-b border-gray-200 hover:bg-gray-50`}>
                                                                        <td className="px-2 py-2 md:py-4  text-sm max-w-[150px] md:max-w-[250px] overflow-hidden text-ellipsis">
                                                                            {(globalEditMode || singleEditMode[medicine.lek_id]) ? (
                                                                                <div className="flex flex-col space-y-1">
                                                                                    <textarea
                                                                                        rows={3}
                                                                                        value={editedValues[medicine.lek_id]?.lek_nazwa || ""}
                                                                                        onChange={(e) => handleEdit(medicine.lek_id, "lek_nazwa", e.target.value)}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                    />
                                                                                    <select
                                                                                        name="id_kategorii"
                                                                                        value={editedValues[medicine.lek_id]?.id_kategorii || ""}
                                                                                        onChange={(e) => {
                                                                                            const newCategory = e.target.value ? parseInt(e.target.value, 10) : "";
                                                                                            handleEdit(medicine.lek_id, "id_kategorii", newCategory);
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
                                                                                            const newSubCategory = e.target.value ? parseInt(e.target.value, 10) : "";
                                                                                            handleEdit(medicine.lek_id, "id_pod_kategorii", newSubCategory);
                                                                                        }}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                        disabled={!editedValues[medicine.lek_id]?.id_kategorii}
                                                                                    >
                                                                                        <option value="">Wybierz podkategorię</option>
                                                                                        {editedValues[medicine.lek_id]?.id_kategorii &&
                                                                                            ConstantsMedicine.SubCategoryOptions[editedValues[medicine.lek_id]?.id_kategorii]?.map(option => (
                                                                                                <option key={option.value} value={option.value}>
                                                                                                    {option.label}
                                                                                                </option>
                                                                                            ))
                                                                                        }
                                                                                    </select>
                                                                                    <select
                                                                                        name="id_pod_pod_kategorii"
                                                                                        value={editedValues[medicine.lek_id]?.id_pod_pod_kategorii || ""}
                                                                                        onChange={(e) => {
                                                                                            const newSubSubCategory = e.target.value ? parseInt(e.target.value, 10) : "";
                                                                                            handleEdit(medicine.lek_id, "id_pod_pod_kategorii", newSubSubCategory);
                                                                                        }}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                        disabled={!editedValues[medicine.lek_id]?.id_pod_kategorii}
                                                                                    >
                                                                                        <option value="">Wybierz podpodkategorię</option>
                                                                                        {editedValues[medicine.lek_id]?.id_kategorii && editedValues[medicine.lek_id]?.id_pod_kategorii &&
                                                                                            Array.isArray(ConstantsMedicine.SubSubCategoryOptions[editedValues[medicine.lek_id]?.id_kategorii]?.[editedValues[medicine.lek_id]?.id_pod_kategorii]) &&
                                                                                            ConstantsMedicine.SubSubCategoryOptions[editedValues[medicine.lek_id]?.id_kategorii][editedValues[medicine.lek_id]?.id_pod_kategorii].map(option => (
                                                                                                <option key={option.value} value={option.value}>
                                                                                                    {option.label}
                                                                                                </option>
                                                                                            ))
                                                                                        }
                                                                                    </select>
                                                                                    <select
                                                                                        name="lek_przechowywanie"
                                                                                        value={editedValues[medicine.lek_id]?.lek_przechowywanie || ""}
                                                                                        onChange={(e) => handleEdit(medicine.lek_id, "lek_przechowywanie", e.target.value)}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                    >
                                                                                        <option value="">Wybierz przechowywanie</option>
                                                                                        {ConstantsMedicine.StoringOptions.map(option => (
                                                                                            <option key={option.value} value={option.value}>
                                                                                                {option.label}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                    <select
                                                                                        name="lek_na_statku_spis_podstawowy"
                                                                                        value={editedValues[medicine.lek_id]?.lek_na_statku_spis_podstawowy || ""}
                                                                                        onChange={(e) => handleEdit(medicine.lek_id, "lek_na_statku_spis_podstawowy", e.target.value)}
                                                                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                    >
                                                                                        <option value="">Spis Podstawowy brak na statku</option>
                                                                                        <option value="1">Tak</option>
                                                                                        <option value="0">Nie</option>
                                                                                    </select>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="max-h-32 overflow-y-auto break-words">{medicine.lek_nazwa}</div>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {(globalEditMode || singleEditMode[medicine.lek_id]) ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={editedValues[medicine.lek_id]?.lek_ilosc || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_id, "lek_ilosc", e.target.value)}
                                                                                    className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                />
                                                                            ) : (
                                                                                medicine.lek_ilosc
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {(globalEditMode || singleEditMode[medicine.lek_id]) ? (
                                                                                <select
                                                                                    value={editedValues[medicine.lek_id]?.lek_opakowanie || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_id, "lek_opakowanie", e.target.value)}
                                                                                    className="border rounded-md px-2 py-1 w-full text-sm"
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
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {(globalEditMode || singleEditMode[medicine.lek_id]) ? (
                                                                                <input
                                                                                    type="date"
                                                                                    value={formatDateForInput(editedValues[medicine.lek_id]?.lek_data) || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_id, "lek_data", formatDateForInput(e.target.value) )}
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
                                                                            {(globalEditMode || singleEditMode[medicine.lek_id]) ? (
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
                                                                            {(globalEditMode || singleEditMode[medicine.lek_id]) ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={editedValues[medicine.lek_id]?.rozchod_ilosc || ""}
                                                                                    onChange={(e) => handleEdit(medicine.lek_id, "rozchod_ilosc", e.target.value)}
                                                                                    className="border rounded-md px-2 py-1 w-full text-sm"
                                                                                />
                                                                            ) : (
                                                                                medicine.rozchod_ilosc
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {medicine.stan_magazynowy_ilosc}
                                                                        </td>
                                                                        <td className={`
                                                                            ${medicine.stan_magazynowy_status === "W porządku" ? "font-bold text-green-600" : ""}
                                                                            ${medicine.stan_magazynowy_status === "Zamówione" ? "font-bold text-blue-600" : ""}
                                                                            ${medicine.stan_magazynowy_status?.includes("W zamówieniu") ? "font-bold text-violet-600" : ""}
                                                                            ${(medicine.stan_magazynowy_status === "Uwaga Ilość" || medicine.stan_magazynowy_status === "Do zamówienia") ? "font-bold text-orange-600" : ""}
                                                                            px-2 py-2 md:py-4 whitespace-nowrap text-sm
                                                                        `}>
                                                                            {medicine.stan_magazynowy_status}
                                                                        </td>
                            <td className="px-2 py-2 md:py-4 text-sm">
                                {(globalEditMode || singleEditMode[medicine.lek_id]) ? (
                                    <textarea
                                        value={editedValues[medicine.lek_id]?.stan_magazynowy_important_status || ""}
                                        onChange={(e) => handleEdit(medicine.lek_id, "stan_magazynowy_important_status", e.target.value)}
                                        className="border rounded-md px-2 py-1 w-full text-sm"
                                        rows="3"
                                    />
                                ) : (
                                    <div className="max-h-32 max-w-72 overflow-y-auto break-words">
                                        {medicine.stan_magazynowy_important_status === "0" ? "" : medicine.stan_magazynowy_important_status}
                                    </div>
                                )}
                            </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-sm">
                                                                            {medicine.rozchod_kto_zmienil}
                                                                        </td>
                                                                        <td className="px-2 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                            <div className="flex flex-col space-y-1">
                                                                                {/* Toggle Button for Actions */}
                                                                                <button
                                                                                    onClick={() => setActionsVisibility(prev => ({
                                                                                        ...prev,
                                                                                        [medicine.lek_id]: !prev[medicine.lek_id]
                                                                                    }))}
                                                                                    className="text-gray-600 text-sm py-1 px-1 rounded hover:bg-gray-200"
                                                                                >
                                                                                    {actionsVisibility[medicine.lek_id] ? '⬆️' : '⚙️'}
                                                                                </button>

                                                                                {actionsVisibility[medicine.lek_id] && (
                                                                                    <div className="flex flex-col space-y-1 mt-1">
                                                                                        {/* Show Edit/Save button when not in global edit mode */}
                                                                                        {showEditButton(userPosition) && !globalEditMode && (
                                                                                            singleEditMode[medicine.lek_id] ? (
                                                                                                <div className="flex flex-col space-y-1">
                                                                                                    <button
                                                                                                        onClick={() => handleSaveSingle(medicine.lek_id)}
                                                                                                        className="bg-green-100 text-green-700 text-xs py-1 px-2 rounded hover:bg-green-200 flex items-center justify-center"
                                                                                                    >
                                                                                                        <span className="mr-1">💾</span>Zapisz
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => handleSingleEditToggle(medicine.lek_id)}
                                                                                                        className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded hover:bg-gray-200 flex items-center justify-center"
                                                                                                    >
                                                                                                        <span className="mr-1">✖️</span>Anuluj
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <button
                                                                                                    onClick={() => handleSingleEditToggle(medicine.lek_id)}
                                                                                                    className="bg-yellow-100 text-yellow-700 text-xs py-1 px-2 rounded hover:bg-yellow-200 flex items-center justify-center"
                                                                                                >
                                                                                                    <span className="mr-1">✏️</span>Edytuj
                                                                                                </button>
                                                                                            )
                                                                                        )}

                                                                                        {showDeleteButton(userPosition) && !globalEditMode && !singleEditMode[medicine.lek_id] && (
                                                                                            <button
                                                                                                onClick={() => handleDeleteMedicine(medicine.lek_id)}
                                                                                                className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded hover:bg-red-200 flex items-center justify-center"
                                                                                            >
                                                                                                <span className="mr-1">🗑️</span>Usuń
                                                                                            </button>
                                                                                        )}

                                                                                        {showOrderButton(userPosition) && !globalEditMode && !singleEditMode[medicine.lek_id] && (
                                                                                            <button
                                                                                                onClick={() => handleAddToOrderClick(medicine)}
                                                                                                className="bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded hover:bg-blue-200 flex items-center justify-center"
                                                                                            >
                                                                                                <span className="mr-1">🛒</span>Zamów
                                                                                            </button>
                                                                                        )}

                                                                                        {showUtilizationButton(userPosition) && !globalEditMode && !singleEditMode[medicine.lek_id] && (
                                                                                            <UtilizationButton item={medicine} itemType="medicine" onUtilizationComplete={fetchMedicines} />
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
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
            <MedicineStatusPreview
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
            />
            <AddToOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                medicine={selectedMedicine}
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
    );
}

export default MainMedicineList
