import express from 'express';

const app = express();
const PORT = 3000;

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on http://127.0.0.1:${PORT}/test`);
  console.log(`📍 Server address:`, server.address());
});

server.on('error', (err: Error) => {
  console.error('❌ Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Don't exit
});

// Keep alive
setInterval(() => {
  console.log('⏱️ Server still alive');
}, 5000);

