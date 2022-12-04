// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

import path from 'path';
import '@nomiclabs/hardhat-ethers';
import { artifacts, network, ethers } from 'hardhat';
import { writeFile, mkdir, existsSync, readFile } from 'fs';
import { promisify } from 'util';
import { BaseContract } from 'ethers';
import { join } from 'path';
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

  const greeterFactory = await ethers.getContractFactory('Greeter');
  const greeter = await greeterFactory.deploy('Hello World');

  const tokenFactory = await ethers.getContractFactory('Token');
  const token = await tokenFactory.deploy();

  await greeter.deployed();
  await token.deployed();

  console.log('Greeter deployed to:', greeter.address);
  console.log('Token deployed to:', token.address);

  // We also save the contract's artifacts and address in the frontend directory
  await saveFrontendFiles(greeter, 'Greeter');
  await saveFrontendFiles(token, 'Token');
}

const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');

async function writeAbi(contractName: string) {
  const ContractArtifact = await artifacts.readArtifact(contractName);

  const abiTs = `export const abi = ${JSON.stringify(ContractArtifact.abi, null, 2)} as const`;

  const contractDir = path.join(contractsDir, contractName);

  if (!existsSync(contractDir)) {
    await mkdirAsync(contractDir);
  }

  await writeFileAsync(path.join(contractDir, 'abi.ts'), abiTs);
}

type Addresses = {
  [network: string]: string;
};

async function writeContractAddress(contract: BaseContract, contractName: string) {
  let currentAddresses: Addresses;

  const contractAddressesFile = path.join(contractsDir, contractName, 'addresses.json');

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
    [network.name]: contract.address,
  };

  await writeFileAsync(contractAddressesFile, JSON.stringify(updatedAddresses, undefined, 2));
}

async function saveFrontendFiles(contract: BaseContract, contractName: string) {
  const contractFolder = join(contractsDir, contractName);
  if (!existsSync(contractFolder)) {
    await mkdirAsync(contractFolder);
  }

  await writeContractAddress(contract, contractName);

  await writeAbi(contractName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
