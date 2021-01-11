import makeAvailablePeerElement from '../components/availablePeer';

export default class UI {
    constructor() {
        this.availablePeersEl = document.getElementById('available-peers');
    }

    newPeer = (peer) => {
        this.availablePeersEl.appendChild(makeAvailablePeerElement(peer.id, peer.name));
    }

    removePeer = (peer) => {
        for (const el of this.availablePeersEl.childNodes) {
            if (el.peerId === peer.id) el.remove();
        }
    }

    setPersonalName = (name) => {
        document.getElementById('personal-name').innerHTML = `You will show up as <b>${name}</b> on other devices`;    
    }
}