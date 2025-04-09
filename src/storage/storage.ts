import { Block, PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Block as BlockchainBlock } from "../blockchain/blockchain";
export class Storage {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async getBlocks(page: number, size: number, fromHeight?: number): Promise<Block[]> {
    if (fromHeight) {
      return await this.prisma.block.findMany({
        skip: page * size,
        take: size,
        where: {
          height: {
            gt: fromHeight,
          },
        },
      });
    } else {
      return await this.prisma.block.findMany({
        skip: page * size,
        take: size,
      });
    }
  }
  
  async getBlock(hash: string): Promise<Block | null> {
    return await this.prisma.block.findUnique({
      where: {
        hash,
      },
    });
  }

  async latestBlock(): Promise<Block | null> {
    return await this.prisma.block.findFirst({
      orderBy: {
        height: 'desc',
      },
    });
  }

  async createBlock(block: BlockchainBlock): Promise<void> {
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
  }

  async getArticle(hash: string): Promise<Block | null> {
    return await this.prisma.block.findFirst({
      where: {
        data: {
          path: ['articles'],
          array_contains: [{ id: hash }]
        }
      },
    });
  }
}
