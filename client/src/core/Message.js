/*
    Represents a message that will be sent over
    the websocket connections.
*/
export default class Message {
    constructor(type, data, toPeerId) {
        this.type = type;
        this.data = data;
        this.toPeerId = toPeerId;
    }

    toJSON() {
        return JSON.stringify({
            type: this.type,
            data: this.data,
            toPeerId: this.toPeerId
        });
    }
}