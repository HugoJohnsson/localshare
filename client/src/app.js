import WebSocketConnection from './core/WebsocketConnection';
import MessageType from './core/model/MessageType';
import UI from './core/UI';
import Events from './core/Events';
import EventType from './core/model/EventType';
import ConnectionManager from './core/ConnectionManager';

export default class App {
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
                this.handleAvailablePeersMessage(message);
                break;
            case MessageType.PERSONAL_NAME:
                this.handlePersonalNameMessage(message);
                break;
            case MessageType.PEER_JOINED:
                this.handlePeerJoinedMessage(message);
                break;
            case MessageType.PEER_LEFT:
                this.handlePeerLeftMessage(message);
                break;
            case MessageType.CALL:
                this.handleCallMessage(message);
                break;
            case MessageType.NEW_ICE_CANDIDATE:
                this.handleReceivedIceCandidate(message);
                break;
            case MessageType.ANSWER:
                this.handleAnsweredMessage(message);
                break;
        }
    }

    /**
     * 
     * @param {*} message 
     */
    handlePeerJoinedMessage = (message) => {
        Events.trigger(EventType.PEER_JOINED, { peer: message.data.peer });
    }
    
    /**
     * 
     * @param {*} message 
     */
    handlePeerLeftMessage = (message) => {
        Events.trigger(EventType.PEER_LEFT, { peer: message.data.peer });
    }

    /**
     * Handler for when another peer want to connect.
     * Will setup an RTCPeerConnection.
     * 
     * @param {*} message 
     */
    handleCallMessage = (message) => {
        Events.trigger(EventType.RECEIVED_CALL, { callerPeerId: message.sendingPeerId, offer: message.data.offer });
    }

    /**
     * Handler for when you have called another peer
     * and they have answered.
     * 
     * @param {*} message 
     */
    handleAnsweredMessage = (message) => {
        Events.trigger(EventType.ANSWERED, { answer: message.data.answer });
    }

    /**
     * 
     * @param {*} message 
     */
    handleReceivedIceCandidate = (message) => {
        Events.trigger(EventType.NEW_ICE_CANDIDATE, { candidate: message.data.candidate });
    }
    
    /**
     * 
     * @param {*} message 
     */
    handlePersonalNameMessage = (message) => {
        Events.trigger(EventType.RECEIVED_PERSONAL_NAME, { name: message.data.name });
    }
    
    /**
     * 
     * @param {*} message 
     */
    handleAvailablePeersMessage = (message) => {
        Events.trigger(EventType.RECEIVED_AVAILABLE_PEERS, { availablePeers: message.data.availablePeers });
    }
}