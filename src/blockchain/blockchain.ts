import { Prisma } from '@prisma/client';
import { JsonArray, JsonObject } from '@prisma/client/runtime/library';
import { generateHash, sign, verify } from '../crypto/crypto';
import { Storage } from '../storage/storage';

export interface Block {
  hash: string;
  previousHash: string;
  timestamp: number;
  data: TransactionData;
  publisherKey: string;
  signature: string;
  height: number;
}

interface TransactionData {
  articles: Article[];
  publishers: Publisher[];
}

interface Article {
  authorKey: string;
  byline: string;
  headline: string;
  section: string;
  content?: string;
  contentHash: string;
  date: string;
  signature: string;
  hash: string;
}

interface Publisher {
  publicKey: string;
}

interface ProcessedArticle {
  processed: boolean;
  block?: Block;
}

export class Blockchain {
  private storage: Storage;
  private unprocessedArticles: Article[];
  private unprocessedPublishers: Publisher[];
  private publisherPublicKey: string;
  private publisherPrivateKey: string;

  constructor(storage: Storage) {
    this.storage = storage;
    this.unprocessedArticles = [];
    this.unprocessedPublishers = [];
    this.publisherPublicKey = process.env.PUBLISHER_PUBLIC_KEY as string;
    this.publisherPrivateKey = process.env.PUBLISHER_PRIVATE_KEY as string;
  }

  async chain(page: number, size: number): Promise<Block[]> {
    const blocks = await this.storage.getBlocks(page, size);

    return blocks.map((block) => {
      return {
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: Number(block.timestamp),
        data: this.convertData(block.data as Prisma.JsonObject),
        publisherKey: block.publisherKey,
        signature: block.signature,
        height: Number(block.height),
      }
    });
  }

  async getBlock(hash: string): Promise<Block | null> {
    const block = await this.storage.getBlock(hash);

    if (!block) {
      return null;
    }

    return {
      hash: block.hash,
      previousHash: block.previousHash,
      timestamp: Number(block.timestamp),
      data: this.convertData(block.data as Prisma.JsonObject),
      publisherKey: block.publisherKey,
      signature: block.signature,
      height: Number(block.height),
    }
  }

  async processBlock(block: Block): Promise<boolean> {
    const latestBlock = await this.storage.latestBlock();

    if (latestBlock) {
      if (Number(latestBlock.height) > block.height) {
        return false;
      }

      if (block.previousHash !== latestBlock.hash) {
        return false;
      }

      if (block.timestamp <= Number(latestBlock.timestamp)) {
        return false;
      }

      const publishers = (latestBlock.data as JsonObject).publishers as JsonArray;

      if (!publishers.includes(block.publisherKey)) {
        return false;
      }

      const signatureInputData = block.previousHash + JSON.stringify(block.data) + block.timestamp + block.height;

      if (!verify(Buffer.from(block.publisherKey, 'base64'), signatureInputData, block.signature)) {
        return false;
      }
    }

    await this.storage.createBlock(block);

    return true;
  }

  async processArticle(article: Article): Promise<ProcessedArticle> {
    // Verify the article content
    if (article.content && (article.content.length === 0 || article.content.length > 7500)) {
      return {
        processed: false,
        block: undefined,
      }
    }

    // Verify the content hash
    if (article.content && article.contentHash !== generateHash(article.content)) {
      return {
        processed: false,
        block: undefined,
      }
    }

    // Verify the signature
    let signatureInputData = article.byline + article.headline + article.section
    if (article.content) {
      signatureInputData += article.content;
    }
    signatureInputData += article.contentHash + article.date;

    if (!verify(Buffer.from(article.authorKey, 'base64'), signatureInputData, article.signature)) {
      return {
        processed: false,
        block: undefined,
      }
    }
    
    this.unprocessedArticles.push(article);

    /*
         * if the unprocessed article count is 10 or greater,
         * mint the articles into a Block and add it to the chain.
         */
    if (this.unprocessedArticles.length >= 10) {
      const timestamp = Date.now();
      const latestBlock = await this.storage.latestBlock();

      if (!latestBlock) {
        return {
          processed: true,
          block: undefined,
        }
      }
      
      const previousHash = latestBlock.hash;
      const height = Number(latestBlock.height) + 1;
      const data = {
        articles: this.unprocessedArticles,
        publishers: ((latestBlock.data as JsonObject).publishers as JsonArray).concat(this.unprocessedPublishers as unknown as JsonArray) as unknown as Publisher[],
      }
      const hash = generateHash(previousHash + timestamp + JSON.stringify(data));

      const block = {
        hash,
        previousHash,
        timestamp,
        data,
        publisherKey: this.publisherPublicKey,
        signature: sign(Buffer.from(this.publisherPrivateKey, 'base64'), previousHash + JSON.stringify(data) + timestamp + height),
        height,
      }

      await this.storage.createBlock(block);

      this.unprocessedArticles = [];
      this.unprocessedPublishers = [];

      return {
        processed: true,
        block,
      }
    }

    return {
      processed: true,
      block: undefined,
    };
  
  }

  genesisBlock(): Block {
    const publisherPublicKey = process.env.PUBLISHER_PUBLIC_KEY as string;
    const publisherPrivateKey = process.env.PUBLISHER_PRIVATE_KEY as string;
    const data = {
        articles: [],
        publishers: [{
          publicKey: publisherPublicKey,
        }]
    }

    const timestamp = Date.now();
    const height = 0;

    return {
      publisherKey: publisherPublicKey,
      signature: sign(Buffer.from(publisherPrivateKey, 'base64'), JSON.stringify(data) + timestamp + height),
      data,
      previousHash: '',
      timestamp,
      height,
      hash: generateHash(timestamp + JSON.stringify(data)),
    }
  }

  convertData(blockData: Prisma.JsonObject): TransactionData {
    const articles = (blockData.articles as JsonArray).map((article) => {
      if (article && typeof article === 'object') {
        let articleObject = article as JsonObject;

        return {
          authorKey: articleObject.authorKey as string,
          byline: articleObject.byline as string,
          headline: articleObject.headline as string,
          section: articleObject.section as string,
          content: articleObject.content as string | undefined,
          contentHash: articleObject.contentHash as string,
          date: articleObject.date as string,
          signature: articleObject.signature as string,
          hash: articleObject.hash as string,
        }
      }
      throw new Error('Invalid articles data');
    })

    const publishers = (blockData.publishers as JsonArray).map((publisher) => {
      if (publisher && typeof publisher === 'object') {
        let publisherObject = publisher as JsonObject;
        return {
          publicKey: publisherObject.publicKey as string,
        }
      }
      throw new Error('Invalid publishers data');
    })

    return {
      articles,
      publishers,
    }
  }
}
