import makeAvailablePeerElement from '../components/availablePeer';
import Events from './Events';
import EventType from './model/EventType';

export default class UI {
    constructor() {
        this.availablePeersEl = document.getElementById('available-peers');

        Events.listen(EventType.PEER_JOINED, this.onPeerJoined);
        Events.listen(EventType.PEER_LEFT, this.onPeerLeft);
        Events.listen(EventType.RECEIVED_AVAILABLE_PEERS, this.onReceivedAvailablePeers);
        Events.listen(EventType.RECEIVED_PERSONAL_NAME, this.onReceivedPersonalName);
    }

    /**
     * 
     * @param {CustomEvent} e 
     */
    onPeerJoined = (e) => {
        this.newPeer(e.detail.peer);
    }

    /**
     * 
     * @param {CustomEvent} e 
     */
    onPeerLeft = (e) => {
        this.removePeer(e.detail.peer);
    }

    /**
     * 
     * @param {CustomEvent} e 
     */
    onReceivedAvailablePeers = (e) => {
        const availablePeers = e.detail.availablePeers;

        for (const peer of availablePeers) {
            this.newPeer(peer);
        }
    }

    /**
     * 
     * @param {CustomEvent} e 
     */
    onReceivedPersonalName = (e) => {
        this.setPersonalName(e.detail.name);
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