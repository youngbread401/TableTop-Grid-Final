<<<<<<< HEAD
const express = require('express');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Create HTTP server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ 
    server,
    perMessageDeflate: false,
    clientTracking: true
});

// Store client connections and grid state
const clients = new Map();
const gridState = {};

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            switch (data.type) {
                case 'login':
                    clients.set(ws, data.username);
                    console.log(`User logged in: ${data.username}`);
                    ws.send(JSON.stringify({
                        type: 'initGrid',
                        grid: gridState
                    }));
                    break;
                
                case 'placeToken':
                    const key = `${data.row}-${data.col}`;
                    if (data.remove) {
                        delete gridState[key];
                        console.log(`Token removed at ${key}`);
                    } else {
                        gridState[key] = {
                            color: data.color,
                            username: data.username
                        };
                        console.log(`Token placed at ${key} by ${data.username}`);
                    }
                    broadcast(data, ws);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        const username = clients.get(ws);
        console.log(`Client disconnected: ${username}`);
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast message to all clients except sender
function broadcast(data, exclude) {
    wss.clients.forEach((client) => {
        if (client !== exclude && client.readyState === WebSocketServer.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Error handling for WebSocket server
wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', connections: wss.clients.size });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
=======
const express = require('express');
const { WebSocketServer } = require('ws');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

// Create HTTP server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store client connections and grid state
const clients = new Map();
const gridState = {};

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            switch (data.type) {
                case 'login':
                    clients.set(ws, data.username);
                    console.log(`User logged in: ${data.username}`);
                    // Send current grid state to new user
                    ws.send(JSON.stringify({
                        type: 'initGrid',
                        grid: gridState
                    }));
                    break;
                
                case 'placeToken':
                    const key = `${data.row}-${data.col}`;
                    if (data.remove) {
                        delete gridState[key];
                        console.log(`Token removed at ${key}`);
                    } else {
                        gridState[key] = {
                            color: data.color,
                            username: data.username
                        };
                        console.log(`Token placed at ${key} by ${data.username}`);
                    }
                    // Broadcast to all other clients
                    broadcast(data, ws);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        const username = clients.get(ws);
        console.log(`Client disconnected: ${username}`);
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast message to all clients except sender
function broadcast(data, exclude) {
    wss.clients.forEach((client) => {
        if (client !== exclude && client.readyState === WebSocketServer.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
>>>>>>> 23bcbc2d19cb0acd5e4e8a2b7e44f13edff95ee9
});