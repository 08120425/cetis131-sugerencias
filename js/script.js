// Lista de palabras ofensivas (expandir según necesidades)
const offensiveWords = [
    'idiota', 'estúpido', 'estupido', 'pendejo', 'tonto', 'imbécil', 'imbecil',
    'maldito', 'odio', 'puto', 'pinche', 'chinga', 'chingar',
    'verga', 'culero', 'mamón', 'mamon', 'cabrón', 'cabron',
    'joder', 'mierda', 'coño', 'bastardo', 'gilipollas'
];

// Elementos del DOM
const emailInput = document.getElementById('email');
const typeSelect = document.getElementById('type');
const subjectInput = document.getElementById('subject');
const messageTextarea = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const charCount = document.getElementById('charCount');
const statusMessage = document.getElementById('statusMessage');

// Contador de caracteres
messageTextarea.addEventListener('input', () => {
    charCount.textContent = messageTextarea.value.length;
});

// Función para validar correo institucional
function validateEmail(email) {
    const cetisPattern = /^[a-zA-Z0-9._-]+@cetis131\.edu\.mx$/i;
    return cetisPattern.test(email);
}

// Función para detectar contenido ofensivo
function detectOffensiveContent(text) {
    const lowerText = text.toLowerCase();
    const foundWords = [];
    
    offensiveWords.forEach(word => {
        if (lowerText.includes(word)) {
            foundWords.push(word);
        }
    });
    
    return foundWords;
}

// Función para calcular severidad
function calculateSeverity(offensiveWordsFound) {
    if (offensiveWordsFound.length >= 3) return 'grave';
    if (offensiveWordsFound.length >= 1) return 'moderado';
    return 'leve';
}

// Función para mostrar mensaje de estado
function showStatus(type, message) {
    statusMessage.className = `status-message ${type}`;
    
    const iconSVG = type === 'success' 
        ? '<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    
    statusMessage.innerHTML = `
        ${iconSVG}
        <p class="status-text">${message}</p>
    `;
    
    statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Función para limpiar formulario
function clearForm() {
    emailInput.value = '';
    typeSelect.value = 'sugerencia';
    subjectInput.value = '';
    messageTextarea.value = '';
    charCount.textContent = '0';
}

// Función para enviar al servidor
async function sendToServer(data) {
    // Aquí debes reemplazar con tu endpoint real
    const API_ENDPOINT = 'http://localhost:3000/api/suggestions';
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al enviar la sugerencia');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Manejador del envío del formulario
submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Validar campos vacíos
    if (!emailInput.value || !subjectInput.value || !messageTextarea.value) {
        showStatus('error', 'Por favor, completa todos los campos obligatorios.');
        return;
    }
    
    // Validar correo institucional
    if (!validateEmail(emailInput.value)) {
        showStatus('error', 'Por favor, usa tu correo institucional del CETIS 131 (@cetis131.edu.mx)');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    btnText.innerHTML = '<div class="spinner"></div><span>Procesando...</span>';
    
    // Detectar contenido ofensivo
    const offensiveInSubject = detectOffensiveContent(subjectInput.value);
    const offensiveInMessage = detectOffensiveContent(messageTextarea.value);
    const allOffensive = [...offensiveInSubject, ...offensiveInMessage];
    
    // Preparar datos
    const formData = {
        email: emailInput.value,
        type: typeSelect.value,
        subject: subjectInput.value,
        message: messageTextarea.value,
        hasOffensiveContent: allOffensive.length > 0,
        offensiveWords: allOffensive,
        severity: allOffensive.length > 0 ? calculateSeverity(allOffensive) : null,
        timestamp: new Date().toISOString()
    };
    
    // Simular envío (quitar esto cuando tengas el backend real)
    setTimeout(() => {
        if (allOffensive.length > 0) {
            const severity = calculateSeverity(allOffensive);
            
            // Log para el sistema de investigación
            console.log('🚨 ═══════════════════════════════════════════════════');
            console.log('🚨 ALERTA DE CONTENIDO INAPROPIADO');
            console.log('═══════════════════════════════════════════════════');
            console.log('📧 Email:', formData.email);
            console.log('📝 Tipo:', formData.type);
            console.log('📌 Asunto:', formData.subject);
            console.log('💬 Mensaje:', formData.message);
            console.log('⚠️ Palabras detectadas:', allOffensive.join(', '));
            console.log('🔴 Severidad:', severity.toUpperCase());
            console.log('📋 Acción requerida:', severity === 'grave' 
                ? '⚡ CITACIÓN INMEDIATA - Contactar con dirección' 
                : '📞 Revisión de orientación educativa');
            console.log('🕒 Fecha y hora:', new Date().toLocaleString('es-MX'));
            console.log('═══════════════════════════════════════════════════');
            
            showStatus('warning', 
                'Tu mensaje ha sido recibido pero contiene lenguaje inapropiado. ' +
                'Será revisado por el departamento de orientación. Es posible que seas citado(a) para una conversación.'
            );
        } else {
            // Sugerencia limpia
            console.log('✅ ═══════════════════════════════════════════════════');
            console.log('✅ SUGERENCIA RECIBIDA CORRECTAMENTE');
            console.log('═══════════════════════════════════════════════════');
            console.log('📧 Email:', formData.email);
            console.log('📝 Tipo:', formData.type);
            console.log('📌 Asunto:', formData.subject);
            console.log('💬 Mensaje:', formData.message);
            console.log('🕒 Fecha y hora:', new Date().toLocaleString('es-MX'));
            console.log('═══════════════════════════════════════════════════');
            
            showStatus('success', 
                '¡Gracias por tu sugerencia! Ha sido enviada correctamente al equipo administrativo del CETIS 131.'
            );
            
            clearForm();
        }
        
        // Restaurar botón
        submitBtn.disabled = false;
        btnText.innerHTML = `
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Enviar Sugerencia
        `;
    }, 1500);
    
    // Descomentar esto cuando tengas el backend real:

    try {
        const result = await sendToServer(formData);
        
        if (result.hasOffensiveContent) {
            showStatus('warning', 
                'Tu mensaje ha sido recibido pero contiene lenguaje inapropiado. ' +
                'Será revisado por el departamento de orientación. Es posible que seas citado(a) para una conversación.'
            );
        } else {
            showStatus('success', 
                '¡Gracias por tu sugerencia! Ha sido enviada correctamente al equipo administrativo del CETIS 131.'
            );
            clearForm();
        }
    } catch (error) {
        showStatus('error', 
            'Hubo un error al enviar tu sugerencia. Por favor, intenta nuevamente más tarde.'
        );
    } finally {
        submitBtn.disabled = false;
        btnText.innerHTML = `
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Enviar Sugerencia
        `;
    }
    
});