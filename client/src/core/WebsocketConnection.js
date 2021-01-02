import MessageType from './model/MessageType';

const getSignalingServerUrl = () => 'ws://' + location.hostname + ':8080';

class WebSocketConnection {
    constructor() {
        this.socket = new WebSocket(getSignalingServerUrl());

         this.socket.onopen = e => console.log('Successfully connected to signaling server');
         this.socket.onmessage = e => this.handleMessage(e.data);
         this.socket.onerror = e => console.error(e);
    }

    handleMessage(message) {
        message = JSON.parse(message);

        switch(message.type) {
            case MessageType.AVAILABLE_PEERS:
                console.log(message.message)
                break;
            case MessageType.PERSONAL_NAME:
                console.log("your personal name is: " + message.message)
                break;
        }
    }
}

export default WebSocketConnection;