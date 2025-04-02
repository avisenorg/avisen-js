export type NodeMode = "PUBLISHER" | "REPLICA" | "UTILITY";

export function nodeMode(): NodeMode {
  return process.env.NODE_MODE as NodeMode;
}

export function nodeAddress(): string {
  return process.env.NODE_ADDRESS as string;
}
