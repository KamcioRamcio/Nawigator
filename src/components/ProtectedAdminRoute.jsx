// src/components/ProtectedAdminRoute.jsx
import React from "react";
import {Navigate, Outlet} from "react-router-dom";

const ProtectedAdminRoute = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");


    if (user.position !== "admin") {
        return <Navigate to="/" replace/>;
    }

    return <Outlet/>;
};

export default ProtectedAdminRoute;