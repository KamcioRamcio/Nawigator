"use client"

import { useState, useEffect } from "react"
import apiUrl from "../constants/api.js"
import toastService from "../utils/toast.js"

function AddToOrderModal({ isOpen, onClose, medicine, equipment }) {
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState("")
    const [amount, setAmount] = useState(1)
    const [loading, setLoading] = useState(false)
    const [creatingOrder, setCreatingOrder] = useState(false)

    // New state variables for order creation
    const [isCreatingNewOrder, setIsCreatingNewOrder] = useState(false)
    const [newOrderName, setNewOrderName] = useState("")
    const [newOrderCreated, setNewOrderCreated] = useState(false)
    const [newOrderId, setNewOrderId] = useState(null)

    // Determine if we're working with medicine or equipment
    const itemType = medicine ? "medicine" : "equipment"
    const item = medicine || equipment

    useEffect(() => {
        if (isOpen) {
            fetchOrders()
            resetForm()
        }
    }, [isOpen])

    const resetForm = () => {
        setSelectedOrder("")
        setAmount(1)
        setIsCreatingNewOrder(false)
        setNewOrderName("")
        setNewOrderCreated(false)
        setNewOrderId(null)
    }

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${apiUrl}zamowienia`)
            if (response.ok) {
                const data = await response.json()
                setOrders(data.filter((order) =>
                    order.status.toLowerCase() !== "zakończone" &&
                    order.status.toLowerCase() !== "anulowane" &&
                    order.status.toLowerCase() !== "w trakcie" &&
                    order.status.toLowerCase() !== "przyjęte" &&
                    order.status.toLowerCase() !== "zamówione",
                ))
            } else {
                toastService.error("Nie udało się pobrać listy zamówień")
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
            toastService.error("Błąd podczas pobierania zamówień")
        }
    }

    const handleCreateOrder = async () => {
        if (!newOrderName.trim()) {
            toastService.warning("Wprowadź nazwę zamówienia")
            return
        }

        setCreatingOrder(true)
        try {
            const payload = {
                nazwa: newOrderName,
                status: "Nowe",
                data_zamowienia: new Date().toLocaleDateString("pl-PL"),
            }

            const response = await fetch(`${apiUrl}zamowienia`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const data = await response.json()
                setNewOrderId(data)
                setNewOrderCreated(true)
                toastService.success("Utworzono nowe zamówienie")
                await fetchOrders()
                setSelectedOrder(data) // Auto-select the new order
            } else {
                throw new Error("Failed to create order")
            }
        } catch (error) {
            console.error("Error creating order:", error)
            toastService.error("Błąd podczas tworzenia zamówienia")
        } finally {
            setCreatingOrder(false)
        }
    }

    const handleAddToOrder = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const orderId = selectedOrder

            if (!orderId) {
                toastService.warning("Wybierz zamówienie")
                setLoading(false)
                return
            }

            let payload, endpoint

            if (itemType === "medicine") {
                payload = {
                    id_zamowienia: orderId,
                    id_leku: item.lek_id,
                    ilosc: amount,
                }
                endpoint = `${apiUrl}zamowienia/lek`
            } else {
                payload = {
                    id_zamowienia: orderId,
                    id_sprzetu: item.sprzet_id,
                    ilosc: amount,
                }
                endpoint = `${apiUrl}zamowienia/sprzet`
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                toastService.success(`${itemType === "medicine" ? "Lek" : "Sprzęt"} dodany do zamówienia`)
                onClose()
            } else {
                const errorData = await response.json()
                toastService.error(
                    errorData.message || `Nie udało się dodać ${itemType === "medicine" ? "leku" : "sprzętu"} do zamówienia`,
                )
            }
        } catch (error) {
            console.error(`Error adding ${itemType} to order:`, error)
            toastService.error(`Błąd podczas dodawania ${itemType === "medicine" ? "leku" : "sprzętu"} do zamówienia`)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadgeStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "nowe":
                return "bg-blue-100 text-blue-800 border border-blue-200"
            case "w trakcie":
                return "bg-amber-100 text-amber-800 border border-amber-200"
            case "zakończone":
                return "bg-green-100 text-green-800 border border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200"
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-blue-800 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <span className="text-xl">🛒</span>
                            </div>
                            <h2 className="text-xl font-bold">Dodaj do zamówienia</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                            disabled={loading}
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Item Information Card */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-l-blue-500 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-full ${itemType === "medicine" ? "bg-green-100" : "bg-blue-100"}`}>
                                <span className="text-xl">{itemType === "medicine" ? "💊" : "🔧"}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                                    {itemType === "medicine" ? "Lek" : "Sprzęt"}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    {itemType === "medicine" ? item.lek_nazwa : item.sprzet_nazwa}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Type Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Wybierz opcję zamówienia</h3>
                        <div className="space-y-3">
                            <label
                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    !isCreatingNewOrder
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="orderType"
                                    checked={!isCreatingNewOrder}
                                    onChange={() => setIsCreatingNewOrder(false)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <div className="ml-3 flex items-center space-x-2">
                                    <span className="text-lg">📦</span>
                                    <span className="font-medium text-gray-900">Wybierz istniejące zamówienie</span>
                                </div>
                            </label>

                            <label
                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isCreatingNewOrder
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="orderType"
                                    checked={isCreatingNewOrder}
                                    onChange={() => {
                                        setIsCreatingNewOrder(true)
                                        setNewOrderCreated(false)
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <div className="ml-1 flex items-center space-x-2">
                                    <span className="text-lg">➕</span>
                                    <span className="font-medium text-gray-900">Nowe zamówienie</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Order Creation/Selection */}
                    {isCreatingNewOrder ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Nazwa nowego zamówienia</label>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={newOrderName}
                                    onChange={(e) => setNewOrderName(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="Wprowadź nazwę zamówienia"
                                    disabled={newOrderCreated}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateOrder}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                                        newOrderCreated
                                            ? "bg-green-100 text-green-800 border border-green-200"
                                            : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                                    }`}
                                    disabled={creatingOrder || newOrderCreated}
                                >
                                    {creatingOrder ? (
                                        <span className="flex items-center space-x-2">
                      <span className="animate-spin">⏳</span>
                      <span>Tworzenie...</span>
                    </span>
                                    ) : newOrderCreated ? (
                                        <span className="flex items-center space-x-2">
                      <span>✅</span>
                      <span>Utworzono</span>
                    </span>
                                    ) : (
                                        "Utwórz zamówienie"
                                    )}
                                </button>
                            </div>
                            {newOrderCreated && (
                                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                    <span>✅</span>
                                    <span className="font-medium">Zamówienie utworzone pomyślnie</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Wybierz zamówienie</label>
                            <select
                                value={selectedOrder}
                                onChange={(e) => setSelectedOrder(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            >
                                <option value="">Wybierz zamówienie</option>
                                {orders.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        {order.nazwa} ({order.status})
                                    </option>
                                ))}
                            </select>
                            {selectedOrder && (
                                <div className="mt-2">
                                    {orders
                                        .filter((order) => order.id.toString() === selectedOrder)
                                        .map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                            >
                                                <span className="font-medium">{order.nazwa}</span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(order.status)}`}
                                                >
                          {order.status}
                        </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Ilość</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                            disabled={loading}
                        >
                            Anuluj
                        </button>
                        <button
                            onClick={handleAddToOrder}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || (isCreatingNewOrder && !newOrderCreated) || (!isCreatingNewOrder && !selectedOrder)}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin">⏳</span>
                  <span>Dodawanie...</span>
                </span>
                            ) : (
                                <span className="flex items-center justify-center space-x-2">
                  <span>🛒</span>
                  <span>Dodaj do zamówienia</span>
                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddToOrderModal
