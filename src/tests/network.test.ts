import { Network, NodeType } from "../network/network";

describe('Network', () => {
  describe('addPeer', () => {
    it('should add a peer', () => {
      const network = new Network();
      network.addPeer({ address: '127.0.0.1', type: 'PUBLISHER' }, false);
      expect(network.peers.length).toBe(1);
      expect(network.peers[0].address).toBe('127.0.0.1');
      expect(network.peers[0].type).toBe('PUBLISHER');
    });

    it('should not add a peer if it already exists', () => {
      const network = new Network();
      network.addPeer({ address: '127.0.0.1', type: 'PUBLISHER' }, false);
      network.addPeer({ address: '127.0.0.1', type: 'PUBLISHER' }, false);
      expect(network.peers.length).toBe(1);
    });
  });
});
