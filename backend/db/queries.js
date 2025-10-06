// backend/db/queries.js
// This file now serves as a central import/export hub for all query modules

// Import all functions from the modular files
import {
    addMedicine,
    updateMedicine,
    fetchMedicinesByCategory,
    fetchMedicinesByDate,
    deleteMedicine,
    addMinMedicine,
    updateMinMedicine,
    deleteMinMedicine,
    fetchMinMedicinesByCategory
} from './medicineQueries.js';

import {
    addEquipment,
    fetchEquipmentByCategory,
    fetchEquipmentsByDate,
    updateEquipment,
    deleteEquipment,
    addOrganizedEquipment,
    updateOrganizedEquipment,
    deleteOrganizedEquipment,
    fetchOrganizedEquipmentByCategory
} from './equipmentQueries.js';

import {
    fetchUsers,
    addUser,
    updateUser,
    deleteUser
} from './userQueries.js';

import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    addMedicineToOrder,
    addEquipmentToOrder,
    removeMedicineFromOrder,
    removeEquipmentFromOrder,
    deleteOrder,
    updateMedicineInOrder,
    updateEquipmentInOrder
} from './orderQueries.js';

import {
    fetchAllUtylizacja,
    createUtilization,
    getAllUtilizations,
    getUtilizationById,
    updateUtilizationStatus,
    updateUtilizationDetails,
    addMedicineToUtilization,
    addEquipmentToUtilization,
    updateMedicineInUtilization,
    updateEquipmentInUtilization,
    removeMedicineFromUtilization,
    removeEquipmentFromUtilization,
    deleteUtilizationComplete
} from './utilizationQueries.js';

import { formatDateToEuropean } from './utils.js';

// Re-export all functions to maintain backward compatibility
export {
    // Medicine functions
    addMedicine,
    updateMedicine,
    fetchMedicinesByCategory,
    fetchMedicinesByDate,
    deleteMedicine,
    addMinMedicine,
    updateMinMedicine,
    deleteMinMedicine,
    fetchMinMedicinesByCategory,

    // Equipment functions
    addEquipment,
    fetchEquipmentByCategory,
    fetchEquipmentsByDate,
    updateEquipment,
    deleteEquipment,
    addOrganizedEquipment,
    updateOrganizedEquipment,
    deleteOrganizedEquipment,
    fetchOrganizedEquipmentByCategory,

    // User functions
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,

    // Order functions
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    addMedicineToOrder,
    addEquipmentToOrder,
    removeMedicineFromOrder,
    removeEquipmentFromOrder,
    deleteOrder,
    updateMedicineInOrder,
    updateEquipmentInOrder,

    // Utilization functions
    fetchAllUtylizacja,
    createUtilization,
    getAllUtilizations,
    getUtilizationById,
    updateUtilizationStatus,
    updateUtilizationDetails,
    addMedicineToUtilization,
    addEquipmentToUtilization,
    updateMedicineInUtilization,
    updateEquipmentInUtilization,
    removeMedicineFromUtilization,
    removeEquipmentFromUtilization,
    deleteUtilizationComplete,

    // Utility functions
    formatDateToEuropean
};