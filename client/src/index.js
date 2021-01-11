import WebSocketConnection from './core/WebsocketConnection';
import MessageType from './core/model/MessageType';
import UI from './core/UI';

class App {
    constructor() {
        this.wsConnection = new WebSocketConnection(this.messageHandler);
        this.UI = new UI();
    }

    /**
     * The main websocket message handler.
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
        }
    }

    handlePeerJoinedMessage = (peer) => {
        this.UI.newPeer(peer);
    }
    
    handlePeerLeftMessage = (peer) => {
        this.UI.removePeer(peer);
    }
    
    handlePersonalNameMessage = (name) => {
        this.UI.setPersonalName(name);
    }
    
    handleAvailablePeersMessage = (availablePeers) => {
        for (const peer of availablePeers) {
            this.UI.newPeer(peer);
        }
    }
}

// Start the application
new App();