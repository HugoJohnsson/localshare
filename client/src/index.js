import WebSocketConnection from './core/WebsocketConnection';
import MessageType from './core/model/MessageType';
import UI from './core/UI';
import Events from './core/Events';
import EventType from './core/model/EventType';
import ConnectionManager from './core/ConnectionManager';

class App {
    constructor() {
        this.wsConnection = new WebSocketConnection(this.messageHandler);
        this.UI = new UI();
        this.connectionManager = new ConnectionManager(this.wsConnection);
    }

    /**
     * The main websocket message handler
     * 
     * @param {*} message 
     */
    messageHandler = (message) => {
        message = JSON.parse(message);

        switch(message.type) {
            case MessageType.AVAILABLE_PEERS:
                this.handleAvailablePeersMessage(message.message);
                break;
            case MessageType.PERSONAL_NAME:
                this.handlePersonalNameMessage(message.message);
                break;
            case MessageType.PEER_JOINED:
                this.handlePeerJoinedMessage(message.message);
                break;
            case MessageType.PEER_LEFT:
                this.handlePeerLeftMessage(message.message);
                break;
            case MessageType.CALL:
                this.handleCallMessage(message.message);
                break;
            case MessageType.RECEIVED_ICE_CANDIDATE:
                this.handleReceivedIceCandidate(message.message);
                break;
            case MessageType.ANSWERED:
                this.handleAnsweredMessage(message.message);
                break;
        }
    }

    /**
     * 
     * @param {*} peer 
     */
    handlePeerJoinedMessage = (peer) => {
        this.UI.newPeer(peer);
    }
    
    /**
     * 
     * @param {*} peer 
     */
    handlePeerLeftMessage = (peer) => {
        this.UI.removePeer(peer);
    }

    /**
     * Handler for when another peer want to connect.
     * Will setup an RTCPeerConnection.
     * 
     * @param {*} data 
     */
    handleCallMessage = (data) => {
        const { callerPeerId, offer } = data;

        Events.trigger(EventType.RECEIVED_CALL, { callerPeerId, offer });
    }

    /**
     * Handler for when you have called another peer
     * and they have answered.
     * 
     * @param {*} data 
     */
    handleAnsweredMessage = (data) => {
        Events.trigger(EventType.ANSWERED, { answer: data.answer });
    }

    handleReceivedIceCandidate = (data) => {
        Events.trigger(EventType.RECEIVED_ICE_CANDIDATE, { candidate: data.candidate });
    }
    
    /**
     * 
     * @param {*} name 
     */
    handlePersonalNameMessage = (name) => {
        this.UI.setPersonalName(name);
    }
    
    /**
     * 
     * @param {*} availablePeers 
     */
    handleAvailablePeersMessage = (availablePeers) => {
        for (const peer of availablePeers) {
            this.UI.newPeer(peer);
        }
    }
}

// Start the application
new App();