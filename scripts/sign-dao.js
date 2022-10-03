require("dotenv").config();

const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("../src/signer");
const { readFileSync, writeFileSync } = require("fs");
const { getAddress } = require("ethers/lib/utils");
const hre = require("hardhat");
const { constants } = require("ethers");
const { calculateProxyAddress } = require("@gnosis.pm/safe-contracts");
const { proxyFactory, safeL2Singleton } = require("../src/contract");

function getInstance(name) {
  const address = JSON.parse(readFileSync("relayer/creatorDAOFactory.json"))[
    name
  ];
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`);
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

async function main() {
  const forwarder = await getInstance("MinimalForwarder");
  const daoFactory = await getInstance("CreatorDAOFactory");
  const { SIGNER_KEY: signer, ADMIN_KEY: admin } = process.env;
  const from = new ethers.Wallet(signer).address;
  const owner = new ethers.Wallet(admin).address;

  // Not required at this point
  // const account = "0x287f0B854a2Ba9Dc3E8572c68bDabD949819F119";
  // const account_2 = "0x3AB8866082dcef761FB61F48aaBe7C5741fae889";

  // Setup gnosis wallet
  const singleton = await safeL2Singleton(
    hre,
    process.env.SAFE_SINGLETON_ADDRESS
  );
  const factory = await proxyFactory(hre, process.env.SAFE_PROXY_ADDRESS);
  const signers = [from, owner];
  const threshold = 1;
  const fallbackHandler = getAddress(constants.AddressZero);
  const nonce = new Date().getTime();
  const setupData = singleton.interface.encodeFunctionData("setup", [
    signers,
    threshold,
    getAddress(constants.AddressZero),
    "0x",
    fallbackHandler,
    getAddress(constants.AddressZero),
    0,
    getAddress(constants.AddressZero),
  ]);

  const predictedAddress = await calculateProxyAddress(
    factory,
    singleton.address,
    setupData,
    nonce
  );

  console.log(`calldata is ${setupData}`);
  console.log(`nonce is ${nonce}`);
  console.log(`Deploy safe address to ${predictedAddress}`);

  // NOTE: This will immediately create safe...
  // await factory
  //   .createProxyWithNonce(singleton.address, setupData, nonce)
  //   .then((tx) => tx.wait());

  // Safe setup ends

  const daoConfig = {
    name: "Stupid mainnet DAO",
    owner: from, //This is the actual owner
    treasury: predictedAddress,
  };

  const data = daoFactory.interface.encodeFunctionData("cloneContract", [
    daoConfig.name,
    process.env.SAFE_PROXY_ADDRESS,
    process.env.SAFE_SINGLETON_ADDRESS,
    setupData,
    nonce,
  ]);
  // const data = daoFactory.interface.encodeFunctionData("cloneContract", [
  //   daoConfig.name,
  // ]);
  const result = await signMetaTxRequest(signer, forwarder, {
    to: daoFactory.address, // NOTE: Why to this address ?
    from,
    data,
  });

  writeFileSync("tmp/request.json", JSON.stringify(result, null, 2));
  console.log(`Signature: `, result.signature);
  console.log(`Request: `, result.request);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
