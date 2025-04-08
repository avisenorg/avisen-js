import { Blockchain } from "../blockchain/blockchain";
import { Info, Network, Node } from "./network";

export async function boot(network: Network, bootNodeAddress: string, nodeInfo: Node, blockchain: Blockchain) {
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

  const currentChain = await blockchain.chain(0, 1);

  if (currentChain.length === 0) {
    console.log('Downloading full blockchain...');

    let page = 0;
    let newBlocks = await network.downloadBlocks(bootNodeAddress, page);

    while (newBlocks.length > 0) {
      for (const block of newBlocks) {
        await blockchain.processBlock(block);
      }

      page++;
      newBlocks = await network.downloadBlocks(bootNodeAddress, page);
    }
  } else {
    console.log('Blockchain already exists. Checking for new blocks...');
  }

  console.log('Adding self to the network...');
  network.updatePeer(bootNodeAddress, nodeInfo).catch((reason) => {
    throw new Error(`Failed to add self to the network: ${reason}`);
  });
}
