export function formatFechaBackend(fecha) {
    if (typeof fecha === 'string' && fecha.includes('/')) {
        // Si viene como "dd/mm/yyyy"
        const [day, month, year] = fecha.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    if (typeof fecha === 'string' && fecha.includes('-')) {
        // Ya está bien formateada como "yyyy-mm-dd"
        return fecha;
    }

    return '';
}
