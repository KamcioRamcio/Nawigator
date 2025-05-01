import React, {useEffect, useState} from "react";
import apiUrl from "../../constants/api.js";
import EquipmentAdd from "../../components/EquipmentAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsEquipment from "../../constants/constantsEquipment.js";
import UtilizationEquipmentButton from '../../components/UtilizationEquipmentButton.jsx';
import {
    showEditButton,
    showDeleteButton,
    showUtilizationButton,
    showAddButton,
    showPredictedStatusButton
} from "../../constants/permisions.js";
import EquipmentStatusPreview from "../../components/EquipmentStatusPreview.jsx";
import toastService from '../../utils/toast.js';

function MainEquipmentList() {
    const [equipments, setEquipments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState({});
    const [currentDate, setCurrentDate] = useState("");
    const username = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));
    const userPosition = user.position || "viewer";
    const [siteChange, setSiteChange] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [addEquipment, setAddEquipment] = useState(false);
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
                    sprzet_kto_zmienil: username
                }
            }
        ));
    }

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

            setEditMode(prev => ({...prev, [equipmentId]: false}));
            console.log('Equipment updated', editedEquipment[equipmentId]);
        } catch (error) {
            console.error('Fetch error:', error);
            toastService.error(`Błąd podczas aktualizacji sprzętu: ${error.message}`);
        }
        fetchEquipment()
    }

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
        const searchLower = searchQuery.toLowerCase();
        return (
            equipment.sprzet_nazwa.toLowerCase().includes(searchLower)
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200 sticky top-0 z-30">
                    <button className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 ml-8 z-10"
                            onClick={handleSiteChangeOpen}>
                        Zmiana Arkusza
                    </button>

                    <h1 className="text-2xl font-bold text-gray-800 p-2 text-center mx-auto absolute left-0 right-0">
                        Spis Minimum Sprzętu
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

                        {showAddButton(userPosition) && (
                            <button className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 mr-10 z-10"
                                    onClick={handleAddEquipmentOpen}>
                                Dodaj Pozycję
                            </button>
                        )}
                    </div>

                    <EquipmentAdd isOpen={addEquipment} onClose={handleAddEquipmentClose}>
                        <h2 className="text-xl font-bold mb-4">Dodaj Wyposażenie</h2>
                        <div className="grid grid-cols-2 gap-4">
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
                                onClick={() => {
                                    handleAddEquipment();
                                    handleAddEquipmentClose();
                                }}
                            >
                                Dodaj
                            </button>
                        </div>
                    </EquipmentAdd>


                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
                </div>

                <div className="sticky top-[100px] bg-white z-20">
                    <div className="flex justify-center items-center gap-6 py-3 border-b border-gray-200">
                        {showPredictedStatusButton(userPosition) && (
                            <button
                                onClick={() => setIsStatusModalOpen(true)}
                                className="bg-slate-900 text-white text-lg px-4 py-2 rounded-xl hover:bg-slate-500"
                            >
                                Sprawdź statusy w przyszłej dacie
                            </button>
                        )}

                        <div className="relative w-1/3">
                            <input
                                type="text"
                                placeholder="Szukaj leków..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <table className="w-full">
                    <thead className="text-left sticky top-[168px] z-10">
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide">
                        <th className="px-2 py-4">Wyroby Medyczne</th>
                        <th className="px-2 py-4">Ilość Aktualna</th>
                        <th className="px-2 py-4">Data Ważności</th>
                        <th className="px-2 py-4">Ilość Wymagana</th>
                        <th className="px-2 py-4">Uwagi</th>
                        <th className="px-2 py-4 ">Termin</th>
                        <th className="px-2 py-4 ">Ilość/Termin</th>
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
                                    <td colSpan="13" className="font-bold p-4 bg-slate-400">
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
                                                    <td colSpan="13"
                                                        className="p-2 pl-4 font-semibold text-lg bg-slate-300">
                                                        {subcategoryIndex + 1}. {subcategory}
                                                    </td>
                                                </tr>
                                            )}
                                            {subcategoryItems
                                                .filter(matchesSearch)
                                                .map(equipment => (
                                                    <tr key={equipment.sprzet_id}
                                                        className={`border border-gray-700 ${equipment.sprzet_torba_ratownika === 1 ? "bg-green-200" : ""} ${equipment.sprzet_na_statku === 1 ? "text-red-500" : ""}`}>
                                                        <td className="pl-6 px-2 py-4 border-r border-l border-gray-700 max-w-3xl">
                                                            {editMode[equipment.sprzet_id] ? (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        value={editedEquipment[equipment.sprzet_id]?.sprzet_nazwa || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_nazwa", e.target.value)}
                                                                        className="border px-2 py-1 w-5/6"
                                                                    />
                                                                    <select
                                                                        name="id_kategorii"
                                                                        value={editedEquipment[equipment.sprzet_id]?.id_kategorii || ""}
                                                                        onChange={(e) => {
                                                                            handleEdit(equipment.sprzet_id, "id_kategorii", e.target.value)
                                                                            setSelectedCategory(e.target.value)
                                                                        }}
                                                                        className="border px-2 py-1 w-5/6 my-1"
                                                                    >
                                                                        <option>Wybierz Kategorie</option>
                                                                        {ConstantsEquipment.CategoryOptions.map(option => (
                                                                            <option key={option.value}
                                                                                    value={option.value}>
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
                                                                        className="border px-2 py-1 w-5/6"
                                                                    >
                                                                        <option>Wybierz Pod Kategorie</option>
                                                                        {selectedCategory && ConstantsEquipment.SubCategoryOptions[selectedCategory]?.map(option => (
                                                                            <option key={option.value}
                                                                                    value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <select
                                                                        name="sprzet_na_statku"
                                                                        value={editedEquipment[equipment.sprzet_id]?.sprzet_na_statku || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_na_statku", e.target.value)}
                                                                        className="border px-2 py-1 mt-1 w-5/6 mb-1"
                                                                    >
                                                                        <option value="">Spis Podstawowy brak na
                                                                            statku
                                                                        </option>
                                                                        <option value="true">Tak</option>
                                                                        <option value="false">Nie</option>
                                                                    </select>
                                                                    <select
                                                                        name="sprzet_torba_ratownika"
                                                                        value={editedEquipment[equipment.sprzet_id]?.sprzet_torba_ratownika || ""}
                                                                        onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_torba_ratownika", e.target.value)}
                                                                        className="border px-2 py-1 w-5/6"
                                                                    >
                                                                        <option value="">W torbie ratownika</option>
                                                                        <option value="true">Tak</option>
                                                                        <option value="false">Nie</option>
                                                                    </select>

                                                                </>
                                                            ) : (
                                                                equipment.sprzet_nazwa
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4 border-r border-l border-gray-700">
                                                            {editMode[equipment.sprzet_id] ? (
                                                                <input
                                                                    type="number"
                                                                    value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_aktualna || ""}
                                                                    onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_aktualna", e.target.value)}
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                equipment.sprzet_ilosc_aktualna
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4 border-r border-l border-gray-700">
                                                            {editMode[equipment.sprzet_id] ? (
                                                                <input
                                                                    type="date"
                                                                    value={editedEquipment[equipment.sprzet_id]?.sprzet_data_waznosci || ""}
                                                                    onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_data_waznosci", e.target.value)}
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                equipment.sprzet_data_waznosci
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4 border-r border-l border-gray-700">
                                                            {editMode[equipment.sprzet_id] ? (
                                                                <input
                                                                    type="number"
                                                                    value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_wymagana || ""}
                                                                    onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_wymagana", e.target.value)}
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                equipment.sprzet_ilosc_wymagana
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4 border-r border-l border-gray-700">
                                                            {editMode[equipment.sprzet_id] ? (
                                                                <input
                                                                    type="text"
                                                                    value={editedEquipment[equipment.sprzet_id]?.sprzet_status || ""}
                                                                    onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_status", e.target.value)}
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                equipment.sprzet_status
                                                            )}
                                                        </td>
                                                        <td className={`${equipment.sprzet_termin !== "Ważny" ? "font-bold text-red-700" : ""} px-2 py-4 border-r border-l border-gray-700`}>
                                                            {equipment.sprzet_termin}
                                                        </td>
                                                        <td className={`
    ${equipment.sprzet_ilosc_termin === "W porządku" ? "font-bold text-green-600" : ""}
    ${(equipment.sprzet_ilosc_termin === "Uwaga Ilość" || equipment.sprzet_ilosc_termin === "Do zamówienia") ? "font-bold text-orange-600" : ""}
    ${equipment.sprzet_ilosc_termin !== "Ważny" && equipment.sprzet_ilosc_termin !== "W porządku" && equipment.sprzet_ilosc_termin !== "Uwaga Ilość" && equipment.sprzet_ilosc_termin !== "Do zamówienia" ? "font-bold text-red-700" : ""}
    px-2 py-4 border-r border-l border-gray-700
`}>
                                                            {equipment.sprzet_ilosc_termin}
                                                        </td>
                                                        <td className="px-2 py-4 border-r border-l border-gray-700">
                                                            {equipment.sprzet_kto_zmienil}
                                                        </td>
                                                        <td className="px-2 py-4 w-20">
                                                            {editMode[equipment.sprzet_id] ? (
                                                                <div className="flex flex-col space-y-2">
                                                                    <button
                                                                        onClick={() => handleSave(equipment.sprzet_id)}
                                                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded"
                                                                    >
                                                                        Zapisz
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditMode(prev => ({
                                                                            ...prev,
                                                                            [equipment.sprzet_id]: false
                                                                        }))}
                                                                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded"
                                                                    >
                                                                        Anuluj
                                                                    </button>
                                                                    {showDeleteButton(userPosition) && (
                                                                        <button
                                                                            onClick={() => handleDelete(equipment.sprzet_id)}
                                                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
                                                                        >
                                                                            Usuń
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col space-y-2">
                                                                    {showEditButton(userPosition) && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditMode(prev => ({
                                                                                    ...prev,
                                                                                    [equipment.sprzet_id]: true,
                                                                                }));
                                                                                setEditedEquipment(prev => ({
                                                                                    ...prev,
                                                                                    [equipment.sprzet_id]: {
                                                                                        ...equipment,
                                                                                        sprzet_na_statku: equipment.sprzet_na_statku === 1 ? "true" : "false",
                                                                                        sprzet_torba_ratownika: equipment.sprzet_torba_ratownika === 1 ? "true" : "false"
                                                                                    },
                                                                                }))
                                                                            }}
                                                                            className="bg-slate-900 hover:bg-slate-700 text-white font-semibold py-1 px-3 rounded"
                                                                        >
                                                                            Edytuj
                                                                        </button>
                                                                    )}
                                                                    {showUtilizationButton(userPosition) && (
                                                                        <div className="mt-1">
                                                                            <UtilizationEquipmentButton
                                                                                equipment={equipment}
                                                                                onUtilizationComplete={fetchEquipment}
                                                                            />
                                                                        </div>
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
                    </tbody>
                </table>
            </div>
            <EquipmentStatusPreview
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}/>
        </div>

    )
}

export default MainEquipmentList;