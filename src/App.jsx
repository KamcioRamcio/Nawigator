import React, {lazy, Suspense} from 'react'
import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom'
const MainMedicineList = lazy(() => import("./pages/Med/MainMedicineList.jsx"));
const MainEquipmentList = lazy(() => import("./pages/Eq/MainEquipmentList.jsx"));
const MedicineList = lazy(() => import("./pages/Med/MedicineList.jsx"));
const EquipmentList = lazy(() => import("./pages/Eq/EquipmentList.jsx"));
const Login = lazy(() => import("./pages/Other/Login.jsx"));
const MinMedicine = lazy(() => import("./pages/Med/MinMedicine.jsx"));
const Documentation = lazy(() => import("./pages/Other/Documentation.jsx"));
const OrderList = lazy(() => import("./pages/Other/OrderList.jsx"));
const Admin = lazy(() => import("./pages/Other/Admin.jsx"));
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
const UtilizationList = lazy(() => import("./pages/Other/UtilizationList.jsx"));
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App(){
    return (
        <BrowserRouter>
            <div className="">
                <Suspense fallback={<div className="p-4 text-gray-500">Ładowanie…</div>}>
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
                </Suspense>
                <ToastContainer/>
            </div>
        </BrowserRouter>
    );
}

export default App;