export const formatDateInList = (date) => {
    if (!date) return null; // Manejo de fechas inválidas

    // Asumimos que la fecha está en formato YYYY-MM-DD
    const [year, month, day] = date.split('-');

    // Retorna la fecha en el formato deseado
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};


export const formatDateForCreateUsers = (date) => {
    if (!date) return null; // Manejo de fechas inválidas
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
};

export const formatDateForApi = (date) => {
    if (!date) return null; // Maneja el caso de fechas no definidas

    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } else if (typeof date === 'string') {
        const parts = date.split('/'); // Separa la cadena en partes
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`; // Retorna en el formato adecuado
        } else {

            return null; // Retorna null si el formato es incorrecto
        }
    } else {

        return null; // Retorna null si el tipo no es soportado
    }
};

