// import

const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // get the price feed address
  let ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // if we're not deploying to a testnet, use the mock

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // priceFeed address goes here
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress])
  }
  log("---------------------------------------")
};

module.exports.tags = ["all", "fundme"];