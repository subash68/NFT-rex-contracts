const { MinimalForwarder } = require("../relayer/creatorDAOFactory.json");
const { CreatorDAO } = require("../relayer/creatorDAOImpl.json");

module.exports = [CreatorDAO, MinimalForwarder];
