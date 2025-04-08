import { Info, Network, Node } from "./network";

export function boot(network: Network, bootNodeAddress: string, nodeInfo: Node) {
  console.log("Starting download of network peers from boot node...")

  network.downloadPeers(bootNodeAddress).catch((reason) => {
    throw new Error(`Failed to download peers from boot node: ${reason}`);
  });

  // Also get the boot node info
  network.downloadPeerInfo(bootNodeAddress).then((info) => {
    network.addPeer(info.node, false);
  }).catch((reason) => {
    throw new Error(`Failed to download peer info from boot node: ${reason}`);
  });

  console.log('Done downloading peers.');

  console.log('Adding self to the network...');
  network.updatePeer(bootNodeAddress, nodeInfo).catch((reason) => {
    throw new Error(`Failed to add self to the network: ${reason}`);
  });
}
