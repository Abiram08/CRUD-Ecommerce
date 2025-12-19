const app = require('./index');

// Server Configuration
const PORT = process.env.PORT || 3000;

// Server Start Trigger
const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`🚀 Server started successfully!`);
        console.log(`📡 Server is running on port ${PORT}`);
        console.log(`🌐 Local: http://localhost:${PORT}`);
        console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
        console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
        console.log('='.repeat(50));
    });

    // Graceful Shutdown Triggers
    process.on('SIGTERM', () => {
        console.log('\n📴 SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            console.log('✅ Server closed. Process terminated.');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('\n📴 SIGINT received. Shutting down gracefully...');
        server.close(() => {
            console.log('✅ Server closed. Process terminated.');
            process.exit(0);
        });
    });

    // Unhandled Exception Triggers
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error.message);
        console.error(error.stack);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise);
        console.error('Reason:', reason);
    });

    return server;
};

// Start the server
startServer();