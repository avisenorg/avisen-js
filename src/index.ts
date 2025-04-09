import express from 'express';
import {routes} from "./routes/routes";
import {middleware} from "./middleware/middleware";
import 'dotenv/config'
import {nodeAddress, nodeMode} from "./utils/env_vars";
import { Network } from './network/network';
import { boot } from './network/boot';
import { PrismaClient } from '@prisma/client';
import { Blockchain } from './blockchain/blockchain';

const app = express();
const port = 8085;
const mode = nodeMode();
const bootNodeAddress = process.env.BOOT_NODE;

console.log(`Starting up node as ${mode}`);

if (mode !== 'UTILITY') {
  if (mode === 'PUBLISHER' && !process.env.PUBLISHER_PRIVATE_KEY) {
    console.error('A publisher signing key is required when starting a node in PUBLISHER mode.');
    process.exit(1);
  }

  if (mode === 'PUBLISHER' && !process.env.PUBLISHER_PUBLIC_KEY) {
    console.error('A publisher public key is required when starting a node in PUBLISHER mode.');
    process.exit(1);
  }

  if (mode === 'REPLICA' && !bootNodeAddress) {
    console.error('A boot node is required when starting a node in REPLICA mode.');
    process.exit(1);
  }
}

const network = new Network();
const prisma = new PrismaClient();
const blockchain = new Blockchain(prisma);

if (bootNodeAddress) {
  console.log('Boot node address found. Starting boot process.');
  console.log('Starting with network id:', network.networkId);
  boot(
    network, 
    bootNodeAddress, 
    {
      address: nodeAddress(),
      type: nodeMode(),
    },
    blockchain,
  ).catch((error) => {
    console.error('Error during boot process:', error);
    process.exit(1);
  })
  .finally(() => {
    middleware(app);
    routes(app, mode, network, blockchain);
    
    console.log('Completed node startup.');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    });
  });
} else {
  console.log('No boot node address found.');

  blockchain.chain(0, 1).then((chain) => {
    if (chain.length === 0) {
      console.log('Beginning genesis...');

      const genesisBlock = blockchain.genesisBlock();
      blockchain.processBlock(genesisBlock).then((value: boolean) => {
        if (value) {
          middleware(app);
          routes(app, mode, network, blockchain);
          
          console.log('Completed node startup.');
          
          app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
          });
        } else {
          console.error('Error during genesis block processing');
          process.exit(1);
        }
      }).catch((error) => {
        console.error('Error during genesis block processing:', error);
        process.exit(1);
      });
    } else {
      console.log('Blockchain already detected.')

      middleware(app);
      routes(app, mode, network, blockchain);
      
      console.log('Completed node startup.');
      
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
      });
    }
  }).catch((error) => {
    console.error('Error during blockchain retrieval:', error);
    process.exit(1);
  });
}



