import makeAvailablePeerElement from '../components/availablePeer';
import makeProcessingFileElement from '../components/processingFile';
import makeReceivedFileElement from '../components/receivedFile';
import Events from './Events';
import EventType from './model/EventType';

export default class UI {
    constructor() {
        this.availablePeersEl = document.getElementById('available-peers');
        this.filesEl = document.getElementById('files');
        this.fileInputEl = document.getElementById('file-input');
        this.fileInputEl.addEventListener('change', this.handleFileUpload);
        this.processingFilesEl = document.getElementById('processing_files');
        this.receivedFilesEl = document.getElementById('received_files');
        this.receivedFilesList = document.getElementById('received_files_list');

        Events.listen(EventType.PEER_JOINED, this.onPeerJoined);
        Events.listen(EventType.PEER_LEFT, this.onPeerLeft);
        Events.listen(EventType.RECEIVED_AVAILABLE_PEERS, this.onReceivedAvailablePeers);
        Events.listen(EventType.RECEIVED_PERSONAL_NAME, this.onReceivedPersonalName);
        Events.listen(EventType.PEERS_CONNECTED, this.onPeersConnected);
        Events.listen(EventType.FILE_RECEIVED, this.onFileReceived);
        Events.listen(EventType.FILE_RECEIVED_DATA, this.onFileReceivedData)
        Events.listen(EventType.START_FILE_UPLOAD, this.onStartFileUpload);
    }

    /**
     * 
     * @param {Event} e 
     */
    handleFileUpload = (e) => {
        Events.trigger(EventType.FILE_UPLOAD, { files: e.target.files });
    }

    /**
     * 
     * @param {CustomEvent} e 
     */
    onStartFileUpload = (e) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            this.processingFilesEl.append(makeProcessingFileElement(event.target.result, { name: e.detail.file.name, size: e.detail.file.size }));
        });
        reader.readAsDataURL(e.detail.file)
    }

    /**
     * file = ArrayBuffer
     * 
     * @param {CustomEvent} e 
     */
    onFileReceived = async (e) => {
        this.showReceivedFilesModal();

        const blob = new Blob(e.detail.chunks, { type: e.detail.header.mime });

        this.blobToDataURL(blob, (dataUrl) => this.receivedFilesList.append(makeReceivedFileElement(dataUrl, e.detail.header)));
    }

    /**
     * Sets the status of a processing image to "received"
     * 
     * @param {CustomEvent} e 
     */
    onFileReceivedData = (e) => {
        for (const processingFileEl of this.processingFilesEl.children) {
            if (processingFileEl.fileName === e.detail.fileName) {
                processingFileEl.querySelector('.files__processing_file_status').textContent = 'Received';
            }
        }
    }

    /**
     * Converts a blob to a dataURL
     * 
     * @param {Blob} blob 
     */
    blobToDataURL(blob, callback) {
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(blob);
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

    showReceivedFilesModal = () => {
        this.receivedFilesEl.classList.remove('hide');
    }
}