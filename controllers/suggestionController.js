const Suggestion = require('../models/Suggestion');
const nodemailer = require('nodemailer');

// Configurar transportador de correo
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Lista de palabras ofensivas
const offensiveWords = [
    'idiota', 'estúpido', 'estupido', 'pendejo', 'tonto', 'imbécil', 'imbecil',
    'maldito', 'odio', 'puto', 'pinche', 'chinga', 'chingar',
    'verga', 'culero', 'mamón', 'mamon', 'cabrón', 'cabron',
    'joder', 'mierda', 'coño', 'bastardo', 'gilipollas'
];

// Detectar contenido ofensivo
const detectOffensiveContent = (text) => {
    const lowerText = text.toLowerCase();
    const foundWords = [];
    
    offensiveWords.forEach(word => {
        if (lowerText.includes(word)) {
            foundWords.push(word);
        }
    });
    
    return foundWords;
};

// Calcular severidad
const calculateSeverity = (offensiveWordsFound) => {
    if (offensiveWordsFound.length >= 3) return 'grave';
    if (offensiveWordsFound.length >= 1) return 'moderado';
    return 'leve';
};

// Enviar correo de notificación
const sendNotificationEmail = async (suggestion, isOffensive = false) => {
    try {
        const recipient = isOffensive ? process.env.ORIENTATION_EMAIL : process.env.ADMIN_EMAIL;
        const subject = isOffensive 
            ? `⚠️ ALERTA: Contenido Inapropiado Detectado - ${suggestion.email}`
            : `📨 Nueva Sugerencia: ${suggestion.type}`;

        let emailBody = `
            <h2>Sistema de Sugerencias CETIS 131</h2>
            <hr>
            <p><strong>Email:</strong> ${suggestion.email}</p>
            <p><strong>Tipo:</strong> ${suggestion.type}</p>
            <p><strong>Asunto:</strong> ${suggestion.subject}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${suggestion.message}</p>
            <p><strong>Fecha:</strong> ${new Date(suggestion.createdAt).toLocaleString('es-MX')}</p>
            <hr>
        `;

        if (isOffensive) {
            emailBody += `
                <div style="background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626;">
                    <h3 style="color: #991b1b;">⚠️ CONTENIDO INAPROPIADO DETECTADO</h3>
                    <p><strong>Palabras detectadas:</strong> ${suggestion.offensiveWords.join(', ')}</p>
                    <p><strong>Severidad:</strong> ${suggestion.severity.toUpperCase()}</p>
                    <p><strong>Acción requerida:</strong> ${suggestion.severity === 'grave' 
                        ? '⚡ CITACIÓN INMEDIATA - Contactar con dirección' 
                        : '📞 Revisión de orientación educativa'}</p>
                </div>
            `;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: recipient,
            subject: subject,
            html: emailBody
        });

        console.log(`📧 Correo enviado a: ${recipient}`);
    } catch (error) {
        console.error('❌ Error al enviar correo:', error.message);
    }
};

