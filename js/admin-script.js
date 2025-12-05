// API Base URL
const API_URL = 'http://localhost:3000/api';

// Funciones de traducción
function translateType(type) {
    const types = {
        'sugerencia': 'Sugerencia',
        'queja': 'Queja',
        'felicitacion': 'Felicitación',
        'reporte': 'Reporte'
    };
    return types[type] || type;
}

function translateStatus(status) {
    const statuses = {
        'pendiente': 'Pendiente',
        'en_revision': 'En Revisión',
        'investigacion': 'Investigación',
        'resuelto': 'Resuelto',
        'cerrado': 'Cerrado'
    };
    return statuses[status] || status;
}

function translateSeverity(severity) {
    const severities = {
        'leve': 'Leve',
        'moderado': 'Moderado',
        'grave': 'Grave'
    };
    return severities[severity] || severity;
}

// Formato de fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-MX', options);
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };
    return date.toLocaleDateString('es-MX', options);
}

// Notificaciones
function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Agregar al body
    document.body.appendChild(notification);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Confirmación de acciones
function confirmAction(message) {
    return confirm(message);
}

// Manejo de errores de API
async function handleApiError(response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la solicitud');
    }
    return response.json();
}

// Exportar sugerencias a CSV
function exportToCSV(suggestions, filename = 'sugerencias.csv') {
    const headers = ['Email', 'Tipo', 'Asunto', 'Mensaje', 'Estado', 'Ofensivo', 'Severidad', 'Fecha'];
    
    const csvContent = [
        headers.join(','),
        ...suggestions.map(s => [
            s.email,
            translateType(s.type),
            `"${s.subject.replace(/"/g, '""')}"`,
            `"${s.message.replace(/"/g, '""')}"`,
            translateStatus(s.status),
            s.hasOffensiveContent ? 'Sí' : 'No',
            s.severity || 'N/A',
            formatDate(s.createdAt)
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Filtrar sugerencias
function filterSuggestions(suggestions, filters) {
    return suggestions.filter(s => {
        if (filters.type && s.type !== filters.type) return false;
        if (filters.status && s.status !== filters.status) return false;
        if (filters.hasOffensive !== undefined && s.hasOffensiveContent !== filters.hasOffensive) return false;
        if (filters.severity && s.severity !== filters.severity) return false;
        if (filters.search) {
            const search = filters.search.toLowerCase();
            return s.email.toLowerCase().includes(search) ||
                   s.subject.toLowerCase().includes(search) ||
                   s.message.toLowerCase().includes(search);
        }
        return true;
    });
}

// Ordenar sugerencias
function sortSuggestions(suggestions, sortBy = 'date', order = 'desc') {
    const sorted = [...suggestions];
    
    sorted.sort((a, b) => {
        let comparison = 0;
        
        switch(sortBy) {
            case 'date':
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
                break;
            case 'email':
                comparison = a.email.localeCompare(b.email);
                break;
            case 'type':
                comparison = a.type.localeCompare(b.type);
                break;
            case 'status':
                comparison = a.status.localeCompare(b.status);
                break;
            case 'severity':
                const severityOrder = { 'grave': 3, 'moderado': 2, 'leve': 1, null: 0 };
                comparison = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
                break;
        }
        
        return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
}

// Obtener color para severidad
function getSeverityColor(severity) {
    const colors = {
        'leve': '#fbbf24',
        'moderado': '#f97316',
        'grave': '#ef4444'
    };
    return colors[severity] || '#9ca3af';
}

// Calcular estadísticas
function calculateStats(suggestions) {
    return {
        total: suggestions.length,
        byType: countByField(suggestions, 'type'),
        byStatus: countByField(suggestions, 'status'),
        offensive: suggestions.filter(s => s.hasOffensiveContent).length,
        bySeverity: countByField(suggestions.filter(s => s.hasOffensiveContent), 'severity'),
        pending: suggestions.filter(s => s.status === 'pendiente').length,
        resolved: suggestions.filter(s => s.status === 'resuelto').length
    };
}

function countByField(array, field) {
    return array.reduce((acc, item) => {
        const key = item[field] || 'sin_clasificar';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

// Debounce para búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Toggle sidebar en móvil
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Inicializar tooltips (si se necesitan)
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #1f2937;
                color: white;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
                font-size: 0.875rem;
                z-index: 10000;
                pointer-events: none;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            e.target._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', (e) => {
            if (e.target._tooltip) {
                document.body.removeChild(e.target._tooltip);
                delete e.target._tooltip;
            }
        });
    });
}

// Guardar estado de filtros en localStorage
function saveFilterState(filters) {
    localStorage.setItem('adminFilters', JSON.stringify(filters));
}

function loadFilterState() {
    const saved = localStorage.getItem('adminFilters');
    return saved ? JSON.parse(saved) : {};
}

// Log de consola estilizado
console.log('%c🎓 Panel de Administración CETIS 131', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cSistema de Gestión de Sugerencias v1.0', 'color: #6b7280; font-size: 14px;');