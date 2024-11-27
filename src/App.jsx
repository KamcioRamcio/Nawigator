import React from 'react'
import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom'
import MainMedicineList from './pages/MainMedicineList';
import MainEquipmentList from './pages/MainEquipmentList';
import Login from './pages/Login';
import './index.css';


function App(){
    return (
        <div className="">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Leki" element={<MainMedicineList />} />
                    <Route path="/Sprzet" element={<MainEquipmentList/>}/>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;