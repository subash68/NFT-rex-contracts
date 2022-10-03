require("dotenv").config();

const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("../src/signer");
const { readFileSync, writeFileSync } = require("fs");

function getInstance(name) {
  const address = JSON.parse(
    readFileSync("relayer/ERC721CollectionFactory.json")
  )[name];
  if (!address) throw new Error(`Contract ${name} not found in json file`);
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

function getDeployedInstance(name, address) {
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

async function main() {
  const forwarder = await getInstance("MinimalForwarder");
  // const collection = await getInstance("ERC721CollectionFactory");
  const collection = await getDeployedInstance(
    "ERC721NFTCustom",
    "0x2629115E42C58bD4DA27ed8616483C043d1a857b"
  );

  const { SIGNER_KEY: signer } = process.env;
  const from = new ethers.Wallet(signer).address;
  console.log(`Signing registration of ${from}`);

  const data = collection.interface.encodeFunctionData("mintToCaller", [
    from,
    "tokenURI",
  ]);

  const result = await signMetaTxRequest(signer, forwarder, {
    to: collection.address,
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
