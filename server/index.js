const WebSocket = require('ws');
const Peer = require('./Peer.js');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

let rooms = {}; // Holds all "rooms", one room is created for every unique IP address

server.on('connection', (socket, req) => handleConnection(new Peer(socket, req.connection.remoteAddress)));

function handleConnection(peer) {
    // Add the peer to a room
    if (!rooms[peer.ip]) { // Create the room if one doesn't exist
        rooms[peer.ip] = {};
    }

    rooms[peer.ip][peer.id] = peer;
}

console.log(`Server is running on port: ${PORT}`);