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
    if (!date) return null;

    // Si es Date
    if (date instanceof Date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // yyyy-MM-dd → dejar igual
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
    }

    // yyyy-MM-ddTHH:mm:ss → recortar
    if (/^\d{4}-\d{2}-\d{2}T/.test(date)) {
        return date.substring(0, 10);
    }

    // dd-MM-yyyy → convertir a yyyy-MM-dd
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        const [day, month, year] = date.split('-');
        return `${year}-${month}-${day}`;
    }

    // dd/MM/yyyy → convertir a yyyy-MM-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    }

    return null;
};
