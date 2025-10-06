import React from 'react'
import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom'
import MainMedicineList from './pages/Med/MainMedicineList.jsx';
import MainEquipmentList from './pages/Eq/MainEquipmentList.jsx';
import MedicineList from "./pages/Med/MedicineList.jsx";
import EquipmentList from "./pages/Eq/EquipmentList.jsx";
import Login from './pages/Other/Login.jsx';
import MinMedicine from "./pages/Med/MinMedicine.jsx";
import Documentation from "./pages/Other/Documentation.jsx";
import OrderList from "./pages/Other/OrderList.jsx";
import Admin from "./pages/Other/Admin.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
import UtilizationList from "./pages/Other/UtilizationList.jsx";
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App(){
    return (
        <BrowserRouter>
            <div className="">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route element={<ProtectedAdminRoute />}>
                        <Route path="/admin" element={<Admin />} />
                    </Route>
                    <Route path="/Main/Leki" element={<MainMedicineList />} />
                    <Route path="/Main/Sprzet" element={<MainEquipmentList/>}/>
                    <Route path="/zestawienie-lekow" element={<MedicineList/>}></Route>
                    <Route path="/minimum-lekow" element={<MinMedicine/>}></Route>
                    <Route path="/zestawienie-sprzetu" element={<EquipmentList/>}></Route>
                    <Route path="/utylizacja" element={<UtilizationList/>}></Route>
                    <Route path="/dokumentacja" element={<Documentation/>}></Route>
                    <Route path="/zamowienia" element={<OrderList/>}></Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <ToastContainer/>
            </div>
        </BrowserRouter>
    );
}

export default App;