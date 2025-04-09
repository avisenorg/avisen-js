import { Block } from "../blockchain/blockchain";

export interface Node {
  address: string;
  type: NodeType;
}

export interface Info {
  networkId: string;
  node: Node;
}

export type NodeType = 'PUBLISHER' | 'REPLICA' | 'UTILITY';

export class Network {
  peers: Node[] = [];
  networkId: string;

  constructor() {
    this.networkId = process.env.NETWORK_ID || 'local';
  }

  addPeer(peer: Node, broadcast: boolean): boolean {
    if (this.peers.find(p => p.address === peer.address)) {
      return false;
    }
    this.peers.push(peer);

    if (broadcast) {
      this.peers.forEach(p => {
        if (p.address !== peer.address) {
          fetch(`${p.address}/network/node?broadcast=true`, {
            method: 'POST',
            body: JSON.stringify(peer),
          });
        }
      });
    }

    return true;
  }

  async downloadPeers(fromAddress: string) {
    const response = await fetch(`${fromAddress}/network`, {
      headers: {
        'X-Network-ID': this.networkId,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download peers from ${fromAddress} with status ${response.status}`);
    }

    const peers = await response.json();
    this.peers.push(...peers);
  }

  async downloadPeerInfo(address: string): Promise<Info> {
    const response = await fetch(`${address}/status`);

    if (!response.ok) {
      throw new Error(`Failed to download peer info from ${address}`);
    }

    const info = await response.json();
    return info;
  }

  async updatePeer(address: string, node: Node) {
    const response = await fetch(`${address}/network/node`, {
      method: 'POST',
      body: JSON.stringify(node),
      headers: {
        'X-Network-ID': this.networkId,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update peer ${address} with status ${response.status}`);
    }
  }

  async downloadBlocks(address: string, page: number): Promise<Block[]> {
    const response = await fetch(`${address}/blockchain?page=${page}&size=10`, {
      headers: {
        'X-Network-ID': this.networkId
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download blocks from ${address} with status ${response.status}`);
    }

    const blocks: Block[] = await response.json();
    return blocks;
  }
}
