//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IVvtecFacade {
  function sendOracleRequest(string calldata _oracleName) external returns(bytes32 requestId);
}


contract VvtecClient {

  // The payment TOKEN address
  IERC20 internal paymentToken;
  address internal vvtecFacade;

  /**
   * @dev Creates a request to update the corresponding Oracle data.
   *
   * @param _oracleName the Oracle to be updated
   */
  function requestOracleUpdate(string memory _oracleName) internal returns(bytes32 requestId) {
    paymentToken.approve(vvtecFacade, paymentToken.balanceOf(address(this)));
    return IVvtecFacade(vvtecFacade).sendOracleRequest(_oracleName);
  }
}
