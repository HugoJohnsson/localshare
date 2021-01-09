import WebSocketConnection from './core/WebsocketConnection';
import MessageType from './core/model/MessageType';

const WSConnection = new WebSocketConnection(messageHandler);

const availablePeersEl = document.getElementById('available-peers');

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
        case MessageType.PEER_JOINED:
            handlePeerJoinedMessage(message.message);
            break;
        case MessageType.PEER_LEFT:
            handlePeerLeftMessage(message.message);
            break;
    }
}

function handlePeerJoinedMessage(peer) {
    availablePeersEl.appendChild(makeAvailablePeerElement(peer.id, peer.name));
}

function handlePeerLeftMessage(peer) {
    for (const el of availablePeersEl.childNodes) {
        if (el.peerId === peer.id) el.remove();
    }
}

function handleAvailablePeersMessage(availablePeers) {
    for (const peer of availablePeers) {
        availablePeersEl.append(makeAvailablePeerElement(peer.id, peer.name));
    }
}

function makeAvailablePeerElement(id, name) {
    let el = document.createElement('p');
    el.peerId = id;
    el.name = name;
    el.textContent = name;

    return el;
}