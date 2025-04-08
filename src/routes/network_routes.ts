import {Express, Request, Response} from "express";
import { Network } from "../network/network";

function networkEndpoint(app: Express, network: Network) {
  app.get('/network', (_req: Request, res: Response) => {
    res.send(network.peers);
  });
}

function addPeer(app: Express, network: Network) {
  app.post('/network/node', (req: Request, res: Response) => {
    const peer = req.body;
    const broadcast = req.query.broadcast === 'true';
    network.addPeer(peer, broadcast) ? res.status(201).send(peer) : res.status(400);
  });
}

export function networkRoutes(app: Express, network: Network) {
  networkEndpoint(app, network);
  addPeer(app, network);
}
