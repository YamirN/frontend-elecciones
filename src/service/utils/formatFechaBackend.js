export function formatFechaBackend(fecha) {
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
        // Si es un objeto Date válido
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0'); // meses son 0-indexados
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    if (typeof fecha === 'string') {
        if (fecha.includes('/')) {
            // Formato: "dd/mm/yyyy"
            const [day, month, year] = fecha.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
            // Formato: "dd-mm-yyyy"
            const [day, month, year] = fecha.split('-');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            // Ya viene en formato correcto
            return fecha;
        }
    }

    return '';
}
