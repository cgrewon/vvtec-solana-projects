const { ethers } = require('hardhat');

async function main() {
  const VvtecOracle = await ethers.getContractFactory('VvtecOracle');
  console.log('Deploying VvtecOracle Token...');
  const vvtecOracleImpl = await VvtecOracle.deploy();
  await vvtecOracleImpl.deployed();
  console.log('VVTEC Oracle Impl deployed to: ', vvtecOracleImpl.address);


  const VvtecFacade = await ethers.getContractFactory('VvtecFacade');
  console.log('Deploying VVTEC Facade...');
  const vvtecFacade = await VvtecFacade.deploy(vvtecOracleImpl.address);
  await vvtecFacade.deployed();
  console.log('Oracle facade deployed to:', vvtecFacade.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
