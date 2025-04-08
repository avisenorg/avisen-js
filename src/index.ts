import express from 'express';
import {routes} from "./routes/routes";
import {middleware} from "./middleware/middleware";
import 'dotenv/config'
import {nodeAddress, nodeMode} from "./utils/env_vars";
import { Network } from './network/network';
import { boot } from './network/boot';

const app = express();
const port = 8085;
const mode = nodeMode();

console.log(`Starting up node as ${mode}`);

const network = new Network();

const bootNodeAddress = process.env.BOOT_NODE;

if (bootNodeAddress) {
  console.log('Boot node address found. Starting boot process.');
  console.log('Starting with network id:', network.networkId);
  boot(
    network, 
    bootNodeAddress, 
    {
      address: nodeAddress(),
      type: nodeMode(),
    }
  );
} else {
  console.log('No boot node address found.');
}


middleware(app);
routes(app, mode, network);

console.log('Completed node startup.');

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
