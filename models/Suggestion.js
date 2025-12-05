const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El correo institucional es obligatorio'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(email) {
                return /^[a-zA-Z0-9._-]+@cetis131\.edu\.mx$/i.test(email);
            },
            message: 'Debe ser un correo institucional válido del CETIS 131'
        }
    },
    type: {
        type: String,
        required: [true, 'El tipo de mensaje es obligatorio'],
        enum: ['sugerencia', 'queja', 'felicitacion', 'reporte'],
        default: 'sugerencia'
    },
    subject: {
        type: String,
        required: [true, 'El asunto es obligatorio'],
        trim: true,
        maxlength: [100, 'El asunto no puede exceder 100 caracteres']
    },
    message: {
        type: String,
        required: [true, 'El mensaje es obligatorio'],
        trim: true,
        maxlength: [1000, 'El mensaje no puede exceder 1000 caracteres']
    },
    hasOffensiveContent: {
        type: Boolean,
        default: false
    },
    offensiveWords: {
        type: [String],
        default: []
    },
    severity: {
        type: String,
        enum: ['leve', 'moderado', 'grave', null],
        default: null
    },
    status: {
        type: String,
        enum: ['pendiente', 'en_revision', 'investigacion', 'resuelto', 'cerrado'],
        default: 'pendiente'
    },
    reviewed: {
        type: Boolean,
        default: false
    },
    reviewedBy: {
        type: String,
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    requiresMeeting: {
        type: Boolean,
        default: false
    },
    meetingScheduled: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Índices para mejorar el rendimiento de las búsquedas
suggestionSchema.index({ email: 1 });
suggestionSchema.index({ status: 1 });
suggestionSchema.index({ hasOffensiveContent: 1 });
suggestionSchema.index({ severity: 1 });
suggestionSchema.index({ createdAt: -1 });

// Método virtual para obtener el nombre del estudiante del email
suggestionSchema.virtual('studentName').get(function() {
    if (this.email) {
        const username = this.email.split('@')[0];
        return username.replace(/[._-]/g, ' ').toUpperCase();
    }
    return 'Desconocido';
});

// Método para marcar como revisado
suggestionSchema.methods.markAsReviewed = function(reviewerEmail, notes = '') {
    this.reviewed = true;
    this.reviewedBy = reviewerEmail;
    this.reviewedAt = new Date();
    this.notes = notes;
    this.status = 'en_revision';
    return this.save();
};

// Método para programar reunión
suggestionSchema.methods.scheduleMeeting = function(date) {
    this.requiresMeeting = true;
    this.meetingScheduled = date;
    this.status = 'investigacion';
    return this.save();
};

// Método estático para obtener estadísticas
suggestionSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $facet: {
                total: [{ $count: 'count' }],
                byType: [
                    { $group: { _id: '$type', count: { $sum: 1 } } }
                ],
                byStatus: [
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ],
                offensive: [
                    { $match: { hasOffensiveContent: true } },
                    { $count: 'count' }
                ],
                bySeverity: [
                    { $match: { hasOffensiveContent: true } },
                    { $group: { _id: '$severity', count: { $sum: 1 } } }
                ]
            }
        }
    ]);
    return stats[0];
};

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

module.exports = Suggestion;