import React, {useState, useEffect} from "react";
import apiUrl from "../../constants/api.js";
import SiteChange from "../../components/SiteChange.jsx";

function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        position: ""
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSiteChangeOpen, setIsSiteChangeOpen] = useState(false);

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

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
                setUsers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again later.");
                setLoading(false);
            });
    };

    const handleEdit = (userId, field, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    const handleSave = async (userId) => {
        try {
            const response = await fetch(`${apiUrl}admin/users/${userId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(editedValues[userId])
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            setEditMode((prev) => ({...prev, [userId]: false}));
            fetchUsers();
        } catch (err) {
            setError("Failed to update user. Please try again.");
            console.error("Error updating user:", err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}admin/users/${userId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            fetchUsers();
        } catch (err) {
            setError("Failed to delete user. Please try again.");
            console.error("Error deleting user:", err);
        }
    };

    const handleNewUserChange = (field, value) => {
        setNewUser((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!newUser.username || !newUser.position) {
            setError("Username and position are required");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}admin/users`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            setNewUser({username: "", password: "", position: ""});
            setShowAddForm(false);
            fetchUsers();
        } catch (err) {
            setError("Failed to add user. Please try again.");
            console.error("Error adding user:", err);
        }
    };

    // Check if user is logged in and has admin role
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.username || user.position !== "admin") {
            window.location.href = "/";
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <button
                            onClick={() => setIsSiteChangeOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                            Menu
                        </button>

                        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>

                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {showAddForm ? "Cancel" : "Add New User"}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto pl-3 text-red-500"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {showAddForm && (
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => handleNewUserChange("username", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password (optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => handleNewUserChange("password", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position
                                    </label>
                                    <select
                                        value={newUser.position}
                                        onChange={(e) => handleNewUserChange("position", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select position</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="p-6 text-center">
                            <div
                                className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading users...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Position
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Password
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editMode[user.id] ? (
                                                <input
                                                    type="text"
                                                    value={editedValues[user.id]?.username || ""}
                                                    onChange={(e) => handleEdit(user.id, "username", e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editMode[user.id] ? (
                                                <select
                                                    value={editedValues[user.id]?.position || ""}
                                                    onChange={(e) => handleEdit(user.id, "position", e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                >
                                                    <option value="Admin">Admin</option>
                                                    <option value="User">User</option>
                                                    <option value="Viewer">Viewer</option>
                                                </select>
                                            ) : (
                                                <div className="text-sm text-gray-500">{user.position}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editMode[user.id] ? (
                                                <input
                                                    type="password"
                                                    placeholder="Enter new password (optional)"
                                                    value={editedValues[user.id]?.password || ""}
                                                    onChange={(e) => handleEdit(user.id, "password", e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-500">
                                                    {user.password ? "••••••••" : "No password"}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editMode[user.id] ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSave(user.id)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditMode((prev) => ({...prev, [user.id]: false}));
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditMode((prev) => ({...prev, [user.id]: true}));
                                                            setEditedValues((prev) => ({
                                                                ...prev,
                                                                [user.id]: {
                                                                    ...user,
                                                                    password: "",
                                                                },
                                                            }));
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
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
            </div>
            <SiteChange isOpen={isSiteChangeOpen} onClose={() => setIsSiteChangeOpen(false)}/>
        </div>
    );
}

export default Admin;