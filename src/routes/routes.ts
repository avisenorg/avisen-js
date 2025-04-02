import {Express, Request, Response} from "express";
import {nodeAddress, nodeMode} from "../utils/env_vars";
import {validateNetworkIdHeader} from "../middleware/middleware";

function helloWorld(app: Express) {
  app.get('/', (_req: Request, res: Response) => {
    res.send({ message: 'Hello World!'});
  });
}

function status(app: Express) {
  app.get("/status", (_req: Request, res: Response) => {
    res.send({
      "networkId": process.env.NETWORK_ID,
      "node": {
        "address": nodeAddress(),
        "type": nodeMode(),
      },
    });
  });
}

export function routes(app: Express) {
  helloWorld(app)

  status(app)
}
