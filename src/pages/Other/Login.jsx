import React, { useState, useRef, useEffect } from "react";
import apiUrl from "../../constants/api.js";
import logo from "../../assets/logo_black.png";
import toastService from "../../utils/toast.js";

/**
 * Login Component
 * Handles user authentication and provides options for database import.
 * Allows users to select from a list of available users and log in with a password if required.
 */
function Login() {
    // State variables for managing component data and UI interactions
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null); // Ref for the hidden file input

    /**
     * useEffect Hook
     * Fetches the list of users from the backend API when the component mounts.
     * Handles loading and error states during the fetch operation.
     */
    useEffect(() => {
        setLoading(true);
        fetch(apiUrl + "admin/users")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Server responded with ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setUsers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again later.");
                toastService.error("Failed to load users");
                setLoading(false);
            });
    }, []);

    /**
     * Handles the login process when the form is submitted.
     * Validates the selected user and password (if applicable).
     * Stores user information in local storage and redirects to the main application page upon successful login.
     * Displays toast notifications for success or invalid credentials.
     * @param {Event} e - The form submission event.
     */
    const handleLogin = (e) => {
        if (e) e.preventDefault();

        if (selectedUser && (!selectedUser.password || selectedUser.password === password)) {
            localStorage.setItem("user", JSON.stringify(selectedUser));
            localStorage.setItem("username", selectedUser.username);
            toastService.success(`Welcome, ${selectedUser.username}!`);
            window.location.href = "/Main/Leki";
        } else {
            toastService.error("Invalid credentials");
        }
    };

    /**
     * Triggers the hidden file input element, allowing the user to select a database file for import.
     */
    const handleImportDatabase = () => {
        fileInputRef.current.click();
    };

    /**
     * Handles the selection of a database file for import.
     * Validates the file type, sends the file to the backend for import, and refreshes the page upon success.
     * Displays toast notifications for the import process and any errors encountered.
     * @param {Event} e - The file input change event.
     */
    const handleFileSelected = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite')) {
            toastService.error("Please select a valid database file (.db or .sqlite)");
            e.target.value = null; // Clear the file input
            return;
        }

        const formData = new FormData();
        formData.append('database', file);

        try {
            toastService.info("Importing database...");

            const response = await fetch(apiUrl + 'import-database', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            toastService.success("Database imported successfully");
            // Refresh the page to load new data after a short delay
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error('Error importing database:', error);
            toastService.error(`Failed to import database: ${error.message}`);
        }

        // Clear the file input regardless of success or failure
        e.target.value = null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200">
                {/* Logo and Title Section */}
                <div className="flex flex-col items-center text-center">
                    <img src={logo} alt="Logo" className="h-20 sm:h-24 mb-4"/>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Politechnika Morska w Szczecinie</h1>
                    <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mt-1">MV NAWIGATOR XXI</h2>
                    <div className="w-16 h-1 bg-blue-500 mt-3 mb-3 rounded-full"></div>
                    <p className="text-sm text-gray-600">System inwentaryzacji medycznej</p>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Wybierz Użytkownika
                        </label>
                        <div className="relative">
                            <select
                                id="user-select"
                                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white shadow-sm text-base"
                                onChange={(e) => setSelectedUser(e.target.value ? JSON.parse(e.target.value) : null)}
                                defaultValue=""
                                disabled={loading}
                            >
                                <option value="">Wybierz Użytkownika</option>
                                {users.map((user) => (
                                    <option key={user.id} value={JSON.stringify(user)}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                        {loading && (
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Ładowanie użytkowników...
                            </div>
                        )}
                    </div>

                    {selectedUser && selectedUser.password && (
                        <div className="transition-all duration-200 ease-in-out">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Hasło
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-base"
                                placeholder="Wprowadź hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-2 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center text-base"
                            disabled={!selectedUser || loading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                            </svg>
                            Zaloguj się
                        </button>
                    </div>
                </form>

                {/* Database Import Button */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleImportDatabase}
                        className="py-2 px-4 bg-slate-900 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors flex items-center justify-center text-base"
                    >
                        <span>Importuj bazę danych</span>
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>
                        </svg>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelected}
                        accept=".db,.sqlite"
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;