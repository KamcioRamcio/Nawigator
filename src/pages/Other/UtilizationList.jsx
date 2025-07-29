/**
 * UtilizationList Component
 *
 * A responsive utilization management interface that provides:
 * - Utilization listing with status tracking and filtering
 * - Search functionality across utilization details
 * - Utilization detail modal for viewing complete information
 * - Status-based visual indicators and badges
 * - Date formatting and display utilities
 * - Responsive design optimized for all device sizes
 * - Professional layout with proper spacing and typography
 *
 * @component
 * @returns {JSX.Element} The utilization list interface
 */

import React, {useState, useEffect, useRef} from 'react';
import apiUrl from "../../constants/api.js";
import UtilizationDetailModal from "../../components/UtilizationDetailModal.jsx";
import toastService from '../../utils/toast';
import SiteChange from "../../components/SiteChange.jsx";
import CreateUtilizationModal from "../../components/CreateUtilizationModal.jsx";
import AddItemToUtilizationModal from "../../components/AddItemToUtilizationModal.jsx";

function UtilizationList() {
    // ===========================================
    // STATE MANAGEMENT
    // ===========================================

    // Main data states
    const [utilizations, setUtilizations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal and interaction states
    const [selectedUtilizationId, setSelectedUtilizationId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [siteChange, setSiteChange] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // User and system information
    const username = localStorage.getItem("username");
    const currentDate = new Date();

    // ===========================================
    // LIFECYCLE HOOKS
    // ===========================================

    useEffect(() => {
        fetchUtilizations();
    }, []);

    // ===========================================
    // API FUNCTIONS
    // ===========================================

    /**
     * Fetches utilizations from the API
     */
    const fetchUtilizations = async () => {
        try {
            const response = await fetch(`${apiUrl}utylizacja`);
            if (!response.ok) {
                throw new Error('Failed to fetch utilizations');
            }
            const data = await response.json();
            setUtilizations(data);
        } catch (error) {
            console.error('Error fetching utilizations:', error);
            toastService.error('Błąd podczas pobierania utylizacji');
        } finally {
            setLoading(false);
        }
    };

    // ===========================================
    // UTILITY FUNCTIONS
    // ===========================================

    /**
     * Formats date string to DD-MM-YYYY format
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original if can't parse
            }
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    /**
     * Returns appropriate CSS classes for utilization status badges
     * @param {string} status - Utilization status
     * @returns {string} CSS class string
     */
    const getStatusClass = (status) => {
        switch (status) {
            case 'Zakończona':
                return 'bg-green-100 text-green-800';
            case 'Anulowana':
                return 'bg-red-100 text-red-800';
            case 'W realizacji':
                return 'bg-yellow-100 text-yellow-800';
            case 'W trakcie':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800'; // 'Nowa'
        }
    };

    /**
     * Checks if a utilization matches the current search query
     * @param {Object} utilization - Utilization object to check
     * @returns {boolean} True if utilization matches search criteria
     */
    const matchesSearch = (utilization) => {
        const matchesQuery = !searchQuery.trim() ||
            utilization.nazwa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            utilization.status?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || utilization.status === statusFilter;

        return matchesQuery && matchesStatus;
    };

    /**
     * Calculates total item count for a utilization (medicines + equipment)
     * @param {Object} utilization - Utilization object
     * @returns {number} Total item count
     */
    const getItemCount = (utilization) => {
        const lekiCount = utilization.leki_count || 0;
        const sprzetCount = utilization.sprzet_count || 0;
        return lekiCount + sprzetCount;
    };

    // ===========================================
    // EVENT HANDLERS
    // ===========================================

    /**
     * Opens the utilization detail modal for a specific utilization
     * @param {number} utilizationId - ID of utilization to view
     */
    const handleViewDetails = (utilizationId) => {
        setSelectedUtilizationId(utilizationId);
        setIsDetailModalOpen(true);
    };

    const handleSiteChangeOpen = () => setSiteChange(true);
    const handleSiteChangeClose = () => setSiteChange(false);
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);
    const handleOpenAddItemModal = () => setIsAddItemModalOpen(true);
    const handleCloseAddItemModal = () => setIsAddItemModalOpen(false);
    /**
     * Refreshes utilization list after updates
     */
    const handleUtilizationUpdate = () => {
        fetchUtilizations();
    };

    // ===========================================
    // RENDER
    // ===========================================

    return (
        <div className="bg-gray-100 min-h-screen pb-4 md:pb-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                {/* Header Section - Responsive Navigation */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 md:py-6 border-b bg-gray-200 sticky top-0 z-30 gap-4 md:gap-0">
                    {/* Left Section - Site Change Button */}
                    <div className="flex justify-start px-4 md:px-0">
                        <button
                            className="rounded-3xl bg-slate-900 text-white font-bold text-sm md:text-lg p-2 md:p-3 md:ml-8 z-10 hover:bg-slate-700 transition-colors"
                            onClick={handleSiteChangeOpen}
                        >
                            <span className="hidden sm:inline">Zmiana Arkusza</span>
                            <span className="sm:hidden">Arkusz</span>
                        </button>
                    </div>

                    {/* Center Section - Title */}
                    <div className="flex justify-center px-4">
                        <h1 className="text-lg md:text-2xl font-bold text-gray-800 text-center">
                            Lista Utylizacji
                        </h1>
                    </div>

                    {/* Right Section - User Info */}
                    <div className="flex justify-center md:justify-end px-4 md:mr-10">
                        <div className="flex flex-col items-center md:items-end text-xs md:text-sm">
                            <p className="text-red-800 font-semibold">
                                Stan na dzień: {currentDate.toLocaleDateString()}
                            </p>
                            <p className="font-medium">
                                Zalogowany jako {username}
                            </p>
                        </div>
                    </div>
                </div>

               {/* Search Section - Responsive Layout */}
                <div className="sticky top-[80px] md:top-[100px] z-20 bg-white border-b border-gray-200 p-4 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
                        {/* Search Input */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Szukaj utylizacji..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="md:w-64">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Wszystkie statusy</option>
                                <option value="Nowa">Nowa</option>
                                <option value="W realizacji">W realizacji</option>
                                <option value="Zakończona">Zakończone</option>
                                <option value="Anulowana">Anulowane</option>
                            </select>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 md:ml-auto">
                            <button
                                onClick={handleOpenCreateModal}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                            >
                                <span>➕</span>
                                <span>Nowa utylizacja</span>
                            </button>

                        </div>
                    </div>
                </div>


                {/* Main Content Area */}
                <div className="p-4 md:p-6">
                    {loading ? (
                        /* Loading State */
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Ładowanie utylizacji...</span>
                        </div>
                    ) : (
                        /* Utilizations Content */
                        <div className="space-y-4">
                            {/* Utilizations Table - Responsive Design */}
                            {utilizations.filter(matchesSearch).length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-lg">
                                        {searchQuery ? 'Brak utylizacji pasujących do wyszukiwania' : 'Brak utylizacji'}
                                    </p>
                                </div>
                            ) : (
                                /* Desktop Table View */
                                <div className="hidden md:block">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Nazwa Utylizacji
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Data Utworzenia
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Liczba Pozycji
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Akcje
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {utilizations.filter(matchesSearch).map((utilization) => (
                                                    <tr key={utilization.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {utilization.nazwa}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(utilization.status)}`}>
                                                                {utilization.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(utilization.data_utworzenia)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getItemCount(utilization)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleViewDetails(utilization.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors"
                                                            >
                                                                Zobacz szczegóły
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {utilizations.filter(matchesSearch).map((utilization) => (
                                    <div key={utilization.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
                                        {/* Utilization Header */}
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                                                {utilization.nazwa}
                                            </h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(utilization.status)} flex-shrink-0`}>
                                                {utilization.status}
                                            </span>
                                        </div>

                                        {/* Utilization Details */}
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span className="font-medium">Data utworzenia:</span>
                                                <span>{formatDate(utilization.data_utworzenia)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Liczba pozycji:</span>
                                                <span>{getItemCount(utilization)}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => handleViewDetails(utilization.id)}
                                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                                            >
                                                Zobacz szczegóły
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <SiteChange
                isOpen={siteChange}
                onClose={handleSiteChangeClose}
            />

            <UtilizationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                utilizationId={selectedUtilizationId}
                onUtilizationUpdate={handleUtilizationUpdate}
            />
            <CreateUtilizationModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onUtilizationCreated={handleUtilizationUpdate}
            />

            <AddItemToUtilizationModal
                isOpen={isAddItemModalOpen}
                onClose={handleCloseAddItemModal}
                onItemAdded={handleUtilizationUpdate}
            />
        </div>
    );
}

export default UtilizationList;
