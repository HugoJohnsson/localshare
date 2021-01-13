const WebSocket = require('ws');
const GroupManager = require('./core/GroupManager.js');
const Peer = require('./core/Peer.js');
const Message = require('./core/Message.js');
const MessageType = require('./core/model/MessageType.js');
class SignalingServer {

    constructor(port) {
        this.wsServer = new WebSocket.Server({ port });
        this.groupManager = new GroupManager();

        this.wsServer.on('connection', (socket, req) => this.handleConnection(new Peer(socket, req.connection.remoteAddress)));

        console.log(`Server is running on port: ${port}`);
    }

    /**
     * 
     * @param {Peer} peer 
     */
    handleConnection(peer) {
        this.groupManager.addToGroup(peer);

        peer.socket.on('message', (message) => this.handleMessage(peer, message));
        peer.socket.on('close', () => this.handleDisconnect(peer));

        this.sendPeerJoinedMessage(peer);

        // Send a message to the joined peer with all available peers
        this.sendMessage(peer, new Message(
            MessageType.AVAILABLE_PEERS,
            { availablePeers: this.getAvailablePeers(peer).map(otherPeer => otherPeer.serialize()) }
        ).toJSON());

        // Send a message to the joined peer with it's personal name
        this.sendMessage(peer, new Message(
            MessageType.PERSONAL_NAME,
            { name: peer.name }
        ).toJSON());
    }

    /**
     * 
     * @param {Peer} peer 
     * @param {JSON} message 
     */
    handleMessage(peer, message) {
        message = JSON.parse(message);

        // Handle message types that needs to be handled by the server
        // and not directly be relayed to another peer
        switch(message.type) {
            case MessageType.CLIENT_DISCONNECTED:
                this.handleDisconnect(peer);
                break;
        }

        // Relay the message to the receiving peer
        if (message.toPeerId && this.groupManager.getGroupByIp(peer.ip)) {
            const receivingPeer = this.groupManager.getGroupByIp(peer.ip)[message.toPeerId];

            delete message.toPeerId;
            message.sendingPeerId = peer.id;

            this.sendMessage(receivingPeer, JSON.stringify(message));
        }
    }

     /**
     * Sends a message to the passed peer
     * 
     * @param {Peer} peer 
     * @param {JSON} message 
     */
    sendMessage(peer, message) {
        peer.socket.send(message);
    }

    /**
     * If the connection to a peer is for some reason lost.
     * 
     * @param {Peer} peer 
     */
    handleDisconnect(peer) {
        this.groupManager.leaveGroup(peer);

        this.sendPeerLeftMessage(peer);
    }

    /**
     * Gets all available peers for a peer (all peers in the same group)
     * 
     * @param {Peer} peer 
     * @return {Peer[]}
     */
    getAvailablePeers(peer) {
        let availablePeers = [];
        
        // Get all other peers in the group with the same IP address
        const group = this.groupManager.getGroupByIp(peer.ip);
        for (const peerId in group) {
            const otherPeer = group[peerId];

            if (peerId != peer.id) availablePeers.push(otherPeer)
        }

        return availablePeers;
    }

    /**
     * Sends a message with the type PEER_JOINED to everyone
     * in the joined peer's group.
     * 
     * @param {Peer} joinedPeer 
     */
    sendPeerJoinedMessage(joinedPeer) {
        const otherPeers = this.getAvailablePeers(joinedPeer);

        for (const otherPeer of otherPeers) {
            this.sendMessage(otherPeer, new Message(MessageType.PEER_JOINED, joinedPeer.serialize()).toJSON())
        }
    }

    /**
     * Sends a message with the type PEER_LEFT to everyone
     * in the leaving peer's group.
     * 
     * @param {Peer} leavingPeer
     */
    sendPeerLeftMessage(leavingPeer) {
        const otherPeers = this.getAvailablePeers(leavingPeer);

        for (const otherPeer of otherPeers) {
            this.sendMessage(otherPeer, new Message(MessageType.PEER_LEFT, leavingPeer.serialize()).toJSON())
        }
    }
}

const PORT = process.env.PORT || 8080;

new SignalingServer(PORT);