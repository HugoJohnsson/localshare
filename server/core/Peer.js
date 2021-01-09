const Moniker = require('moniker');

/*
    Represents one peer connected to the signaling server.

    Takes in a socket object from the "connection" event
    on the WebSocket server and the IP of the connecting client.
*/
class Peer {
    constructor(socket, ip) {
        this.socket = socket;
        this.ip = ip;

        this.id = Math.floor(Math.random() * 10000); // Temporary solution to unique id
        this.name = Moniker.choose();
    }

    serialize() {
        return {
            id: this.id,
            name: this.name
        }
    }
}

module.exports = Peer;