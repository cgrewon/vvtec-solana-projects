// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract VvtecOracle is Initializable, OwnableUpgradeable, PausableUpgradeable {

  struct Oracle {
    uint256 requestCounter;
    uint256 lastUpdateAt;
    uint256 value;
  }

  mapping(bytes32 => Oracle) public oracleValues; // KEY: Oracle name
  mapping(bytes32 => Oracle) public requestValues; // KEY: request id

  event OracleCreated(bytes32 indexed oracleHash, string indexed name);
  event ValueUpdated(bytes32 indexed oracleHash, string indexed name, bytes32 indexed requestId, uint256 oracleValue);
  event OracleRemoved(bytes32 indexed oracleHash, string indexed name);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() initializer {}

  function initialize() external initializer {
    __Ownable_init();
  }

  /**
   * Creates a new Oracle
   * 
   * @param _oracleName the Oracle to be updated
   * @param _oracleValue the new value of the Oracle
   */
  function createOracle(
    string calldata _oracleName,
    uint256 _oracleValue
  ) external whenNotPaused onlyOwner returns(bool, bytes32) {
    console.log("createOracle started", owner());
    
    bytes32 oracleHash = keccak256(abi.encodePacked(_oracleName));
    console.log("createOracle#name hash:");
    console.logBytes32(oracleHash);

    Oracle storage oracle = oracleValues[oracleHash];
    oracle.value = _oracleValue;

    emit OracleCreated(oracleHash, _oracleName);
    return (true, oracleHash);
  }

  /**
   * Updates Oracle value
   * 
   * @param _requestId the request ID
   * @param _nonce the nonce value
   * @param _oracleName the Oracle to be updated
   * @param _oracleValue the new value of the Oracle
   */
  function updateOracle(
    bytes32 _requestId,
    uint256 _nonce,
    string calldata _oracleName,
    uint256 _oracleValue
  ) external whenNotPaused onlyOwner returns(bool, bytes32) {
    console.log("updateOracle started", owner());
    
    bytes32 oracleHash = keccak256(abi.encodePacked(_oracleName));
    console.log("updateOracle#name hash:");
    console.logBytes32(oracleHash);

    require(oracleValues[oracleHash].requestCounter < _nonce, "Cannot modify");

    Oracle storage oracle = oracleValues[oracleHash];
    oracle.value = _oracleValue;
    oracle.requestCounter += 1;
    oracle.lastUpdateAt = block.timestamp;

    requestValues[_requestId] = oracle;

    emit ValueUpdated(oracleHash, _oracleName, _requestId, _oracleValue);
    return (true, oracleHash);
  }

  /**
   * Deletes an Oracle
   *
   * @param _oracleName the Oracle to be removed
   */
  function deleteOracle(string calldata _oracleName) external whenNotPaused onlyOwner returns(bool) {
    bytes32 oracleHash = keccak256(abi.encodePacked(_oracleName));
    delete oracleValues[oracleHash];

    emit OracleRemoved(oracleHash, _oracleName);
    return true;
  }

  /**
   * @dev Gets latest Oracle value by using the Oracle name.
   * 
   * @param _oracleName The Oracle name
   */
  function getLatestOracleValue(string calldata _oracleName) external view returns(uint256, uint256, uint256) {
    bytes32 oracleHash = keccak256(abi.encodePacked(_oracleName));
    Oracle memory oracle = oracleValues[oracleHash];
    return (oracle.requestCounter, oracle.lastUpdateAt, oracle.value);
  }

  /**
   * @dev Gets Oracle value with by using the Oracle name.
   * 
   * @param _reqId  The request ID
   */
  function getOracleValue(bytes32 _reqId) external view returns(uint256, uint256, uint256) {
    Oracle memory oracle = requestValues[_reqId];
    return (oracle.requestCounter, oracle.lastUpdateAt, oracle.value);
  }

  function pause() public whenNotPaused onlyOwner {
    _pause();
  }

  function unpause() public whenPaused onlyOwner {
    _unpause();
  }
}
