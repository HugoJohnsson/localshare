const WebSocket = require('ws');
const GroupManager = require('./core/GroupManager.js');
const Peer = require('./core/Peer.js');
const Message = require('./core/Message.js');
const MessageType = require('./core/model/MessageType.js');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

const groupManager = new GroupManager();

server.on('connection', (socket, req) => handleConnection(new Peer(socket, req.connection.remoteAddress)));

/**
 * 
 * @param {Peer} peer 
 */
function handleConnection(peer) {
    groupManager.addToGroup(peer);

    peer.socket.on('message', (message) => handleMessage(peer, message));
    peer.socket.on('close', () => handleDisconnect(peer));

    sendPeerJoinedMessage(peer);

    // Send a message to the joined peer with all available peers
    sendMessage(peer, new Message(
        MessageType.AVAILABLE_PEERS,
        getAvailablePeers(peer).map(otherPeer => otherPeer.serialize())
    ));

    // Send a message to the joined peer with it's personal name
    sendMessage(peer, new Message(
        MessageType.PERSONAL_NAME,
        peer.name
    ));
}

/**
 * 
 * @param {JSON} message 
 */
function handleMessage(peer, message) {
    message = JSON.parse(message);

    switch(message.type) {
        case MessageType.CALL:
            handleCall(peer, message);
            break;
        case MessageType.ANSWER:
            handleAnswer(peer, message);
            break;
        case MessageType.CLIENT_DISCONNECTED:
            handleDisconnect(peer);
            break;
    }
}

/**
 * 
 * @param {Peer} caller 
 * @param {*} data 
 */
function handleCall(caller, data) {
    const { receivingPeerId, offer } = data.message;
    const receivingPeer = groupManager.getGroupByIp(caller.ip)[receivingPeerId];
    
    sendMessage(receivingPeer, new Message(MessageType.CALL, { callerPeerId: caller.id, offer }))
}

/**
 * 
 * @param {Peer} peer 
 * @param {*} data 
 */
function handleAnswer(peer, data) {
    const { callerPeerId, answer} = data.message;
    const callingPeer = groupManager.getGroupByIp(peer.ip)[callerPeerId];
    
    sendMessage(callingPeer, new Message(MessageType.ANSWERED, { answer }));
}

/**
 * 
 * @param {Peer} peer 
 */
function handleDisconnect(peer) {
    groupManager.leaveGroup(peer);

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
    const group = groupManager.getGroupByIp(peer.ip);
    for (const peerId in group) {
        const otherPeer = group[peerId];

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