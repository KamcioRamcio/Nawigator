import React, { useState, useEffect, useRef } from "react";
import apiUrl from "../../constants/api.js";
import SiteChange from "../../components/SiteChange.jsx";
import toastService from "../../utils/toast.js";

/**
 * Admin Component
 * Provides an administrative interface for user management, including adding, editing, and deleting users.
 * Also includes functionality for exporting and importing the database.
 */
function Admin() {
    // State for managing user data and UI interactions
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState({}); // Tracks which user rows are in edit mode
    const [editedValues, setEditedValues] = useState({}); // Stores temporary edited user data
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        position: ""
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSiteChangeOpen, setIsSiteChangeOpen] = useState(false);

    // Ref for the hidden file input for database import
    const fileInputRef = useRef(null);

    /**
     * useEffect Hook
     * Fetches users on component mount and checks user authentication/authorization.
     */
    useEffect(() => {
        fetchUsers();
        // Redirect if not logged in or not an admin
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.username || user.position !== "admin") {
            window.location.href = "/";
        }
    }, []);

    /**
     * Fetches the list of users from the backend API.
     * Sets loading state, handles successful data retrieval, and manages errors.
     */
    const fetchUsers = () => {
        setLoading(true);
        fetch(apiUrl + "admin/users")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Server responded with ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                const positionOrder = {
                    "admin": 1,
                    "user": 2,
                    "viewer": 3
                };

                const sortedUsers = Array.isArray(data)
                    ? [...data].sort((a, b) => {
                        const posA = positionOrder[a.position] || 999;
                        const posB = positionOrder[b.position] || 999;

                        if (posA !== posB) {
                            return posA - posB;
                        }

                        return a.username.localeCompare(b.username);
                    })
                    : [];
                setUsers(sortedUsers);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again later.");
                setLoading(false);
            });
    };
    /**
     * Handles changes to user fields when in edit mode.
     * Updates the `editedValues` state for the specific user.
     * @param {string} userId - The ID of the user being edited.
     * @param {string} field - The field name being updated (e.g., 'username', 'position').
     * @param {string} value - The new value for the field.
     */
    const handleEdit = (userId, field, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    /**
     * Saves the edited user data to the backend.
     * Sends a PUT request with the updated user information.
     * Refreshes the user list and exits edit mode for the user upon success.
     * Displays error toasts if the update fails.
     * @param {string} userId - The ID of the user to be saved.
     */
    const handleSave = async (userId) => {
        try {
            const response = await fetch(`${apiUrl}admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedValues[userId])
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            setEditMode((prev) => ({ ...prev, [userId]: false }));
            toastService.success("Użytkownik zaktualizowany pomyślnie!");
            fetchUsers();
        } catch (err) {
            setError("Failed to update user. Please try again.");
            console.error("Error updating user:", err);
            toastService.error(`Błąd podczas aktualizacji użytkownika: ${err.message}`);
        }
    };

    /**
     * Handles the deletion of a user.
     * Prompts for user confirmation before proceeding with the deletion.
     * Sends a DELETE request to the backend.
     * Refreshes the user list upon success.
     * Displays error toasts if the deletion fails.
     * @param {string} userId - The ID of the user to be deleted.
     */
    const handleDelete = async (userId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.")) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}admin/users/${userId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            toastService.info("Użytkownik usunięty pomyślnie!");
            fetchUsers();
        } catch (err) {
            setError("Failed to delete user. Please try again.");
            console.error("Error deleting user:", err);
            toastService.error(`Błąd podczas usuwania użytkownika: ${err.message}`);
        }
    };

    /**
     * Handles changes to the new user form fields.
     * @param {string} field - The field name being updated (e.g., 'username', 'password').
     * @param {string} value - The new value for the field.
     */
    const handleNewUserChange = (field, value) => {
        setNewUser((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    /**
     * Handles the submission of the new user form.
     * Performs basic validation and sends a POST request to add the new user.
     * Resets the form, hides it, and refreshes the user list upon success.
     * Displays error toasts if the addition fails.
     * @param {object} e - The event object from the form submission.
     */
    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!newUser.username || !newUser.position) {
            setError("Nazwa użytkownika i pozycja są wymagane.");
            toastService.error("Nazwa użytkownika i pozycja są wymagane.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}admin/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            setNewUser({ username: "", password: "", position: "" });
            setShowAddForm(false);
            toastService.success("Użytkownik dodany pomyślnie!");
            fetchUsers();
        } catch (err) {
            setError("Failed to add user. Please try again.");
            console.error("Error adding user:", err);
            toastService.error(`Błąd podczas dodawania użytkownika: ${err.message}`);
        }
    };

    /**
     * Handles the export of the database.
     * Fetches the database file from the backend and initiates a download.
     * Displays error toasts if the export fails.
     */
    const handleExportDatabase = async () => {
        try {
            const currentDate = new Date();
            const response = await fetch(apiUrl + 'export-database');

            if (!response.ok) throw new Error('Failed to fetch database');
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `database_export_${currentDate.toISOString().slice(0, 10)}.db`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
            toastService.success("Baza danych wyeksportowana pomyślnie!");
        } catch (error) {
            console.error(error);
            toastService.error('Błąd podczas eksportu bazy danych');
        }
    };

    /**
     * Triggers the hidden file input for database import.
     */
    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    /**
     * Handles the import of a database file.
     * Validates the file type and sends it to the backend for import.
     * Displays error toasts if the import fails.
     * @param {object} e - The event object from the file input change.
     */
    const handleDatabaseImport = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite')) {
                toastService.error('Proszę wybrać plik bazy danych (.db lub .sqlite)');
                return;
            }

            const formData = new FormData();
            formData.append('database', file);

            const response = await fetch(apiUrl + 'import-database', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');
            toastService.success("Baza danych zaimportowana pomyślnie!");
            fetchUsers(); // Refresh users after import
        } catch (error) {
            console.error('Error importing database:', error);
            toastService.error(`Błąd podczas importu bazy danych: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-4 sm:px-6 sm:py-4 border-b border-gray-200 bg-gray-50">
                    {/* Menu Button */}
                    <button
                        onClick={() => setIsSiteChangeOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center w-full sm:w-auto mb-2 sm:mb-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                        Menu
                    </button>

                    {/* Page Title */}
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left w-full sm:w-auto mb-2 sm:mb-0">
                        Zarządzanie Użytkownikami
                    </h2>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <button
                            onClick={handleExportDatabase}
                            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center w-full sm:w-auto"
                        >
                            <span>Eksportuj bazę</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleDatabaseImport}
                            accept=".db,.sqlite"
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={handleImportClick}
                            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center w-full sm:w-auto"
                        >
                            <span>Importuj bazę</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8v-1a3 3 0 013-3h10a3 3 0 013 3v1m-4 4l-4-4m0 0l-4 4m4-4V20"/>
                            </svg>
                        </button>

                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center w-full sm:w-auto"
                        >
                            {showAddForm ? "Anuluj" : "Dodaj Nowego Użytkownika"}
                        </button>
                    </div>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-md">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-500 hover:text-red-700 focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Add New User Form */}
                {showAddForm && (
                    <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nazwa Użytkownika
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={newUser.username}
                                    onChange={(e) => handleNewUserChange("username", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hasło (opcjonalnie)
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={newUser.password}
                                    onChange={(e) => handleNewUserChange("password", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                                    Pozycja
                                </label>
                                <select
                                    id="position"
                                    value={newUser.position}
                                    onChange={(e) => handleNewUserChange("position", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Wybierz pozycję</option>
                                    <option value="admin">Administrator</option>
                                    <option value="user">Użytkownik</option>
                                    <option value="viewer">Widz</option>
                                </select>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Dodaj Użytkownika
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* User List Table */}
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Ładowanie użytkowników...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nazwa Użytkownika
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pozycja
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hasło
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Akcje
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {editMode[user.id] ? (
                                            <input
                                                type="text"
                                                value={editedValues[user.id]?.username || ""}
                                                onChange={(e) => handleEdit(user.id, "username", e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {editMode[user.id] ? (
                                            <select
                                                value={editedValues[user.id]?.position || ""}
                                                onChange={(e) => handleEdit(user.id, "position", e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            >
                                                <option value="admin">Administrator</option>
                                                <option value="user">Użytkownik</option>
                                                <option value="viewer">Widz</option>
                                            </select>
                                        ) : (
                                            <div className="text-sm text-gray-500">{user.position}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {editMode[user.id] ? (
                                            <input
                                                type="password"
                                                placeholder="Wprowadź nowe hasło (opcjonalnie)"
                                                value={editedValues[user.id]?.password || ""}
                                                onChange={(e) => handleEdit(user.id, "password", e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                {user.password ? "••••••••" : "Brak hasła"}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editMode[user.id] ? (
                                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                                <button
                                                    onClick={() => handleSave(user.id)}
                                                    className="text-green-600 hover:text-green-800 px-2 py-1 rounded-md border border-green-600 hover:border-green-800"
                                                >
                                                    Zapisz
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditMode((prev) => ({ ...prev, [user.id]: false }));
                                                        setEditedValues((prev) => {
                                                            const newValues = { ...prev };
                                                            delete newValues[user.id];
                                                            return newValues;
                                                        });
                                                    }}
                                                    className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded-md border border-gray-600 hover:border-gray-800"
                                                >
                                                    Anuluj
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditMode((prev) => ({ ...prev, [user.id]: true }));
                                                        setEditedValues((prev) => ({
                                                            ...prev,
                                                            [user.id]: {
                                                                ...user,
                                                                password: "", // Do not pre-fill password for security
                                                            },
                                                        }));
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md border border-blue-600 hover:border-blue-800"
                                                >
                                                    Edytuj
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-800 px-2 py-1 rounded-md border border-red-600 hover:border-red-800"
                                                >
                                                    Usuń
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <SiteChange isOpen={isSiteChangeOpen} onClose={() => setIsSiteChangeOpen(false)}/>
        </div>
    );
}

export default Admin;
