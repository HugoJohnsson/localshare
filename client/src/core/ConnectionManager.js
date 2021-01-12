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
    }

    /**
     * Event handler for the CALL event, sends a message to the signaling server
     * with the type CALL and the message contains the receiving peer id aswell
     * as the "offer" (contains the SDP information).
     * 
     * @param {CustomEvent} e 
     */
    onCallPeer = async (e) => {
        this.peerConnection = new RTCPeerConnection();

        const offer = await this.peerConnection.createOffer();

        await this.peerConnection.setLocalDescription(offer);

        this.wsConnection.send(new Message(MessageType.CALL, { receivingPeerId: e.detail.receivingPeerId, offer }));
    }

    /**
     * Handler for when another peer want to connect.
     * 
     * @param {CustomEvent} e 
     */
    onReceivedCall = async (e) => {
        const { callerPeerId, offer } = e.detail;

        this.peerConnection = new RTCPeerConnection();

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

        console.log("connection open!");
    }
    
}

export default ConnectionManager;