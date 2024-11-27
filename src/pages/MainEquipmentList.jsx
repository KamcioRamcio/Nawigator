import React, {useEffect, useState} from "react";
import apiUrl from "./api.js";
import EquipmentAdd from "../components/EquipmentAdd.jsx";
import ConstantsEquipment from "../constants/constantsEquipment.js";

function MainEquipmentList() {
    const [equipments, setEquipments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState({});
    const [currentDate, setCurrentDate] = useState("");
    const username = localStorage.getItem("username");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
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
            if(!response.ok) {
               throw new Error(`HTTP error! status: ${response.status()}`);
            }
            console.log("Equipment deleted:", equipmentId)
        }   catch (error){
            console.log("Error deleting equipment:", error)
        }
        fetchEquipment()
    }

    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div>
                <div>
                    <h1 className="text-2xl text-center font-bold flex-grow">Zestawienie sprzętu medycznego MV NAWIGATOR XXI</h1>
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
                                    <td colSpan="13"
                                        className="font-bold p-4 hover:bg-pink-300">{categoryIndex + 1}. {category}</td>
                                </tr>
                                {Object.keys(equipments[category]).map((subcategory, subcategoryIndex) => {
                                    const showSubcategoryName = subcategory !== "null";
                                    return(
                                        <React.Fragment key={subcategory} >
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
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_nazwa || equipment.sprzet_nazwa}
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
                                                                type="number"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_wymagana || equipment.sprzet_ilosc_wymagana}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_wymagana", e.target.value)}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            equipment.sprzet_ilosc_wymagana
                                                        )}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4">
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <input
                                                                type="number"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_aktualna || equipment.sprzet_ilosc_aktualna}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_aktualna", e.target.value)}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            equipment.sprzet_ilosc_aktualna
                                                        )}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4">
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <input
                                                                type="date"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_data_waznosci|| equipment.sprzet_data_waznosci}
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
                                                                type="text"
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_status || equipment.sprzet_status}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_status", e.target.value)}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            equipment.sprzet_status
                                                        )}
                                                    </td>
                                                    <td className="pl-6 px-2 py-4">
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <select
                                                            value={editedEquipment[equipment.sprzet_id]?.sprzet_termin || equipment.sprzet_termin}
                                                            onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_termin", e.target.value)}
                                                            className="border px-2 py-1 w-5/6"
                                                            >   <option>Wybierz Termin</option>
                                                                {ConstantsEquipment.StatusOptions.map(option => (
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
                                                        {editMode[equipment.sprzet_id] ? (
                                                            <select
                                                                value={editedEquipment[equipment.sprzet_id]?.sprzet_ilosc_termin || equipment.sprzet_ilosc_termin}
                                                                onChange={(e) => handleEdit(equipment.sprzet_id, "sprzet_ilosc_termin", e.target.value)}
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
                                                            equipment.sprzet_ilosc_termin

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
                                                                    setEditedEquipment(prev  => ({
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

export default MainEquipmentList;