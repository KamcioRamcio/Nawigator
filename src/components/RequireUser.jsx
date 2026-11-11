import React from "react";
import {Navigate, Outlet} from "react-router-dom";

// Pages need a logged-in user (they read its role); without one go to the login screen.
const RequireUser = () => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch {
        // corrupted value: treat as logged out
    }
    return user?.username ? <Outlet/> : <Navigate to="/" replace/>;
};

export default RequireUser;
