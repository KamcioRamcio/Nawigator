import React from 'react'
import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom'
import MainMedicineList from './pages/Med/MainMedicineList.jsx';
import MainEquipmentList from './pages/Eq/MainEquipmentList.jsx';
import MedicineList from "./pages/Med/MedicineList.jsx";
import EquipmentList from "./pages/Eq/EquipmentList.jsx";
import Login from './pages/Other/Login.jsx';
import MinMedicine from "./pages/Med/MinMedicine.jsx";
import Utilization from "./pages/Other/Utilization.jsx";
import Documentation from "./pages/Other/Documentation.jsx";
import OrganizedEquipment from "./pages/Eq/OrganizedEquipment.jsx";

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
                    <Route path="/minimum-lekow" element={<MinMedicine/>}></Route>
                    <Route path="/zestawienie-sprzetu" element={<EquipmentList/>}></Route>
                    <Route path="/zgrany-sprzet" element={<OrganizedEquipment/>}></Route>
                    <Route path="/utylizacja" element={<Utilization/>}></Route>
                    <Route path="/dokumentacja" element={<Documentation/>}></Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;