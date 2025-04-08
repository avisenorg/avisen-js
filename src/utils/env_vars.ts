import { NodeType } from "../network/network";

export function nodeMode(): NodeType {
  return process.env.NODE_MODE as NodeType;
}

export function nodeAddress(): string {
  return process.env.NODE_ADDRESS as string;
}
