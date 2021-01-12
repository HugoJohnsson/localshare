import WebSocketConnection from './core/WebsocketConnection';
import Message from './core/Message';
import MessageType from './core/model/MessageType';
import UI from './core/UI';
import Events from './core/Events';
import EventType from './core/model/EventType';

class App {
    constructor() {
        this.wsConnection = new WebSocketConnection(this.messageHandler);
        this.UI = new UI();

        // Event listeners
        Events.listen(EventType.SIGNAL_PEER, (data) => this.onSignalPeer(data));
    }

    onSignalPeer = async (data) => {
       const { peerId } = data.detail;

        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.test.com:19000' }],
        });

        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);

        this.wsConnection.send(new Message(MessageType.SIGNAL_PEER, { peerId, offer }));
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
            case MessageType.SIGNAL_PEER:
                this.handleSignalPeerMessage(message.message);
                break;
            case MessageType.ANSWER_SIGNAL_PEER:
                this.handleAnswerSignalPeerMessage(message.message);
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

    handleSignalPeerMessage = async (data) => {
        const { callerId, offer } = data;

        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.test.com:19000' }],
        });

        await peerConnection.setRemoteDescription(offer);

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        this.wsConnection.send(new Message(MessageType.ANSWER_SIGNAL_PEER, { callerId, answer }));
    }

    handleAnswerSignalPeerMessage = (data) => {
        const { respondingId, answer } = data;

        //await peerConnection.setRemoteDescription(answer);
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