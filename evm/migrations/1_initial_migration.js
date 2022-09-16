const Migrations = artifacts.require('./tron/Migrations.sol');

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
