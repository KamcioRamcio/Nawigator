// Single source of status names (the backend uses the same strings).

export const ORDER_STATUSES = ['Nowe', 'W trakcie', 'Zamówione', 'Przyjęte', 'Zakończone', 'Anulowane'];
/** A received order may move between these without undoing the stock it added. */
export const ORDER_KEEPS_RECEIPT = ['Przyjęte', 'Zakończone'];

export const UTILIZATION_STATUSES = ['Nowa', 'Zakończona', 'Anulowana'];
export const UTILIZATION_CLOSED = ['Zakończona', 'Anulowana'];

/** Tailwind text colour for a utilization status. */
export function utilizationStatusColor(status) {
    if (status === 'Zakończona') return 'text-green-600';
    if (status === 'Anulowana') return 'text-red-600';
    return 'text-blue-600';
}
