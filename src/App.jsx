import React from 'react'
import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom'
import MainMedicineList from './pages/MainMedicineList';
import MainEquipmentList from './pages/MainEquipmentList';
import MedicineList from "./pages/MedicineList.jsx";
import EquipmentList from "./pages/EquipmentList.jsx";
import Login from './pages/Login';
import './index.css';


function App(){
    return (
        <div className="">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Main/Leki" element={<MainMedicineList />} />
                    <Route path="/Main/Sprzet" element={<MainEquipmentList/>}/>
                    <Route path="/zestawienie-lekow" element={<MedicineList/>}></Route>
                    <Route path="/zestawienie-sprzetu" element={<EquipmentList/>}></Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;