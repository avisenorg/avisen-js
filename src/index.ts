import express from 'express';
import {routes} from "./routes/routes";
import {middleware} from "./middleware/middleware";
import 'dotenv/config'
import {nodeMode} from "./utils/env_vars";
import { Network } from './network/network';

const app = express();
const port = 8085;
const mode = nodeMode();

const network = new Network();

middleware(app);
routes(app, mode, network);

console.log(`Starting up node as ${mode}`);

console.log('Completed node startup.');

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
