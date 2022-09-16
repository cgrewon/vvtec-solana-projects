require('@nomiclabs/hardhat-ethers');

task('balance', `Prints an account's balance`)
  .addParam('account', `The account's address`)
  .setAction(async taskArgs => {
    const balance = await ethers.provider.getBalance(taskArgs.account)
    const balanceInEth = await ethers.utils.formatEther(balance)
    console.log(`${taskArgs.account}'s balance is`, balanceInEth, 'ETH')
  })

module.exports = {}
