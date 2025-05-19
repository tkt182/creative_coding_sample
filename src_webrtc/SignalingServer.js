const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 10000 });
const clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);

  ws.on('message', message => {
    wss.clients.forEach(client => {
      console.log('[SignalServer] Received:', message.toString());
      for (const client of clients) {
        if (ws !== client && client.readyState === WebSocket.OPEN) {
          console.log('Send Message!');
          client.send(message);
        }
      }
    });
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('[SignalServer] Client disconnected');
  });
});
