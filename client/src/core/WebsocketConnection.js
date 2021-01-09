import Message from '../../../server/core/Message';
import MessageType from './model/MessageType';

const getSignalingServerUrl = () => 'ws://' + location.hostname + ':8080';

class WebSocketConnection {

    /**
     * 
     * @param {Function} handleMessage 
     */
    constructor(handleMessage) {
        this.socket = new WebSocket(getSignalingServerUrl());

        this.socket.onopen = () => console.log('Successfully connected to signaling server');
        this.socket.onerror = e => console.error(e);
        this.socket.onclose = () => this.handleDisconnect;

        this.socket.onmessage = e => handleMessage(e.data);
    }

    send(message) {
        this.socket.send(message.toJSON());
    }

    handleDisconnect() {
        this.send(new Message(MessageType.CLIENT_DISCONNECTED));
    }
}

export default WebSocketConnection;