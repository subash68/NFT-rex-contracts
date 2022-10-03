const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("../src/signer");
const { readFileSync, writeFileSync } = require("fs");

function getInstance(name) {
  const address = JSON.parse(
    readFileSync("relayer/NFTCollectionImplementation.json")
  )[name];
  if (!address) throw new Error(`Contract ${name} not found in json file`);
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

function getDeployedInstance(name, address) {
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

async function main() {
  const forwarder = await getInstance("MinimalForwarder");

  const collection = await getDeployedInstance(
    "ERC721NFTCustom",
    "0x180e0113577F8868de51AC2f6fe367216E922442"
  );

  const { MINTER_KEY: signer } = process.env;
  const from = new ethers.Wallet(signer).address;
  const data = collection.interface.encodeFunctionData("mintToCaller", [
    from,
    "QmV3EtUK8a5arGbPVuRnwtjVpa89joVTkUrDyLGsTwSB9y/metadata.json",
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
