// require('dotenv').config();
// const app = require('./src/app');
// const connectDB = require('./src/config/database');
// const logger = require('./src/config/logger');

// const PORT = process.env.PORT || 5000;

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//   console.error('[UNCAUGHT EXCEPTION] Shutting down...', error);
//   logger.error('Uncaught Exception', error);
//   process.exit(1);
// });

// // Connect to database and start server
// const startServer = async () => {
//   try {
//     console.log('[SERVER] Starting server initialization...');
    
//     // Connect to MongoDB
//     await connectDB();
    
//     // Start Express server
//     const server = app.listen(PORT, () => {
//       console.log(`[SERVER] Server is running on port ${PORT}`);
//       console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
//       logger.info('Server started', { port: PORT, env: process.env.NODE_ENV });
//     });
    
//     // Handle unhandled promise rejections
//     process.on('unhandledRejection', (error) => {
//       console.error('[UNHANDLED REJECTION] Shutting down server...', error);
//       logger.error('Unhandled Rejection', error);
//       server.close(() => {
//         process.exit(1);
//       });
//     });
    
//     // Graceful shutdown
//     process.on('SIGTERM', () => {
//       console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
//       logger.info('SIGTERM received, shutting down gracefully');
//       server.close(() => {
//         console.log('[SERVER] Server closed');
//         logger.info('Server closed');
//         process.exit(0);
//       });
//     });
    
//   } catch (error) {
//     console.error('[SERVER ERROR] Failed to start server:', error);
//     logger.error('Server startup error', error);
//     process.exit(1);
//   }
// };

// startServer();

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('[SERVER] Starting server initialization...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`[SERVER] Server is running on port ${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('Server started', { port: PORT, env: process.env.NODE_ENV });
    });

  } catch (error) {
    console.error('[SERVER ERROR] Failed to start server:', error);
    logger.error('Server startup error', error);
    process.exit(1);
  }
};

startServer();
