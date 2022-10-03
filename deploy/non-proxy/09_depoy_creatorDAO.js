module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // DAO creation setup
  const creatorDAOConfiguration = {
    name: "DAO Name",
    owner: deployer,
  };

  const creatorDAO = await ethers.getContractFactory("CreatorDAO");
  const dao = await creatorDAO.deploy(creatorDAOConfiguration, []);

  await dao.deployed();
  console.log(`DAO is deployed at ${dao.address}`);
};

module.exports.tags = ["CreatorDAOReplaced"];
