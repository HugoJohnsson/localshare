const WebSocket = require('ws');
const Peer = require('./core/Peer.js');
const Message = require('./core/Message.js');
const MessageType = require('./core/model/MessageType.js');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

let groups = {}; // Holds all "groups", one group is created for every unique IP address

server.on('connection', (socket, req) => handleConnection(new Peer(socket, req.connection.remoteAddress)));

/**
 * 
 * @param {Peer} peer 
 */
function handleConnection(peer) {
    addToRoom(peer);

    // Send a message with all available peers
    sendMessage(peer, new Message(
        MessageType.AVAILABLE_PEERS,
        getAvailablePeers(peer)
    ))
}

/**
 * 
 * @param {Peer} peer 
 */
function addToRoom(peer) {
    if (!groups[peer.ip]) { // Create the room if one doesn't exist
        groups[peer.ip] = {};
    }

    groups[peer.ip][peer.id] = peer;
}

/**
 * 
 * @param {Peer} peer 
 * @param {Message} message 
 */
function sendMessage(peer, message) {
    peer.socket.send(message.toJSON());
}

function getAvailablePeers(peer) {
    let availablePeers = [];
    
    // Get all other peers in the group with the same IP address
    for (const peerId in groups[peer.ip]) {
        const peer = groups[peer.ip][peerId];

        availablePeers.push({
            id: peer.id,
        })
    }

    return availablePeers;
}

console.log(`Server is running on port: ${PORT}`);