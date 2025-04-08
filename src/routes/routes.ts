import {Express, NextFunction, Request, Response} from "express";
import {nodeAddress, nodeMode} from "../utils/env_vars";
import {generateECDSAKeys, generateHash, sign, HashContent, SigningPayload} from "../crypto/crypto";
import { networkRoutes } from "./network_routes";
import { Network, NodeType } from "../network/network";
import { Blockchain } from "../blockchain/blockchain";
import { blockchainRoutes } from "./blockchain_routes";

function helloWorld(app: Express) {
  app.get('/', (_req: Request, res: Response) => {
    res.send({ message: 'Hello World!'});
  });
}

function status(app: Express) {
  app.get('/status', (_req: Request, res: Response) => {
    res.send({
      networkId: process.env.NETWORK_ID,
      node: {
        address: nodeAddress(),
        type: nodeMode(),
      },
    });
  });
}

function cryptoHash(app: Express) {
  app.get('/util/crypto/hash', (req: Request, res: Response) => {
    const hashContent: HashContent = req.body;

    res.send({
      content: generateHash(hashContent.content),
    });
  });
}

function cryptoKeyPair(app: Express) {
  app.get('/util/crypto/key-pair', (req: Request, res: Response, next: NextFunction) => {
    try {
      const keyPair = generateECDSAKeys();

      res.status(201).send(keyPair);
    } catch (error) {
      next(error);
    }
  });
}

function cryptoSign(app: Express) {
  app.get('/util/crypto/sign', (req: Request, res: Response, next: NextFunction) => {
    try {
      const signingPayload: SigningPayload = req.body;

      const signature = sign(Buffer.from(signingPayload.privateKey, 'base64'), signingPayload.data)

      res.status(201).send({signature});
    } catch (error) {
      next(error);
    }
  });
}

export function routes(app: Express, mode: NodeType, network: Network, blockchain: Blockchain) {
  helloWorld(app);

  status(app);

  cryptoHash(app);
  cryptoKeyPair(app);
  cryptoSign(app);

  if (mode !== NodeType.UTILITY) {
    networkRoutes(app, network);
    blockchainRoutes(app, blockchain)
  }
}
