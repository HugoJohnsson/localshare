import makeAvailablePeerElement from '../components/availablePeer';
import Events from './Events';
import EventType from './model/EventType';

export default class UI {
    constructor() {
        this.availablePeersEl = document.getElementById('available-peers');
        this.filesEl = document.getElementById('files');
        this.fileInputEl = document.getElementById('file-input');
        this.fileInputEl.addEventListener('change', this.handleFileUpload);


        Events.listen(EventType.PEER_JOINED, this.onPeerJoined);
        Events.listen(EventType.PEER_LEFT, this.onPeerLeft);
        Events.listen(EventType.RECEIVED_AVAILABLE_PEERS, this.onReceivedAvailablePeers);
        Events.listen(EventType.RECEIVED_PERSONAL_NAME, this.onReceivedPersonalName);
        Events.listen(EventType.PEERS_CONNECTED, this.onPeersConnected);
    }

    /**
     * 
     * @param {Event} e 
     */
    handleFileUpload = (e) => {
        const files = e.target.files;
        const file = files[0];

        // Check if the file is an image
        if (file.type && file.type.indexOf('image') === -1) {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const arrayBuffer = event.target.result;
            var byteArray = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i <= byteArray.length; i++) {
                Events.trigger(EventType.NEW_BYTE, { byte: byteArray[i] });
            }
            
        });
        reader.addEventListener('progress', (event) => {
            if (event.loaded && event.total) {
                const percent = (event.loaded / event.total) * 100;
                console.log(`Progress: ${Math.round(percent)}`);
            }
        });

        reader.readAsArrayBuffer(file);
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

    /**
     * 
     * @param {CustomEvent} e 
     */
    onPeersConnected = (e) => {
        this.toggleFileModal();
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

    toggleFileModal = () => {
        this.filesEl.classList.toggle('hide');
    }
}