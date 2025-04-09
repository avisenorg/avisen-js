import {Express, Request, Response} from "express";
import { Blockchain } from "../blockchain/blockchain";

function chainRoute(app: Express, blockchain: Blockchain) {
  app.get('/blockchain', async (req: Request, res: Response) => {
    const page = Number(req.query.page ? req.query.page : 0);
    const size = Number(req.query.size ? req.query.size : 10);
    
    res.send(await blockchain.chain(page, size));
  });
}

function getBlockRoute(app: Express, blockchain: Blockchain) {
  app.get('/blockchain/block/:hash', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    res.send(await blockchain.getBlock(hash));
  });
}

function processArticleRoute(app: Express, blockchain: Blockchain) {
  app.post('/article', async (req: Request, res: Response) => {
    const article = req.body;
    const processed = await blockchain.processArticle(article);
    
    if (!processed.processed) {
      res.status(400).send();
    }

    if (processed.block) {
      console.log(`Minted a new block: ${processed.block.hash}`);

      res.status(201).send();
    } else {
      console.log('Processed a new article');
      res.status(200).send();
    }
  });
}

export function blockchainRoutes(app: Express, blockchain: Blockchain) {
  chainRoute(app, blockchain);
  getBlockRoute(app, blockchain);
  processArticleRoute(app, blockchain);
}
