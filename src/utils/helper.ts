// utils/addressTruncator.ts

export function truncateAddress(address: string): string {
  if (!address) {
    throw new Error("Invalid address");
  }

  const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`;
  return truncated;
}

export const getClusterUrl = (cluster: string): string => {
  const clusterUrl: any = {
    "mainnet-beta": "https://api.mainnet-beta.solana.com",
    testnet: "https://api.testnet.solana.com",
    devnet: "https://api.devnet.solana.com",
    localhost: "http://localhost:8899",
  };

  return clusterUrl[cluster];
};

export const getCluster = (cluster: string): string => {
  const clusters: any = {
    "https://api.mainnet-beta.solana.com": "mainnet-beta",
    "https://api.testnet.solana.com": "testnet",
    "https://api.devnet.solana.com": "devnet",
    "http://localhost:8899": "custom",
  };

  return clusters[getClusterUrl(cluster)];
};
