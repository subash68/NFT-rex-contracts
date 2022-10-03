require("dotenv").config();
const POLYGON_PRIVATE_KEY_MUMBAI = process.env.POLYGON_PRIVATE_KEY_MUMBAI;
const POLYGON_MUMBAI_GATEWAY_URL = process.env.POLYGON_MUMBAI_GATEWAY_URL;

const ETHEREUM_PRIVATE_KEY_RINKEBY = process.env.ETHEREUM_PRIVATE_KEY_RINKEBY;
const RINKEBY_GATEWAY_URL = process.env.RINKEBY_GATEWAY_URL;
const GOERLI_GATEWAY_URL = process.env.GOERLI_GATEWAY_URL;
const POLYGON_GATEWAY_URL = process.env.POLYGON_GATEWAY_URL;

const POLYGON_ACCOUNT_KEY = process.env.POLYGON_TESTNET_ACCOUNT;
const ETHEREUM_ACCOUNT_KEY = process.env.ETHEREUM_TESTNET_ACCOUNT;

// This will be used for production deployment
// const POLYGON_PRIVATE_KEY_MAINNET = process.env.POLYGON_PRIVATE_KEY_MAINNET;
// const ETHEREUM_PRIVATE_KEY_MAINNET = process.env.ETHEREUM_PRIVATE_KEY_MAINNET;

require("solidity-coverage");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");

// Foundation is not required at this point
// require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    mumbai: {
      url: POLYGON_MUMBAI_GATEWAY_URL,
      accounts: [POLYGON_ACCOUNT_KEY],
      etherscan: { apiKey: process.env.API_KEY_POLYGONSCAN },
    },
    rinkeby: {
      url: RINKEBY_GATEWAY_URL,
      accounts: [ETHEREUM_ACCOUNT_KEY],
      etherscan: { apiKey: process.env.API_KEY_ETHERSCAN },
    },
    goerli: {
      url: GOERLI_GATEWAY_URL,
      accounts: [ETHEREUM_ACCOUNT_KEY],
      etherscan: { apiKey: process.env.API_KEY_ETHERSCAN },
    },
    polygon: {
      url: POLYGON_GATEWAY_URL,
      accounts: [POLYGON_ACCOUNT_KEY],
      etherscan: { apiKey: process.env.API_KEY_ETHERSCAN },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    version: "0.8.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
  etherscan: {
    apiKey: {
      rinkeby: process.env.API_KEY_ETHERSCAN,
      goerli: process.env.API_KEY_ETHERSCAN,
      polygonMumbai: process.env.API_KEY_POLYGONSCAN,
      polygon: process.env.API_KEY_POLYGONSCAN,
    },
  },
};
