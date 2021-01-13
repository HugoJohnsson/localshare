/*
    Represents a message that will be sent over
    the websocket connections.
*/
class Message {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }

    toJSON() {
        return JSON.stringify({
            type: this.type,
            data: this.data,
        });
    }
}

module.exports = Message;