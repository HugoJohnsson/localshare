/*
    Represents a message that will be sent over
    the websocket connections.
*/
class Message {
    constructor(type, message = null) {
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

module.exports = Message;