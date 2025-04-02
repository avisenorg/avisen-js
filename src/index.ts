import express from 'express';
import {routes} from "./routes/routes";
import {middleware} from "./middleware/middleware";
import 'dotenv/config'
import {nodeMode} from "./utils/env_vars";

const app = express();
const port = 8085;
const mode = nodeMode()

middleware(app);
routes(app);

console.log(`Starting up node as ${mode}`)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
