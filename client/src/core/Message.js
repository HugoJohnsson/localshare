/*
    Represents a message that will be sent over
    the websocket connections.
*/
export default class Message {
    constructor(type, message) {
        this.type = type;
        this.message = message;
    }

    toJSON() {
        return JSON.stringify({
            type: this.type,
            message: this.message
        });
    }
}