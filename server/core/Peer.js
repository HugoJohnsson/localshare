/*
    Represents one peer connected to the signaling server.

    Takes in a socket object from the "connection" event
    on the WebSocket server and the IP of the connecting client.
*/
class Peer {
    constructor(socket, ip) {
        this.socket = socket;
        this._ip = ip;

        this.id = Math.floor(Math.random() * 10000); // Temporary solution to unique id
    }
}

module.exports = Peer;