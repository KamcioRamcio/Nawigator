import React, {useEffect, useState} from "react";
import apiUrl from "../../constants/api.js";
import EquipmentAdd from "../../components/EquipmentAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsEquipment from "../../constants/constantsEquipment.js";

function OrganizedEquipment() {
    const [equipments, setEquipments] = useState([]);
    const [editMode, setEditMode] = useState({});
    const [editedEquipment, setEditedEquipment] = useState({});
    const [currentDate, setCurrentDate] = useState("");
    const username = localStorage.getItem("username");
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

    const handleEdit = (equipmentId, field, value) => {
        setEditedEquipment(prev => ({
                ...prev, [equipmentId]: {
                    ...prev[equipmentId], [field]: value, kto_zmienil: username
                }
            }));
    }

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
                method: "PUT", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setEditMode(prev => ({...prev, [equipmentId]: false}));
            console.log('Equipment updated', dataToSend);
        } catch (error) {
            console.error('Fetch error:', error);
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
            console.log('Equipment added', newEquipment);
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
        }
    }

    return (<div className="bg-gray-100 min-h-screen py-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200 sticky top-0 z-30">
                    <h1 className="text-2xl text-center font-bold text-gray-800 flex-grow">
                        Zgrany Spis Sprzętu MV NAWIGATOR XXI
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
                <div className="sticky top-[80px] bg-white z-20 border-b-2 border-gray-300">
                    <h2 className="text-center text-xl text-red-800 font-bold pt-2">
                        Stan na dzień : {currentDate}
                    </h2>
                    <h3 className="text-center font-semibold p-2 text-lg">
                        Zalogowany jako {username}
                    </h3>
                </div>

                <table className="w-full">
                    <thead className="text-left sticky top-[154px] z-10 bg-gray-200">
                    <tr>
                        <th className="px-2 py-4">Nazwa Sprzętu</th>
                        <th className="px-2 py-4">Data Ważności</th>
                        <th className="px-2 py-4">Ilość</th>
                        <th className="px-2 py-4">Kto Zmienił</th>
                        <th className="px-2 py-4">Akcje</th>
                    </tr>
                    </thead>
                    <tbody className="text-left">
                    {Object.keys(equipments).map((category, categoryIndex) => (<React.Fragment key={category}>
                            <tr className="bg-gray-300 text-xl">
                                <td colSpan="13"
                                    className="font-bold p-4 bg-slate-400">{categoryIndex + 1}. {category}</td>
                            </tr>
                            {Object.keys(equipments[category]).map((subcategory, subcategoryIndex) => {
                                const showSubcategoryName = subcategory !== "null";
                                return (<React.Fragment key={subcategory}>
                                        {showSubcategoryName && (<tr className="bg-gray-200">
                                                <td colSpan="13"
                                                    className="font-semibold p-4 bg-slate-300">{subcategoryIndex + 1}. {subcategory}</td>
                                            </tr>)}
                                        {equipments[category][subcategory].map(equipment => (
                                            <tr key={equipment.sprzet_zgrany_id}
                                                className={`${equipment.sprzet_zgrany_na_statku === "true" || equipment.sprzet_zgrany_na_statku === 1 ? "text-black" : "text-red-600"} border border-gray-700`}>
                                                <td className="pl-6 px-2 py-4 max-w-[500px] border-r border-l border-gray-700">
                                                    {editMode[equipment.sprzet_zgrany_id] ? (<>
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
                                                    {editMode[equipment.sprzet_zgrany_id] ? (<input
                                                            type="date"
                                                            value={editedEquipment[equipment.sprzet_zgrany_id]?.sprzet_zgrany_data_waznosci || ""}
                                                            onChange={(e) => handleEdit(equipment.sprzet_zgrany_id, "sprzet_zgrany_data_waznosci", e.target.value)}
                                                            className="w-full"
                                                        />) : (equipment.sprzet_zgrany_data_waznosci)}
                                                </td>
                                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                    {editMode[equipment.sprzet_zgrany_id] ? (<input
                                                            type="number"
                                                            value={editedEquipment[equipment.sprzet_zgrany_id]?.sprzet_zgrany_ilosc || ""}
                                                            onChange={(e) => handleEdit(equipment.sprzet_zgrany_id, "sprzet_zgrany_ilosc", e.target.value)}
                                                            className="w-full"
                                                        />) : (equipment.sprzet_zgrany_ilosc)}
                                                </td>
                                                <td className="pl-6 px-2 py-4 border-r border-l border-gray-700">
                                                    {equipment.sprzet_zgrany_kto_zmienil}
                                                </td>
                                                <td>
                                                    {editMode[equipment.sprzet_zgrany_id] ? (<>
                                                            <button
                                                                onClick={() => handleSave(equipment.sprzet_zgrany_id)}
                                                                className="text-green-500 font-semibold m-2"
                                                            >
                                                                Zapisz
                                                            </button>
                                                            <button
                                                                onClick={() => setEditMode(prev => ({
                                                                    ...prev, [equipment.sprzet_zgrany_id]: false
                                                                }))}
                                                                className="text-gray-950 m-2 font-semibold"
                                                            >
                                                                Anuluj
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(equipment.sprzet_zgrany_id)}
                                                                className="text-red-600 font-semibold m-2"
                                                            >
                                                                Usuń
                                                            </button>
                                                        </>) : (<button
                                                            onClick={() => {
                                                                setEditMode(prev => ({
                                                                    ...prev, [equipment.sprzet_zgrany_id]: true,
                                                                }));
                                                                setEditedEquipment(prev => ({
                                                                    ...prev,
                                                                    [equipment.sprzet_zgrany_id]: {...equipment}
                                                                }))
                                                            }}
                                                            className="text-blue-500 font-semibold"
                                                        >
                                                            Edytuj
                                                        </button>

                                                    )}
                                                </td>
                                            </tr>))}
                                    </React.Fragment>)
                            })}
                        </React.Fragment>))}
                    </tbody>
                </table>
            </div>
        </div>)
}

export default OrganizedEquipment;
