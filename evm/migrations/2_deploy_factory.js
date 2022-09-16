const VvtecOracle = artifacts.require('./VvtecOracle.sol');
const VvtecFacade = artifacts.require('./VvtecFacade.sol');

module.exports = function(deployer) {
  deployer.deploy(VvtecOracle)
    .then(function() {
      return deployer.deploy(VvtecFacade, VvtecOracle.address)
    });
};
