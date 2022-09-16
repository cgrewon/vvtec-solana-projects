//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../VvtecClient.sol";

contract BizMock is VvtecClient {
  bytes32 public requestId;

  constructor(IERC20 _paymentToken, address facade) {
    paymentToken = _paymentToken;
    vvtecFacade = facade;
  }

  function updateOracle() external {
    requestId = requestOracleUpdate("ETH-VVTEC");
  }

  function withdrawPaymentToken() public {
    paymentToken.transfer(
      msg.sender,
      paymentToken.balanceOf(address(this))
    );
  }
}
