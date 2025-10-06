export function showEditButton(userPosition) {
    return userPosition !== "viewer";
}

export function showDeleteButton(userPosition) {
    return userPosition === "admin";
}

export function showUtilizationButton(userPosition){
    return userPosition === "admin";
};

// For tables where there's no need for users to edit or delete
export function showEditButtonNoMain(userPosition) {
    return userPosition === "admin";
}

export function showDbButtons(userPosition) {
    return userPosition === "admin";
}

export function showAddButton(userPosition) {
    return userPosition === "admin";
}


export function showPDFExportButton(userPosition) {
    return userPosition === "admin";
}

export function showPredictedStatusButton(userPosition) {
    return userPosition === "admin";
}

export const showOrderButton = (position) => {
    return ['admin', 'manager', 'user'].includes(position);
};