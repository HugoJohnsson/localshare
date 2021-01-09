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
    addToGroup(peer);

    peer.socket.on('message', (message) => handleMessage(peer, message));
    peer.socket.on('close', () => handleDisconnect(peer));

    sendPeerJoinedMessage(peer);

    // Send a message to the joined peer with all available peers
    sendMessage(peer, new Message(
        MessageType.AVAILABLE_PEERS,
        getAvailablePeers(peer).map(otherPeer => otherPeer.serialize())
    ));
}

/**
 * 
 * @param {Peer} peer 
 */
function addToGroup(peer) {
    if (!groups[peer.ip]) { // Create the room if one doesn't exist
        groups[peer.ip] = {};
    }

    groups[peer.ip][peer.id] = peer;
}

/**
 * 
 * @param {Peer} peer 
 */
function leaveGroup(peer) {
    if (!groups[peer.ip] || !groups[peer.ip][peer.id]) return;

    // Delete peer from group
    delete groups[peer.ip][peer.id];

    // Delete the group if it's empty
    if (!Object.keys(groups[peer.ip]).length) {
        delete groups[peer.ip];
    }

    // Terminate the peer socket
    peer.socket.terminate();
}

/**
 * 
 * @param {JSON} message 
 */
function handleMessage(peer, message) {
    message = JSON.parse(message);

    switch(message.type) {
        case MessageType.CLIENT_DISCONNECTED:
            handleDisconnect(peer);
            break;
    }
}

/**
 * 
 * @param {Peer} peer 
 */
function handleDisconnect(peer) {
    leaveGroup(peer);

    sendPeerLeftMessage(peer);
}

/**
 * 
 * @param {Peer} peer 
 * @param {Message} message 
 */
function sendMessage(peer, message) {
    peer.socket.send(message.toJSON());
}

/**
 * 
 * @param {Peer} peer 
 * @return {Peer[]}
 */
function getAvailablePeers(peer) {
    let availablePeers = [];
    
    // Get all other peers in the group with the same IP address
    for (const peerId in groups[peer.ip]) {
        const otherPeer = groups[peer.ip][peerId];

        if (peerId != peer.id) availablePeers.push(otherPeer)
    }

    return availablePeers;
}

/**
 * 
 * @param {Peer} peer 
 */
function sendPeerJoinedMessage(peer) {
    const otherPeers = getAvailablePeers(peer);

    for (const otherPeer of otherPeers) {
        sendMessage(otherPeer, new Message(MessageType.PEER_JOINED, peer.serialize()))
    }
}

/**
 * 
 * @param {Peer} peer 
 */
function sendPeerLeftMessage(peer) {
    const otherPeers = getAvailablePeers(peer);

    for (const otherPeer of otherPeers) {
        sendMessage(otherPeer, new Message(MessageType.PEER_LEFT, peer.serialize()))
    }
}

console.log(`Server is running on port: ${PORT}`);