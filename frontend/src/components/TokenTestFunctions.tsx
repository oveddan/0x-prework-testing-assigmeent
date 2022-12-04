import { GetContractArgs } from '@wagmi/core';
import { useCallback, useState } from 'react';
import { useContract, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useTokenContractAddress from '../hooks/useTokenContractAddressAndAbi';
import { abi } from '../contracts/abi';
import { Token, SafeMintCall } from '../../../subgraph/generated/Token/Token';

const TokenOwnerId = ({ contractAddress }: { contractAddress: string }) => {
  const { data, isError, isLoading } = useContractRead({
    abi,
    address: contractAddress,
    functionName: 'owner',
  });

  return (
    <>
      <label>Owner: {data}</label>
    </>
  );
};

const MintForm = ({ contractAddress }: { contractAddress: string }) => {
  const [to, setTo] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const [ipfsHash, setIpfsHash] = useState<string>('asdfasdfasdfa');

  const args: [`0x${string}`, string] = [to, ipfsHash];

  const { config, error, isError } = usePrepareContractWrite({
    address: contractAddress,
    abi,
    functionName: 'safeMint',
    args,
  });

  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  const handleSubmit = useCallback(() => {
    if (write) {
      write();
    }
  }, [write]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <legend>Mint Token</legend>
        <div className="mb-6">
          <label htmlFor="to" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            to
          </label>
          <input
            type="text"
            id="to"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="0x000"
            required
            value={to}
            onChange={(e) =>
              // @ts-ignore
              setTo(e.target.value)
            }
          />
        </div>
        <div className="mb-6">
          <label htmlFor="ipfsHash" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            ipfs hash
          </label>
          <input
            type="text"
            id="ipfsHash"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="0x000"
            required
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          disabled={!write}
        >
          Submit
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
        {isError && <div>Error: {error?.message}</div>}
      </form>
    </>
  );
};

const TokenTestFunctions = () => {
  const contractAddress = useTokenContractAddress();

  if (!contractAddress) return <h3>Missing abi</h3>;

  return (
    <>
      <TokenOwnerId contractAddress={contractAddress} />
      <MintForm contractAddress={contractAddress} />
    </>
  );
};

export default TokenTestFunctions;
