import { useEffect, useMemo, useState } from 'react';
import { chain } from 'wagmi';
import { useAccount } from 'wagmi';
import token from '../contracts/token/addresses.json';
import greeterAddress from '../contracts/greeter/addresses.json';

const addresses = {
  token: token,
  greeter: greeterAddress,
};

const getContractAddress = (chainId: number, folder: string): string => {
  const chains = [...Object.values(chain)];

  const chainForId = chains.find((x) => x.id === chainId);

  if (!chainForId) {
    throw new Error(`invalid chain id ${chainForId}`);
  }

  let chainName = chainForId.name;

  if (chainName === 'Hardhat') {
    chainName = 'localhost';
  }

  if (chainName === 'Polygon Mumbai') {
    chainName = 'mumbai';
  }

  // @ts-ignore
  const contractAddresses = addresses[folder];

  if (!contractAddresses) throw new Error(`not address for ${folder}`);

  const genericAddresses = contractAddresses as { [address: string]: string };

  if (!genericAddresses[chainName]) throw new Error(`contract not deployed for chain ${chainName}`);

  return genericAddresses[chainName];
};

const useContractAddress = (contractFolder: string) => {
  const { connector: activeConnector, isConnected } = useAccount();

  const [contractAddress, setContractAddress] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const chainId = await activeConnector?.getChainId();

      if (!chainId) return;

      const addressAndAbi = getContractAddress(chainId, contractFolder);

      setContractAddress(addressAndAbi);
    })();
  }, [activeConnector, isConnected]);

  return contractAddress;
};

export default useContractAddress;
