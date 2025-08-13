export function validateExcelFile(file, maxSizeMB = 5) {
    if (!file) {
        return { valid: false, error: 'No se seleccionó ningún archivo' };
    }

    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Formato inválido. Solo se aceptan archivos .xlsx y .xls' };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `El archivo no debe superar los ${maxSizeMB}MB` };
    }

    return { valid: true, error: null };
}
