"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = formatDate;
function formatDate(dateString) {
    if (!dateString)
        return 'No disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime()))
        return 'Fecha inválida';
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    });
}
//# sourceMappingURL=formatDate.js.map