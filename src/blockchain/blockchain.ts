import { Prisma, PrismaClient } from '@prisma/client';
import { JsonArray, JsonObject } from '@prisma/client/runtime/library';
import { generateHash, sign, verify } from '../crypto/crypto';

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

export class Blockchain {
  private prisma: PrismaClient;
  private unprocessedArticles: Article[];
  private unprocessedPublishers: Publisher[];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.unprocessedArticles = [];
    this.unprocessedPublishers = [];
  }

  async chain(page: number, size: number): Promise<Block[]> {
    const blocks = await this.prisma.block.findMany({
      skip: page * size,
      take: size,
    });

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

  async processBlock(block: Block): Promise<boolean> {
    const latestBlock = await this.prisma.block.findFirst({
      orderBy: {
        height: 'desc',
      },
    });

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

    await this.prisma.block.create({
      data: {
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
        data: block.data as unknown as JsonObject,
        publisherKey: block.publisherKey,
        signature: block.signature,
        height: block.height,
      },
    });

    return true;
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
