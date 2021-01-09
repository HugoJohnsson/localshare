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
            handlePersonalNameMessage(message.message);
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

function handlePersonalNameMessage(name) {
    setPersonalName(name);
}

function setPersonalName(name) {
    document.getElementById('personal-name').innerHTML = `You will show up as <b>${name}</b> on other devices`;    
}

function handleAvailablePeersMessage(availablePeers) {
    for (const peer of availablePeers) {
        availablePeersEl.append(makeAvailablePeerElement(peer.id, peer.name));
    }
}

function makeAvailablePeerElement(id, name) {
    let el = document.createElement('div');
    el.classList.add('available-peers__peer');

    let circleEl = document.createElement('div');
    circleEl.classList.add('available-peers__circle');
    circleEl.innerHTML = name.charAt(0).toUpperCase();
    el.append(circleEl);

    let nameEl = document.createElement('div');
    nameEl.classList.add('available-peers__name');
    nameEl.innerHTML = name;
    el.append(nameEl);

    el.peerId = id;
    el.name = name;

    return el;
}