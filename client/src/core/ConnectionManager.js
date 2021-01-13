import Events from './Events';
import EventType from './model/EventType';
import Message from './Message';
import MessageType from './model/MessageType';

class ConnectionManager {
    constructor(wsConnection) {
        this.wsConnection = wsConnection;
        this.peerConnection = null;

        Events.listen(EventType.CALL, (e) => this.onCallPeer(e)); // Listen for when the user wants to send files to a peer
        Events.listen(EventType.RECEIVED_CALL, (e) => this.onReceivedCall(e));
        Events.listen(EventType.ANSWERED, (e) => this.onAnswered(e));
        Events.listen(EventType.RECEIVED_ICE_CANDIDATE, (e) => this.onReceivedIceCandidate(e));
    }

    /**
     * Event handler for the CALL event, sends a message to the signaling server
     * with the type CALL and the message contains the receiving peer id aswell
     * as the "offer" (contains the SDP information).
     * 
     * @param {CustomEvent} e 
     */
    onCallPeer = async (e) => {
        this.peerConnection = new RTCPeerConnection({
            sdpSemantics: 'unified-plan', //newer implementation of WebRTC
            iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
            iceCandidatePoolSize: 10
        });

        this.peerConnection.createDataChannel("sendChannel");

        const offer = await this.peerConnection.createOffer({offerToReceiveVideo: true});

        await this.peerConnection.setLocalDescription(offer);

        this.peerConnection.onicecandidate = (iceGatherEvent) => this.onGatheredIceCandidate(e.detail.receivingPeerId, iceGatherEvent);
        this.peerConnection.addEventListener('connectionstatechange', () => {
            if (this.peerConnection.connectionState === 'connected') {
                console.log("peers connected!");
            }
        });

        this.wsConnection.send(new Message(MessageType.CALL, { receivingPeerId: e.detail.receivingPeerId, offer }));
    }

    /**
     * Handler for when another peer want to connect.
     * 
     * @param {CustomEvent} e 
     */
    onReceivedCall = async (e) => {
        const { callerPeerId, offer } = e.detail;

        this.peerConnection = new RTCPeerConnection({
            sdpSemantics: 'unified-plan', //newer implementation of WebRTC
            iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
            iceCandidatePoolSize: 10
        });

        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();

        await this.peerConnection.setLocalDescription(answer);

        this.wsConnection.send(new Message(MessageType.ANSWER, { callerPeerId, answer }));
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
            this.wsConnection.send(new Message(MessageType.GATHERED_ICE_CANDIDATE, { receivingPeerId, candidate: e.candidate }));
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