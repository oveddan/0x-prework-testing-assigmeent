import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig, useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi';
import './App.css';
import '@rainbow-me/rainbowkit/styles.css';
import { chains, client } from './web3/client';
import Web3Login from './web3/Web3Login';
import TokenTestFunctions from './components/TokenTestFunctions';
import { useCallback, useContext, useMemo, useState } from 'react';
import useContractAddress from './hooks/useContractAddress';
import { abi as greeterAbi } from './contracts/Greeter/abi';
import { abi as tokenAbi } from './contracts/Token/abi';
import { BigNumber } from 'ethers';

function SetGreeting({ greeterAddress, tokenAddress }: { greeterAddress: string; tokenAddress: string }) {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState<string>('');

  const { data: greet } = useContractRead({
    abi: greeterAbi,
    address: greeterAddress,
    functionName: 'greet',
    watch: true,
  });

  const { config: setGreetingConfig } = usePrepareContractWrite({
    abi: greeterAbi,
    address: greeterAddress,
    functionName: 'setGreeting',
    args: [greeting],
  });
  const { write: setGreeting } = useContractWrite(setGreetingConfig);

  const { data: balance } = useContractRead({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'balanceOf',
  });

  const [userAccount, setUserAccount] = useState<`0x${string}`>('0x');
  const [amount, setAmount] = useState<string>('');

  const transferArgs = useMemo(() => {
    return [userAccount, BigNumber.from(amount)];
  }, [userAccount, amount]);

  const { config: setTransferConfig } = usePrepareContractWrite({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'transfer',
    // @ts-ignore
    args: transferArgs,
  });

  const { write: transfer } = useContractWrite(setTransferConfig);

  return (
    <div className="App py-10">
      <header className="App-header">
        <p>
          <label>Current Greeting: {greet}</label>
        </p>
        <p>
          <input onChange={(e) => setGreetingValue(e.target.value)} placeholder="Set greeting" />
        </p>
        <p>
          {/* @ts-ignore */}
          <button onClick={setGreeting}>Set Greeting</button>
        </p>
      </header>
      <div className="py-10">
        <br />
        <p>
          <label>
            <>Current Balance: {balance}</>
          </label>
        </p>
        {/* @ts-ignore */}
        <input onChange={(e) => setUserAccount(e.target.value)} placeholder="Account ID" />
        <input onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <button onClick={transfer}>Send Coins</button>
      </div>
    </div>
  );
}

function SetGreetingWrapper() {
  const greeterAddress = useContractAddress('greeter');
  const tokenAddress = useContractAddress('token');

  if (!greeterAddress || !tokenAddress) return null;

  return <SetGreeting greeterAddress={greeterAddress} tokenAddress={tokenAddress} />;
}

function App() {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains}>
        <Web3Login />
        <SetGreetingWrapper />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
