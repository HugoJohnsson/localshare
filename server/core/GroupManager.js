/**
 * Manages and provides an abstraction over
 * "groups" and the actions you can take on them.
 */
class GroupManager {

    constructor() {
        this.groups = {}; // Holds all "groups", one group is created for every unique IP address
    }

    /**
     * 
     * @param {Peer} peer 
     */
    addToGroup(peer) {
        if (!this.groups[peer.ip]) { // Create the room if one doesn't exist
            this.groups[peer.ip] = {};
        }
    
        this.groups[peer.ip][peer.id] = peer;
    }

    /**
     * 
     * @param {Peer} peer 
     */
    leaveGroup(peer) {
        if (!this.groups[peer.ip] || !this.groups[peer.ip][peer.id]) return;

        // Delete peer from group
        delete this.groups[peer.ip][peer.id];

        // Delete the group if it's empty
        if (!Object.keys(this.groups[peer.ip]).length) {
            delete this.groups[peer.ip];
        }

        // Terminate the peer socket
        peer.socket.terminate();
    }

    /**
     * 
     * @param {String} ip
     * @returns {Array} 
     */
    getGroupByIp(ip) {
        return this.groups[ip];
    }

}

module.exports = GroupManager;