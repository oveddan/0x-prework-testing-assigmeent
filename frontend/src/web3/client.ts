import { chain, createClient, configureChains, Chain, ChainProviderFn } from 'wagmi';

import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import contractAddresses from '../contracts/addresses.json';

type ChainIds = keyof typeof contractAddresses;

const getAllowedChains = () =>
  (Object.keys(contractAddresses) as ChainIds[]).map((chainName) => {
    if (chainName === 'localhost') return chain.hardhat;

    if (chainName === 'mumbai') return chain.polygonMumbai;

    const foundChain = Object.values(chain).find((x) => x.name === chainName);

    if (!foundChain) throw new Error(`could not find chain with name ${chainName}`);

    return foundChain;
  });

const getProviders = () => {
  const providers: ChainProviderFn[] = [];

  const alchemyId = import.meta.env.VITE_APP_ALCHEMY_ID;
  if (alchemyId) {
    providers.push(alchemyProvider({ apiKey: alchemyId }));
  }

  const infuraId = import.meta.env.VITE_APP_INFURA_ID;
  if (infuraId) {
    providers.push(infuraProvider({ apiKey: infuraId }));
  }

  providers.push(publicProvider());

  return providers;
};

const { chains, provider, webSocketProvider } = configureChains(getAllowedChains(), getProviders());

const { connectors } = getDefaultWallets({
  appName: import.meta.env.VITE_APP_APP_NAME,
  chains,
});

// Set up client
const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export { client, chains, chain, provider };
