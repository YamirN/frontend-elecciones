export function formatFechaBackend(fecha) {
    const [day, month, year] = fecha.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
