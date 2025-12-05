const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Opciones recomendadas para MongoDB Atlas
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ MongoDB Atlas conectado exitosamente');
        console.log(`📊 Host: ${conn.connection.host}`);
        console.log(`💾 Base de datos: ${conn.connection.name}`);
        console.log(`🌍 Cluster: MongoDB Atlas (Cloud)`);
        console.log('═══════════════════════════════════════════════════');
    } catch (error) {
        console.error('═══════════════════════════════════════════════════');
        console.error('❌ Error al conectar con MongoDB Atlas');
        console.error('═══════════════════════════════════════════════════');
        console.error('Error:', error.message);
        console.error('\n💡 Verifica:');
        console.error('   1. Tu connection string en .env');
        console.error('   2. Que tu IP esté en la lista blanca de Atlas');
        console.error('   3. Tu usuario y contraseña sean correctos');
        console.error('═══════════════════════════════════════════════════');
        process.exit(1);
    }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose conectado a MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error en la conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose desconectado de MongoDB Atlas');
});

// Cerrar conexión cuando la app se cierra
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 Conexión de Mongoose cerrada por terminación de la aplicación');
    process.exit(0);
});

module.exports = connectDB;