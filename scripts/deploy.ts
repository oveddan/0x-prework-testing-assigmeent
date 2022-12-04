// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

import path from 'path';
import '@nomiclabs/hardhat-ethers';
import { artifacts, network, ethers } from 'hardhat';
import { MyToken } from '../typechain-types';
import { writeFile, mkdir, existsSync, readFile } from 'fs';
import { promisify } from 'util';
import { Utf8ErrorFuncs } from 'ethers/lib/utils';
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);
const mkdirAsync = promisify(mkdir);

async function main() {
  // This is just a convenience check

  if (network.name === 'hardhat') {
    console.warn(
      'You are trying to deploy a contract to the Hardhat Network, which' +
        'gets automatically created and destroyed every time. Use the Hardhat' +
        " option '--network localhost'",
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  const address = await deployer.getAddress();
  console.log('Deploying the contracts with the account:', address);

  console.log('Account balance:', (await deployer.getBalance()).toString());

  const contractFactory = await ethers.getContractFactory('MyToken');
  const deployedContract = await contractFactory.deploy();
  await deployedContract.deployed();

  console.log('Contract address:', deployedContract.address);

  // We also save the contract's artifacts and address in the frontend directory
  await saveFrontendFiles(deployedContract);
}

const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');

async function writeAbi() {
  const ContractArtifact = await artifacts.readArtifact('MyToken');

  const abiTs = `export const abi = ${JSON.stringify(ContractArtifact.abi, null, 2)} as const`;

  await writeFileAsync(path.join(contractsDir, 'abi.ts'), abiTs);
}

const contractAddressesFile = path.join(contractsDir, 'addresses.json');

type Addresses = {
  [network: string]: string;
};

async function writeContractAddress(token: MyToken) {
  let currentAddresses: Addresses;

  if (!existsSync(contractAddressesFile)) {
    currentAddresses = {};
  } else {
    currentAddresses = JSON.parse(
      await readFileAsync(contractAddressesFile, {
        encoding: 'utf-8',
      }),
    ) as Addresses;
  }

  const updatedAddresses = {
    ...currentAddresses,
    [network.name]: token.address,
  };

  await writeFileAsync(contractAddressesFile, JSON.stringify(updatedAddresses, undefined, 2));
}

async function saveFrontendFiles(token: MyToken) {
  if (!existsSync(contractsDir)) {
    await mkdirAsync(contractsDir);
  }

  await writeContractAddress(token);

  await writeAbi();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
