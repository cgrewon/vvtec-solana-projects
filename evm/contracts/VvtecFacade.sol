//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IVvtecOracle {
  function initialize() external;
  function createOracle(string calldata oracleName, uint256 oracleValue) external returns(bool, bytes32);
  function updateOracle(
    bytes32 _requestId,
    uint256 _nonce,
    string calldata _oracleName,
    uint256 _oracleValue
  ) external returns(bool, bytes32);
  function deleteOracle(string calldata oracleName) external returns(bool);
  function getLatestOracleValue(string calldata _oracleName) external view returns(uint256, uint256, uint256);
  function getOracleValue(bytes32 _reqId) external view returns(uint256, uint256, uint256);
  function owner() external returns(address);
}


contract VvtecFacade is Ownable, Pausable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  address public oracleMaster;
  // The VVTEC TOKEN!
  IERC20 public vvtec;
  address public treasuryWallet;
  uint256 public defaultRequestFee; // the amount of VVTEC to be sent to each oracle for each request
  
  struct Requester {
    bool authorized;
    uint256 requestFee;
  }

  struct Oracle {
    uint256 nonce;
    address oracleAddr;
  }
  
  mapping(bytes32 => Oracle) public oracles;
  mapping(address => uint256) public partnerRequestFee;
  mapping(address => bool) operators;

  uint256 private treasuryThreshold = 5000000000000000000;

  event OracleCreated(address indexed operator, address indexed oracleAddress, bytes32 indexed nameHash);
  event OracleUpdated(address indexed operator, address indexed oracleAddress, bytes32 indexed nameHash, uint256 value);
  event OracleDeleted(address indexed operator, address indexed oracleAddress, bytes32 indexed nameHash);
  event NewRequest(bytes32 indexed requestId, address indexed requester, uint256 dateTime);

  constructor(address oracleImpl) {
    oracleMaster = oracleImpl;
    operators[_msgSender()] = true;
  }

  modifier onlyOperator() {
    require(operators[_msgSender()], "Not allowed");
    _;
  }

  modifier validRecipient(address _recipient) {
    require(_recipient != address(0) && _recipient != address(this));
    _;
  }

  /**
   * @dev Creates a request to update the corresponding Oracle.
   *
   * @notice The offchain Oracle nodes needs to listen to the NewRequest with below abi
   *  event NewRequest(bytes32 indexed requestId, address indexed requester, uint256 dateTime);
   *
   * @param _oracleName the oracle to be updated
   */
  function sendOracleRequest(string calldata _oracleName) external nonReentrant returns(bytes32 requestId) {
    uint256 fee = partnerRequestFee[_msgSender()];
    if (fee == 0) {
      fee = defaultRequestFee;
    }
    require(vvtec.balanceOf(_msgSender()) >= fee, "Insufficient balance");
    vvtec.safeTransferFrom(_msgSender(), address(this), fee);

    bytes32 oracleHash = getOracleHash(_oracleName);

    requestId = keccak256(abi.encodePacked(this, _oracleName, oracles[oracleHash].nonce));
    emit NewRequest(requestId, _msgSender(), block.timestamp);

    // If the VVTEC balance of this contract is greater or equal than the treasury threshold then transfer the fund to treasury wallet
    if (vvtec.balanceOf(address(this)) >= treasuryThreshold) {
      _withdrawTreasury(treasuryThreshold);
    }
    
    oracles[oracleHash].nonce += 1;
  }

  /**
   * @dev Creates a new Oracle
   * 
   * @param _oracleName the Oracle name to be created
   * @param _initValue the init value of the Oracle
   */
  function createOracle(
    string calldata _oracleName,
    uint256 _initValue
  ) external whenNotPaused nonReentrant onlyOperator returns(address, bytes32) {
    bytes32 oracleHash = getOracleHash(_oracleName);
    console.log("createOracle#oracleHash is:");
    console.logBytes32(oracleHash);

    IVvtecOracle oracle = IVvtecOracle(oracles[oracleHash].oracleAddr);
    require(address(oracle) == address(0), "OracleExistedAlready()");

    oracle = IVvtecOracle(Clones.cloneDeterministic(oracleMaster, oracleHash));
    console.log("createOracle#oracle impl address: %s", address(oracle));
    oracle.initialize();
    console.log("createOracle#oracle initialized", oracle.owner());

    (bool succeed, bytes32 nameHash) = oracle.createOracle(_oracleName, _initValue);
    console.log("createOracle#new oracle is created");
    console.logBytes32(nameHash);
    require(succeed, "FailedToCreateOracle()");

    Oracle storage _oracle = oracles[oracleHash];
    _oracle.oracleAddr = address(oracle);
    _oracle.nonce = 1;
    emit OracleCreated(_msgSender(), address(oracle), nameHash);
    return (address(oracle), nameHash);
  }

  /**
   * @dev Updates Oracle value
   * 
   * @param _reqId the request Id
   * @param _oracleName the Oracle name to be updated
   * @param _oracleValue the new value of the Oracle
   */
  function updateOracleValue(
    bytes32 _reqId,
    string calldata _oracleName,
    uint256 _oracleValue
  ) external whenNotPaused nonReentrant onlyOperator {
    bytes32 oracleHash = getOracleHash(_oracleName);
    IVvtecOracle oracle = IVvtecOracle(oracles[oracleHash].oracleAddr);
    console.log("updateOracleoracleValue#oracle address: %s", address(oracle));
    require(address(oracle) != address(0), "OracleDoesNotExist()");

    (bool succeed,) = oracle.updateOracle(_reqId, oracles[oracleHash].nonce, _oracleName, _oracleValue);
    require(succeed, "FailedToUpdateOracle()");

    emit OracleUpdated(_msgSender(), address(oracle), oracleHash, _oracleValue);
  }

  /**
   * @dev Deletes Oracle
   * 
   * @param _oracleName the Oracle to be deleted
   */
  function deleteOracle(string calldata _oracleName) external whenNotPaused onlyOperator {
    bytes32 oracleHash = getOracleHash(_oracleName);
    IVvtecOracle oracle = IVvtecOracle(oracles[oracleHash].oracleAddr);
    console.log("deleteOracle#oracle address: %s", address(oracle));
    require(address(oracle) != address(0), "OracleDoesNotExist()");
    
    (bool succeed) = oracle.deleteOracle(_oracleName);
    require(succeed, "FailedToUpdateOracle()");

    delete oracles[oracleHash];

    emit OracleDeleted(_msgSender(), address(oracle), oracleHash);
  }

  /**
   * @dev The data buyer can withdraw their fund if the auction state is WITHDRAWABLE.
   *
   */
  function withdrawTreasury(uint256 _amount) public onlyOwner {
    vvtec.safeTransfer(treasuryWallet, _amount);
  }

  /**
   * @dev Gets the latest Oracle value
   * 
   * @param _oracleName the Oracle to be deleted
   */
  function getLatestOracleValue(string calldata _oracleName) external view returns(uint256 lastUpdateAt, uint256 oracleValue) {
    bytes32 oracleHash = getOracleHash(_oracleName);
    IVvtecOracle oracle = IVvtecOracle(oracles[oracleHash].oracleAddr);
    require(address(oracle) != address(0), "OracleDoesNotExist()");
    
    (, lastUpdateAt, oracleValue) = oracle.getLatestOracleValue(_oracleName);
  }

  /**
   * @dev Gets the Oracle value 
   * 
   * @param _oracleName the Oracle to be deleted
   * @param _reqId the request id
   */
  function getOracleValue(string calldata _oracleName, bytes32 _reqId) external view returns(uint256 lastUpdateAt, uint256 oracleValue) {
    bytes32 oracleHash = getOracleHash(_oracleName);
    IVvtecOracle oracle = IVvtecOracle(oracles[oracleHash].oracleAddr);
    require(address(oracle) != address(0), "OracleDoesNotExist()");

    (, lastUpdateAt, oracleValue) = oracle.getOracleValue(_reqId);
  }

  function getOracleAddress(string calldata _oracleName) external view returns(address) {
    bytes32 oracleHash = getOracleHash(_oracleName);
    return oracles[oracleHash].oracleAddr;
  }

  /**
   * @dev Grants `operator` role to `account`.
   *
   */
  function granteOperatorRole(address _account) external onlyOwner {
    operators[_account] = true;
  }

  /**
   * @dev Revokes `operator` role from `account`.
   *
   */
  function revokeOperatorRole(address _account) external onlyOwner {
    operators[_account] = false;
  }

  /**
   * @dev Sets a new Oracle master
   *
   * @param _oracleMaster the new Oracle master address
   */
  function setOracleMaster(address _oracleMaster) external whenNotPaused onlyOwner {
    oracleMaster = _oracleMaster;
  }

  function pause() external onlyOwner {
    _pause();
  }

  function unpause() external onlyOwner {
    _unpause();
  }
  
  /**
   * @notice Called by the owner to permission other addresses to have a different request fee.
   *
   * @param _requester the address whose permissions are being set
   * @param _fee the payment amount needed for each request from the requester
   */
  function setPartnerRequestFee(address _requester, uint256 _fee) external onlyOwner {
    require(_fee > 0, "Not valid");

    partnerRequestFee[_requester] = _fee;
  }

  /**
   * @notice Called by the owner to set the treasury wallet address.
   *
   * @param _wallet the wallet address is being set
   */
  function setTreasuryWallet(address _wallet) external onlyOwner {
    treasuryWallet = _wallet;
  }

  /**
   * @notice Called by the owner to set the treasury threshold.
   *
   * @param _threshold the threshold is being set
   */
  function setTreasuryThreshold(uint256 _threshold) external onlyOwner {
    treasuryThreshold = _threshold;
  }

  /**
   * @notice Sets the VVTEC token address
   * @param _vvtec The address of the VVTEC token contract
   */
  function setVvtecToken(address _vvtec) external onlyOwner {
    vvtec = IERC20(_vvtec);
  }

  /**
   * @notice Called by the owner to set the default request payment amount.
   *
   * @param _fee the fee is being set
   */
  function setDefaultRequestFee(uint256 _fee) public onlyOwner {
    defaultRequestFee = _fee;
  }

  function _withdrawTreasury(uint256 _amount) internal {
    vvtec.safeTransfer(treasuryWallet, _amount);
  }

  function getOracleHash(string memory _oracleName) private pure returns(bytes32) {
    return keccak256(abi.encodePacked(_oracleName));
  }
}
