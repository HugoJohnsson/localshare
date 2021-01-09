import WebSocketConnection from './core/WebsocketConnection';
import MessageType from './core/model/MessageType';

const WSConnection = new WebSocketConnection(messageHandler);

/**
 * The main websocket message handler.
 * 
 * @param {*} message 
 */
function messageHandler(message) {
    message = JSON.parse(message);

    switch(message.type) {
        case MessageType.AVAILABLE_PEERS:
            handleAvailablePeersMessage(message.message);
            break;
        case MessageType.PERSONAL_NAME:
            console.log('your personal name is: ' + message.message)
            break;
    }
}

function handleAvailablePeersMessage(availablePeers) {
    const availablePeersEl = document.getElementById('available-peers');

    for (const peer of availablePeers) {
        availablePeersEl.appendChild(makeAvailablePeerElement(peer.id, peer.name));
    }
}

function makeAvailablePeerElement(id, name) {
    let el = document.createElement('p');
    el.id = id;
    el.name = name;
    el.textContent = name;

    return el;
}