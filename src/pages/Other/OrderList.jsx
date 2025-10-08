import React, { useState, useEffect } from 'react';
import apiUrl from "../../constants/api.js";
import OrderDetailModal from "../../components/OrderDetailModal.jsx";
import toastService from '../../utils/toast';
import SiteChange from "../../components/SiteChange.jsx";

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const username = localStorage.getItem("username");
    const currentDate = new Date();
    const [siteChange, setSiteChange] = useState(false);

    // List of available statuses
    const statuses = ["Nowe", "W trakcie", "Zamówione", "Przyjęte", "Zakończone", "Anulowane"];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${apiUrl}zamowienia`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toastService.error('Błąd podczas pobierania zamówień');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original if can't parse
            }
            const month = String(date.getDate()).padStart(2, '0');
            const day = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Zakończone': return 'bg-green-100 text-green-800';
            case 'Anulowane': return 'bg-red-100 text-red-800';
            case 'Zamówione': return 'bg-yellow-100 text-yellow-800';
            case 'Przyjęte': return 'bg-purple-100 text-purple-800';
            case 'W trakcie': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800'; // 'Nowe'
        }
    };

    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    const handleSiteChangeOpen = () => {
        setSiteChange(true);
    };

    const handleSiteChangeClose = () => {
        setSiteChange(false);
    };

    const handleOrderUpdate = () => {
        fetchOrders(); // Refresh orders after update
    };

    const matchesSearch = (order) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();

        return (
            order.nazwa?.toLowerCase().includes(query) ||
            order.status?.toLowerCase().includes(query)
        );
    };

    const matchesStatusFilter = (order) => {
        if (statusFilter === "all") return true;
        return order.status === statusFilter;
    };

    // Combined filter function
    const filterOrder = (order) => {
        return matchesSearch(order) && matchesStatusFilter(order);
    };

    // Calculate total items count for an order
    const getItemCount = (order) => {
        const lekiCount = order.leki_count || 0;
        const sprzetCount = order.sprzet_count || 0;
        return lekiCount + sprzetCount;
    };

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="mx-auto bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center py-6 border-b bg-gray-200 sticky top-0 z-30">
                    <button className="rounded-3xl bg-slate-900 text-white font-bold text-lg p-3 ml-8 z-10"
                            onClick={handleSiteChangeOpen}>
                        Zmiana Arkusza
                    </button>

                    <h1 className="text-2xl font-bold text-gray-800 p-2 text-center mx-auto absolute left-0 right-0">
                        Lista Zamówień
                    </h1>

                    <div className="flex items-center">
                        <div className="flex flex-col items-end mr-6 text-sm">
                            <p className="text-red-800 font-semibold">
                                Stan na dzień: {currentDate.toLocaleDateString()}
                            </p>
                            <p className="font-medium">
                                Zalogowany jako {username}
                            </p>
                        </div>
                    </div>

                    <SiteChange isOpen={siteChange} onClose={handleSiteChangeClose}/>
                </div>

                <div className="sticky top-[100px] bg-white z-20">
                    <div className="flex justify-center items-center gap-6 py-3 border-b border-gray-200">
                        <div className="relative w-1/3">
                            <input
                                type="text"
                                placeholder="Szukaj zamówień..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                        <div className="w-1/4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Wszystkie statusy</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-gray-500">Ładowanie zamówień...</p>
                    </div>
                ) : orders.length > 0 ? (
                    <table className="w-full">
                        <thead className="text-left sticky top-[168px] z-10">
                        <tr className="bg-gray-200 text-gray-700 uppercase text-sm tracking-wide">
                            <th className="px-6 py-3">Nazwa</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Data utworzenia</th>
                            <th className="px-6 py-3">Ilość pozycji</th>
                            <th className="px-6 py-3">Akcje</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {orders.filter(filterOrder).map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.nazwa}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.data_zamowienia)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getItemCount(order)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleViewDetails(order.id)}
                                        className="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors"
                                    >
                                        Zobacz szczegóły
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 text-lg">Brak zamówień</p>
                    </div>
                )}
            </div>

            <OrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                orderId={selectedOrderId}
                onOrderUpdate={handleOrderUpdate}
            />
        </div>
    );
}

export default OrderList;