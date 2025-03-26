import React, {useEffect, useState} from "react";
import apiUrl from "../../constants/api.js";
import EquipmentAdd from "../../components/EquipmentAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsEquipment from "../../constants/constantsEquipment.js";
import UtilizationEquipmentButton from '../../components/UtilizationEquipmentButton.jsx';


function MainEquipmentList() {
    const [equipments, setEquipments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState({});
    const [currentDate, setCurrentDate] = useState("");
    const username = localStorage.getItem("username");
    const [siteChange, setSiteChange] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [selectedSubCategory, setSelectedSubCategory] = useState(0);
    const [addEquipment, setAddEquipment] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        eq_nazwa: "",
        eq_ilosc_wymagana: "",
        eq_ilosc_aktualna: "",
        eq_data: "",
        eq_termin: "",
        eq_ilosc_termin: "",
        eq_na_statku:"",
        eq_torba_ratownika:"",
        eq_kategoria: "",
        eq_podkategoria: "",
    });

    useEffect(() => {
        fetchEquipment();
        setCurrentDate(new Date().toISOString().slice(0, 10));
    }, []);

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

    const handleEdit = (equipmentId, filed, value) => {
        setEditedEquipment(prev => (
            {
                ...prev,
                [equipmentId]: {
                    ...prev[equipmentId],
                    [filed]: value,
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
            setEditMode(prev => ({...prev, [equipmentId]: false}));
            console.log('Equipment updated', editedEquipment[equipmentId]);
        } catch (error) {
            console.error('Fetch error:', error);
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
            console.log("Equipment deleted:", equipmentId)
        } catch (error) {
            console.log("Error deleting equipment:", error)
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
            console.log('Equipment added', newEquipment);
            setNewEquipment({
                eq_nazwa: "",
                eq_ilosc_wymagana: "",
                eq_ilosc_aktualna: "",
                eq_data: "",
                eq_termin: "",
                eq_ilosc_termin: "",
                eq_na_statku: "",
                eq_torba_ratownika:"",
                eq_kategoria: "",
                eq_podkategoria: "",
            });
        }catch (error) {
            console.error('Fetch error:', error);
        }
        fetchEquipment()
    }

    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200 sticky top-0 z-30">
                    <h1 className="text-2xl text-center font-bold text-gray-800 flex-grow">
                        Spis Minimum Sprzętu Medycznego MV NAWIGATOR XXI
                    </h1>
                    <button className="absolute right-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleAddEquipmentOpen}
                    >
                        Dodaj Pozycję
                    </button>
                    <button className="absolute left-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleSiteChangeOpen}
                    >
                        Zmiana Arkusza
                    </button>

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


                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose} />
                </div>

                <div className="sticky top-[80px] bg-white z-20 border-b-2 border-gray-300">
                    <h2 className="text-center text-xl text-red-800 font-bold pt-2">
                        Stan na dzień : {currentDate}
                    </h2>
                    <h3 className="text-center font-semibold p-2 text-lg">
                        Zalogowany jako {username}
                    </h3>
                </div>

                <table className="w-full">
                    <thead className="text-left sticky top-[156px] z-10">
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide">
                        <th className="px-2 py-4">Wyroby Medyczne</th>
                        <th className="px-2 py-4">Ilość Wymagana</th>
                        <th className="px-2 py-4">Ilość Aktualna</th>
                        <th className="px-2 py-4">Data Ważności</th>
                        <th className="px-2 py-4">Uwagi</th>
                        <th className="px-2 py-4 text-red-600">Termin</th>
                        <th className="px-2 py-4 text-red-600">Ilość/Termin</th>
                        <th className="px-2 py-4">Kto Zmienił</th>
                        <th className="px-2 py-4">Akcje</th>
                    </tr>
                    </thead>
                    <tbody className="text-left">
                    {Object.keys(equipments).map((category, categoryIndex) => (
                        <React.Fragment key={category}>
                            <tr className="bg-gray-300 text-xl">
                                <td colSpan="13" className="font-bold p-4 bg-slate-400">
                                    {categoryIndex + 1}. {category}
                                </td>
                            </tr>
                            {Object.keys(equipments[category]).map((subcategory, subcategoryIndex) => {
                                const showSubcategoryName = subcategory !== "null";
                                return (
                                    <React.Fragment key={subcategory}>
                                        {showSubcategoryName && (
                                            <tr className="bg-gray-200">
                                                <td colSpan="13" className="p-2 pl-4 font-semibold text-lg bg-slate-300">
                                                    {subcategoryIndex + 1}. {subcategory}
                                                </td>
                                            </tr>
                                        )}
                                        {equipments[category][subcategory].map(equipment => (
                                            <tr key={equipment.sprzet_id}
                                                className={`border border-gray-700 ${equipment.sprzet_torba_ratownika === "true" ? "bg-green-200" : ""} ${equipment.sprzet_na_statku !== "true" ? "text-red-500" : ""}`}>
                                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700 max-w-3xl">
                                                    {editMode[equipment.sprzet_id] ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_nazwa || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_nazwa", e.target.value)}
                                                                className="border rounded-md px-2 py-1 w-5/6 mb-1"
                                                            />
                                                            <select
                                                                name="id_kategorii"
                                                                value={editedEquipment[equipment.sprzet_id]?.id_kategorii || ""}
                                                                onChange={(e) => {
                                                                    handleEdit(equipment.sprzet_id, "id_kategorii", e.target.value)
                                                                    setSelectedCategory(e.target.value)
                                                                }}
                                                                className="border rounded-md px-2 py-1 w-5/6 mb-1"
                                                            >
                                                                <option value="">
                                                                    {equipment.id_kategorii ?
                                                                        ConstantsEquipment.CategoryOptions.find(opt => opt.value === equipment.id_kategorii)?.label || "Wybierz kategorię"
                                                                        : "Wybierz kategorię"}
                                                                </option>
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
                                                                className="border rounded-md px-2 py-1 w-5/6"
                                                                disabled={!editedEquipment[equipment.sprzet_id]?.id_kategorii}
                                                            >
                                                                <option value="">
                                                                    {equipment.id_pod_kategorii ?
                                                                        ConstantsEquipment.SubCategoryOptions[equipment.id_kategorii]?.find(opt => opt.value === equipment.id_pod_kategorii)?.label || "Wybierz podkategorię"
                                                                        : "Wybierz podkategorię"}
                                                                </option>
                                                                {selectedCategory && ConstantsEquipment.SubCategoryOptions[selectedCategory]?.map(option => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <select
                                                                name="sprzet_na_statku"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_na_statku || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_na_statku", e.target.value)}
                                                                className="border rounded-md px-2 py-1 mt-1 w-5/6 mb-1"
                                                            >
                                                                <option value="">Na statku</option>
                                                                <option value="true">Tak</option>
                                                                <option value="false">Nie</option>
                                                            </select>
                                                            <select
                                                                name="sprzet_torba_ratownika"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_torba_ratownika || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_torba_ratownika", e.target.value)}
                                                                className="border rounded-md px-2 py-1 w-5/6"
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
                                                    {editMode[equipment.sprzet_id] ? (
                                                        <select
                                                            value={editedEquipment[equipment.sprzet_id]?.sprzet_termin || ""}
                                                            onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_termin", e.target.value)}
                                                            className="border rounded-md px-2 py-1 w-full"
                                                        >
                                                            <option value="">Wybierz Termin</option>
                                                            {ConstantsEquipment.EquipmentStatusOptions.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        equipment.sprzet_termin
                                                    )}
                                                </td>
                                                <td className="px-2 py-4 border-r border-l border-gray-700">
                                                    {editMode[equipment.sprzet_id] ? (
                                                        <select
                                                            value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_termin || ""}
                                                            onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_termin", e.target.value)}
                                                            className="border rounded-md px-2 py-1 w-full"
                                                        >
                                                            <option value="">Wybierz Ilość/Termin</option>
                                                            {ConstantsEquipment.StatusOptions.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        equipment.sprzet_ilosc_termin
                                                    )}
                                                </td>
                                                <td className="px-2 py-4 border-r border-l border-gray-700">
                                                    {equipment.sprzet_kto_zmienil}
                                                </td>
                                                <td className="px-2 py-4">
                                                    {editMode[equipment.sprzet_id] ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSave(equipment.sprzet_id)}
                                                                className="text-green-600 font-semibold mr-2"
                                                            >
                                                                Zapisz
                                                            </button>
                                                            <button
                                                                onClick={() => setEditMode(prev => ({
                                                                    ...prev,
                                                                    [equipment.sprzet_id]: false
                                                                }))}
                                                                className="text-gray-950 m-2 font-semibold"
                                                            >
                                                                Anuluj
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(equipment.sprzet_id)}
                                                                className="text-red-600 font-semibold m-2"
                                                            >
                                                                Usuń
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setEditMode(prev => ({
                                                                    ...prev,
                                                                    [equipment.sprzet_id]: true,
                                                                }));
                                                                setEditedEquipment(prev => ({
                                                                    ...prev,
                                                                    [equipment.sprzet_id]: equipment,
                                                                }))
                                                            }}
                                                            className="text-blue-600 font-semibold"
                                                        >
                                                            Edytuj
                                                        </button>
                                                    )}
                                                    <UtilizationEquipmentButton
                                                        equipment={equipment}
                                                        onUtilizationComplete={fetchEquipment}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                )
                            })}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>

    )
}

export default MainEquipmentList;