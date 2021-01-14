import makeAvailablePeerElement from '../components/availablePeer';
import makeReceivedFileElement from '../components/receivedFile';
import Events from './Events';
import EventType from './model/EventType';

export default class UI {
    constructor() {
        this.availablePeersEl = document.getElementById('available-peers');
        this.filesEl = document.getElementById('files');
        this.fileInputEl = document.getElementById('file-input');
        this.fileInputEl.addEventListener('change', this.handleFileUpload);
        this.receivedFilesEl = document.getElementById('received_files');
        this.receivedFilesList = document.getElementById('received_files_list');

        Events.listen(EventType.PEER_JOINED, this.onPeerJoined);
        Events.listen(EventType.PEER_LEFT, this.onPeerLeft);
        Events.listen(EventType.RECEIVED_AVAILABLE_PEERS, this.onReceivedAvailablePeers);
        Events.listen(EventType.RECEIVED_PERSONAL_NAME, this.onReceivedPersonalName);
        Events.listen(EventType.PEERS_CONNECTED, this.onPeersConnected);
        Events.listen(EventType.FILE_RECEIVED, this.onFileReceived);
    }

    /**
     * 
     * @param {Event} e 
     */
    handleFileUpload = (e) => {
        Events.trigger(EventType.FILE_UPLOAD, { files: e.target.files });

        // Display files uploaded in the upload modal
    }

    /**
     * file = ArrayBuffer
     * 
     * @param {CustomEvent} e 
     */
    onFileReceived = (e) => {
        this.toggleReceivedFilesModal();

        const file = e.detail.file;

        this.receivedFilesList.append(makeReceivedFileElement(this.arrayBufferToDataUrl(file, 'image/png')));
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

    toggleReceivedFilesModal = () => {
        this.receivedFilesEl.classList.toggle('hide');
    }

    /**
     * 
     * @param {ArrayBuffer} arrayBuffer 
     * @param {String} mime 
     */
    arrayBufferToDataUrl = (arrayBuffer, mime) => {
        const bytes = new Uint8Array(arrayBuffer); // convert the ArrayBuffer to plain array of bytes
                
        const STRING_CHAR = bytes.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, '');

        let base64String = btoa(STRING_CHAR);

        return `data:${mime};base64, ${base64String}`;
    }
}