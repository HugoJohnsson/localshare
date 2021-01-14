import Events from './Events';
import EventType from './model/EventType';
import Message from './Message';
import MessageType from './model/MessageType';

class ConnectionManager {
    constructor(wsConnection) {
        this.wsConnection = wsConnection;
        this.peerConnection = null;
        this.dataChannel = null;

        Events.listen(EventType.CALL, this.onCallPeer); // Listen for when the user wants to send files to a peer
        Events.listen(EventType.RECEIVED_CALL, this.onReceivedCall);
        Events.listen(EventType.ANSWERED, this.onAnswered);
        Events.listen(EventType.NEW_ICE_CANDIDATE, this.onReceivedIceCandidate);

        // File transfer
        Events.listen(EventType.FILE_UPLOAD, this.onFileUpload);
    }

    /**
     * Converts the first file to an ArrayBuffer
     * and sends it over the data channel.
     * 
     * TODO: split the file into chunks because right now
     * you can only send small files (web rtc data size limit)
     * 
     * @param {CustomEvent} e 
     */
    onFileUpload = (e) => {
        if (this.peerConnection && this.dataChannel) {
            const file = e.detail.files[0];

            //Check if the file is an image
            if (file.type && file.type.indexOf('image') === -1) {
                return;
            }

            // Convert the file to an ArrayBuffer and send it over the data channel
            const reader = new FileReader();
            reader.addEventListener('load', (event) => this.dataChannel.send(event.target.result));
            reader.readAsArrayBuffer(file)
        }
    }

    /**
     * Handler for messages sent over the RTCPeerConnection
     * 
     * @param {*} message 
     */
    handleMessage = (message) => {
        if (typeof message !== 'string') {
            Events.trigger(EventType.FILE_RECEIVED, { file: message });
        }
    }

    /**
     * Event handler for the CALL event, sends a message to the signaling server
     * with the type CALL and the message contains the receiving peer id aswell
     * as the "offer" (contains the SDP information).
     * 
     * @param {CustomEvent} e 
     */
    onCallPeer = async (e) => {
        if (!this.peerConnection) {
            this.peerConnection = new RTCPeerConnection({
                sdpSemantics: 'unified-plan',
                iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
                iceCandidatePoolSize: 10
            });
    
            this.dataChannel = this.peerConnection.createDataChannel("sendChannel");
    
            const offer = await this.peerConnection.createOffer({offerToReceiveVideo: true});
    
            await this.peerConnection.setLocalDescription(offer);
    
            this.peerConnection.onicecandidate = (iceGatherEvent) => this.onGatheredIceCandidate(e.detail.receivingPeerId, iceGatherEvent);
            this.peerConnection.addEventListener('connectionstatechange', () => {
                if (this.peerConnection.connectionState === 'connected') {
                    Events.trigger(EventType.PEERS_CONNECTED, {});
                }
            });
    
            this.wsConnection.send(new Message(MessageType.CALL, { offer }, e.detail.receivingPeerId));
        }
    }

    /**
     * Handler for when another peer want to connect.
     * 
     * @param {CustomEvent} e 
     */
    onReceivedCall = async (e) => {
        if (!this.peerConnection) {
            this.peerConnection = new RTCPeerConnection({
                sdpSemantics: 'unified-plan',
                iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
                iceCandidatePoolSize: 10
            });
    
            this.peerConnection.addEventListener('datachannel', (dataChannelEvent) => {
                this.dataChannel = dataChannelEvent.channel;
    
                this.dataChannel.addEventListener('message', (messageEvent) => {
                    this.handleMessage(messageEvent.data);
                })
            });
    
            await this.peerConnection.setRemoteDescription(e.detail.offer);
    
            const answer = await this.peerConnection.createAnswer();
    
            await this.peerConnection.setLocalDescription(answer);
    
            this.wsConnection.send(new Message(MessageType.ANSWER, { answer }, e.detail.callerPeerId));
        }
    }

    /**
     * Handler for when you have called another peer
     * and they have answered.
     * 
     * @param {CustomEvent} e 
     */
    onAnswered = async (e) => {
        await this.peerConnection.setRemoteDescription(e.detail.answer);
    }

    /**
     * 
     * @param {*} receivingPeerId 
     * @param {*} e 
     */
    onGatheredIceCandidate = (receivingPeerId, e) => {
        if (e.candidate) {
            this.wsConnection.send(new Message(MessageType.NEW_ICE_CANDIDATE, { candidate: e.candidate }, receivingPeerId));
        }
    }

    /**
     * 
     * @param {CustomEvent} e 
     */
    onReceivedIceCandidate = (e) => {
        this.peerConnection.addIceCandidate(e.detail.candidate);
    }
}

export default ConnectionManager;