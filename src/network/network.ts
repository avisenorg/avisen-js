export interface Node {
  address: string;
  type: NodeType;
}

export enum NodeType {
  PUBLISHER = 'PUBLISHER',
  REPLICA = 'REPLICA',
  UTILITY = 'UTILITY',
}

export class Network {
  peers: Node[] = [];

  addPeer(peer: Node, _broadcast: boolean): boolean {
    if (this.peers.find(p => p.address === peer.address)) {
      return false;
    }
    this.peers.push(peer);
    return true;
  }
}