import React, {useEffect, useState} from "react";
import apiUrl from "../../constants/api.js";
import EquipmentAdd from "../../components/EquipmentAdd.jsx";
import SiteChange from "../../components/SiteChange.jsx";
import ConstantsEquipment from "../../constants/constantsEquipment.js";

function EquipmentList() {
    const [equipments, setEquipments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState({});
    const [currentDate, setCurrentDate] = useState("");
    const username = localStorage.getItem("username");
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
            <div>
                <div>
                    <h1 className="text-2xl text-center font-bold flex-grow">Zestawienie sprzętu medycznego MV NAWIGATOR
                        XXI</h1>
                    <button className="absolute left-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleSiteChangeOpen}
                    > Zmiana Arkusza
                    </button>
                    <button className="absolute right-32 rounded-3xl bg-slate-900 text-white font-bold text-lg p-3"
                            onClick={handleAddEquipmentOpen}
                    >Dodaj Pozycję
                    </button>
                    <EquipmentAdd isOpen={addEquipment} onClose={handleAddEquipmentClose}>
                        <h2>ADD EQUIPMENT</h2>
                        <table>
                            <thead>
                            <tr>
                                <th className="px-12 py-4">Nazwa</th>
                                <th className="px-12 py-4">Ilosc wymagana</th>
                                <th className="px-12 py-4">Ilosc aktualna</th>
                                <th className="px-12 py-4">Data waznosci</th>
                                <th className="px-12 py-4">Termin</th>
                                <th className="px-12 py-4">Ilosc/Termin</th>
                                <th className="px-12 py-4">Kategoria</th>
                                <th className="px-12 py-4">Podkategoria</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        name="eq_nazwa"
                                        value={newEquipment.eq_nazwa}
                                        onChange={handleInputEquipment}
                                        placeholder="Nazwa"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        name="eq_ilosc_wymagana"
                                        value={newEquipment.eq_ilosc_wymagana}
                                        onChange={handleInputEquipment}
                                        placeholder="Ilosc wymagana"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        name="eq_ilosc_aktualna"
                                        value={newEquipment.eq_ilosc_aktualna}
                                        onChange={(e) => {
                                            handleInputEquipment(e);
                                        }}
                                        placeholder="Ilosc aktualna"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        name="eq_data"
                                        value={newEquipment.eq_data}
                                        onChange={(e) => {
                                            handleInputEquipment(e);
                                        }}
                                        placeholder="Data waznosci"
                                    />
                                </td>
                                <td>
                                    <select
                                        name="eq_termin"
                                        value={newEquipment.eq_termin}
                                        onChange={(e) => {
                                            handleInputEquipment(e);
                                        }
                                        }
                                    >
                                        <option>Wybierz Termin</option>
                                        {ConstantsEquipment.StatusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        name="eq_ilosc_termin"
                                        value={newEquipment.eq_ilosc_termin}
                                        onChange={(e) => {
                                            handleInputEquipment(e)
                                        }}
                                    >
                                        <option>Wybierz Ilosc/Termin</option>
                                        {ConstantsEquipment.EquipmentStatusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        name="eq_kategoria"
                                        value={newEquipment.eq_kategoria}
                                        onChange={(e) => {
                                            handleInputEquipment(e);
                                            setSelectedCategory(parseInt(e.target.value, 10))
                                        }}
                                    >
                                        <option>Wybierz Kategorie</option>
                                        {ConstantsEquipment.CategoryOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        name="eq_podkategoria"
                                        value={newEquipment.eq_podkategoria}
                                        onChange={(e) => {
                                            handleInputEquipment(e);
                                        }}
                                    >
                                        <option>Wybierz Podkategorie</option>
                                        {ConstantsEquipment.SubCategoryOptions[selectedCategory]?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <button className="p-4 bg-slate-700 rounded-3xl" onClick={() => {
                            handleAddEquipment();
                            handleAddEquipmentClose();
                        }}>
                            Dodaj
                        </button>
                    </EquipmentAdd>
                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}>
                    </SiteChange>
                    <h2 className="text-center text-xl text-red-800 font-bold pt-4 ">
                        Data: {currentDate}
                    </h2>
                    <h3 className="text-center font-semibold p-4 text-lg">
                        Zalogowany jako {username}
                    </h3>
                    <table className="w-full">
                        <thead className="text-left">
                        <tr>
                            <th className="px-2 py-4">Wyroby Medyczne</th>
                            <th className="px-2 py-4">Data Ważności</th>
                            <th className="px-2 py-4">Ilość Aktualna</th>
                            <th className="px-2 py-4 text-red-600">Termin</th>
                            <th className="px-2 py-4">Kto Zmienił</th>
                            <th className="px-2 py-4">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="text-left">
                        {Object.keys(equipments).map((category, categoryIndex) => (
                            <React.Fragment key={category}>
                                <tr className="bg-gray-300 text-xl">
                                    <td colSpan="13"
                                        className="font-bold p-4 hover:bg-pink-300">{categoryIndex + 1}. {category}</td>
                                </tr>
                                {Object.keys(equipments[category]).map((subcategory, subcategoryIndex) => {
                                    const showSubcategoryName = subcategory !== "null";
                                    return (
                                        <React.Fragment key={subcategory}>
                                            {showSubcategoryName && (
                                                <tr className="bg-gray-200">
                                                    <td colSpan="13"
                                                        className="font-semibold p-4 hover:bg-pink-300">{subcategoryIndex + 1}. {subcategory}</td>
                                                </tr>
                                            )}
                                            {equipments[category][subcategory].map(equipment => (
                                                <tr key={equipment.sprzet_id}>
                                                    <td className="pl-6 px-2 py-4">
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <input
                                                                type="text"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_nazwa || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_nazwa", e.target.value)}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            equipment.sprzet_nazwa
                                                        )}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4">
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <input
                                                                type="date"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_data_waznosci || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_data_waznosci", e.target.value)}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            equipment.sprzet_data_waznosci
                                                        )}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4">
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <input
                                                                type="number"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_aktualna || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_aktualna", e.target.value)}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            equipment.sprzet_ilosc_aktualna
                                                        )}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4">
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <select
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_termin || ""}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_termin", e.target.value)}
                                                                className="w-full"
                                                            >
                                                                <option>Wybierz Ilosc/Termin</option>
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
                                                    <td className="pl-6 px-2 py-4">
                                                        {equipment.sprzet_kto_zmienil}
                                                    </td>
                                                    <td>
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSave(equipment.sprzet_id)}
                                                                    className="text-green-500 font-semibold mr-2"
                                                                >
                                                                    Zapisz
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditMode(prev => ({
                                                                        ...prev,
                                                                        [equipment.sprzet_id]: false
                                                                    }))}
                                                                    className="text-red-500 font-semibold"
                                                                >
                                                                    Anuluj
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(equipment.sprzet_id)}
                                                                    className="text-red-400 font-semibold mr-2 ml-2"
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
                                                                }
                                                                }
                                                                className="text-blue-500 font-semibold"
                                                            >
                                                                Edytuj
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    )
                                })}
                            </React.Fragment>
                        ), [])}
                        </tbody>

                    </table>
                </div>
            </div>

        </div>
    )


}

export default EquipmentList;