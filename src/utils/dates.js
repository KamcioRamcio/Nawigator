// Dates are stored as DD-MM-YYYY. Older rows may contain DD.MM.YYYY or ISO strings.

/** Any supported date string -> DD-MM-YYYY (unknown formats are returned unchanged). */
export function formatDate(value) {
    if (!value) return '';
    const eu = /^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/.exec(value);
    if (eu) return `${eu[1].padStart(2, '0')}-${eu[2].padStart(2, '0')}-${eu[3]}`;
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
    return value;
}

/** Any supported date string -> YYYY-MM-DD, the only format <input type="date"> accepts ('' if unknown). */
export function toInputDate(value) {
    const eu = formatDate(value);
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(eu);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}