// @desc    Crear nueva sugerencia
// @route   POST /api/suggestions
// @access  Public
exports.createSuggestion = async (req, res) => {
    try {
        const { email, type, subject, message } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Por favor completa todos los campos obligatorios'
            });
        }

        // Detectar contenido ofensivo
        const offensiveInSubject = detectOffensiveContent(subject);
        const offensiveInMessage = detectOffensiveContent(message);
        const allOffensive = [...offensiveInSubject, ...offensiveInMessage];

        // Preparar datos de la sugerencia
        const suggestionData = {
            email,
            type: type || 'sugerencia',
            subject,
            message,
            hasOffensiveContent: allOffensive.length > 0,
            offensiveWords: allOffensive,
            severity: allOffensive.length > 0 ? calculateSeverity(allOffensive) : null,
            status: allOffensive.length > 0 ? 'investigacion' : 'pendiente',
            requiresMeeting: allOffensive.length > 0 && calculateSeverity(allOffensive) === 'grave',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
        };

        // Crear sugerencia en la base de datos
        const suggestion = await Suggestion.create(suggestionData);

        // Enviar correo de notificación
        await sendNotificationEmail(suggestion, allOffensive.length > 0);

        // Log en consola
        if (allOffensive.length > 0) {
            console.log('🚨 ═══════════════════════════════════════════════════');
            console.log('🚨 ALERTA DE CONTENIDO INAPROPIADO');
            console.log('═══════════════════════════════════════════════════');
            console.log('📧 Email:', suggestion.email);
            console.log('📝 Tipo:', suggestion.type);
            console.log('📌 Asunto:', suggestion.subject);
            console.log('⚠️ Palabras detectadas:', allOffensive.join(', '));
            console.log('🔴 Severidad:', suggestion.severity.toUpperCase());
            console.log('📋 Acción requerida:', suggestion.severity === 'grave' 
                ? '⚡ CITACIÓN INMEDIATA' 
                : '📞 Revisión de orientación');
            console.log('🕒 Fecha:', new Date().toLocaleString('es-MX'));
            console.log('═══════════════════════════════════════════════════');
        } else {
            console.log('✅ Nueva sugerencia recibida:', suggestion._id);
        }

        // Respuesta al cliente
        res.status(201).json({
            success: true,
            message: allOffensive.length > 0 
                ? 'Tu mensaje ha sido recibido pero contiene lenguaje inapropiado. Será revisado por orientación.'
                : 'Sugerencia enviada correctamente',
            data: {
                id: suggestion._id,
                hasOffensiveContent: suggestion.hasOffensiveContent,
                severity: suggestion.severity,
                requiresMeeting: suggestion.requiresMeeting
            }
        });

    } catch (error) {
        console.error('❌ Error al crear sugerencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar tu sugerencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Obtener todas las sugerencias (Admin)
// @route   GET /api/suggestions
// @access  Private
exports.getAllSuggestions = async (req, res) => {
    try {
        const { status, hasOffensive, type, severity } = req.query;
        
        // Construir filtro
        const filter = {};
        if (status) filter.status = status;
        if (hasOffensive !== undefined) filter.hasOffensiveContent = hasOffensive === 'true';
        if (type) filter.type = type;
        if (severity) filter.severity = severity;

        const suggestions = await Suggestion.find(filter)
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: suggestions.length,
            data: suggestions
        });
    } catch (error) {
        console.error('❌ Error al obtener sugerencias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las sugerencias',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Obtener una sugerencia por ID
// @route   GET /api/suggestions/:id
// @access  Private
exports.getSuggestionById = async (req, res) => {
    try {
        const suggestion = await Suggestion.findById(req.params.id);

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Sugerencia no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: suggestion
        });
    } catch (error) {
        console.error('❌ Error al obtener sugerencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la sugerencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Actualizar estado de sugerencia
// @route   PATCH /api/suggestions/:id
// @access  Private
exports.updateSuggestion = async (req, res) => {
    try {
        const { status, notes, reviewerEmail, meetingDate } = req.body;

        const suggestion = await Suggestion.findById(req.params.id);

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Sugerencia no encontrada'
            });
        }

        // Actualizar campos
        if (status) suggestion.status = status;
        if (notes) suggestion.notes = notes;
        
        if (reviewerEmail) {
            suggestion.reviewed = true;
            suggestion.reviewedBy = reviewerEmail;
            suggestion.reviewedAt = new Date();
        }

        if (meetingDate) {
            suggestion.requiresMeeting = true;
            suggestion.meetingScheduled = new Date(meetingDate);
        }

        await suggestion.save();

        res.status(200).json({
            success: true,
            message: 'Sugerencia actualizada correctamente',
            data: suggestion
        });
    } catch (error) {
        console.error('❌ Error al actualizar sugerencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la sugerencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Eliminar sugerencia
// @route   DELETE /api/suggestions/:id
// @access  Private
exports.deleteSuggestion = async (req, res) => {
    try {
        const suggestion = await Suggestion.findById(req.params.id);

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Sugerencia no encontrada'
            });
        }

        await suggestion.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Sugerencia eliminada correctamente'
        });
    } catch (error) {
        console.error('❌ Error al eliminar sugerencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la sugerencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Obtener estadísticas
// @route   GET /api/suggestions/stats
// @access  Private
exports.getStats = async (req, res) => {
    try {
        const stats = await Suggestion.getStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Obtener sugerencias con contenido ofensivo (Panel de investigación)
// @route   GET /api/suggestions/offensive
// @access  Private
exports.getOffensiveSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggestion.find({ hasOffensiveContent: true })
            .sort({ severity: -1, createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: suggestions.length,
            data: suggestions
        });
    } catch (error) {
        console.error('❌ Error al obtener sugerencias ofensivas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener sugerencias ofensivas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};