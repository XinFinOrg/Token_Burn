pragma solidity ^0.5.1;

contract Ownable {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() internal {
        address msgSender = msg.sender;
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }
    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns(address) {
        return _owner;
    }
    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }
    /**
     * @dev Returns true if the caller is the current owner.
     */
    function isOwner() public view returns(bool) {
        return msg.sender == _owner;
    }
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

contract AcceptToken is Ownable {
    
    modifier onlyMerchantOwner(string memory id) {
        (bool idExists, uint index) = getMerchantFromId(id);
        require(idExists,"AcceptToken: merchant not found");
        require(allMerchants[index].owner == msg.sender,"OnlyMerchantOwner: sender is not owner");
        _;
    }
    
    // Events start
    event NewMerchant(string name, string id, address owner, uint burnPercent, uint burnDecimals);
    event NewPayment(string merchantId, address sender ,address to, uint totalValue , uint tokenTransfered ,  uint tokenBurnt ,  string purpose ,  bool burnActive, uint burnPercent, uint burnDecimals);
    event MerchantOwnerChanged(string merchantId, address owner, address newOwner);
    // Events end
    
    struct Merchant {
        string name;
        string id;
        address payable owner;
        bool status;
        bool burnActive;
        uint burnPercent;
        uint burnDecimals; // decimals to adjust for float burn percentages
    }
    
    Merchant[] public allMerchants;
    
    // Owner functionalities ---- start
    function addMerchant(string memory name, string memory id, address payable owner, uint burnPercent, uint burnDecimals ) public onlyOwner {
        (bool idExists,) = getMerchantFromId(id);
        require(!idExists,"addMerchant: id already exists");
        require(burnDecimals >= 0, "AddMerchant: invalid decimals");
        require(burnPercent / (100*getDecimalDivisor(burnDecimals)) <= 100,"SetBurnPercent: burn percent has to be less than 100");
        allMerchants.push(Merchant(name,id, owner,true, false ,burnPercent,burnDecimals));
        emit NewMerchant(name, id, owner, burnPercent, burnDecimals);
    }
    
    function enableMerchant(string memory id) public onlyOwner {
        (bool idExists,uint index) = getMerchantFromId(id);
        require(idExists,"EnableMerchant: merchant does not exist");
        require(!allMerchants[index].status,"EnableMerchant: merchant is already enabled");
        allMerchants[index].status = true;
    }
    
    function disableMerchant(string memory id) public onlyOwner {
        (bool idExists,uint index) = getMerchantFromId(id);
        require(idExists,"DisableMerchant: merchant does not exist");
        require(allMerchants[index].status,"DisableMerchant: merchant is already disabled");
        allMerchants[index].status = false;
    }
    
    function changeOwner(string memory id, address payable newOwner) public onlyMerchantOwner(id) {
        // no check for id existance required as already checked in modifier: onlyMerchantOwner
        (,uint index) = getMerchantFromId(id);
        address oldOwner = allMerchants[index].owner;
        allMerchants[index].owner = newOwner;
        emit MerchantOwnerChanged(id,oldOwner,newOwner);
    }
    // Owner funcrtionalities ---- end
    
    // Merchant Funcrtionalities --- start
    function enableBurning(string memory id) public onlyMerchantOwner(id) {
        (,uint index) = getMerchantFromId(id);
        require(!allMerchants[index].burnActive,"EnableBurning: burning is already active");
        allMerchants[index].burnActive=true;
    }
    
    function disableBurning(string memory id) public onlyMerchantOwner(id) {
        (,uint index) = getMerchantFromId(id);
        require(allMerchants[index].burnActive,"EnableBurning: burning is already inactive");
        allMerchants[index].burnActive=false;
    }
    
    function setBurnPercent(string memory id, uint burnPercent, uint burnDecimals ) public onlyMerchantOwner(id) {
        (,uint index) = getMerchantFromId(id);
        require(burnDecimals >= 0,"SetBurnPercent: invalid burnDecimals");
        require(burnPercent / (100*getDecimalDivisor(burnDecimals)) <= 100,"SetBurnPercent: burn percent has to be less than 100");
        allMerchants[index].burnDecimals=burnDecimals;
        allMerchants[index].burnPercent=burnPercent;
    }
    // Merchant Funcrtionalities --- end
    
    
    // User Functionalities onlyOne, make payment
    function makePayment(string memory merchantId, string memory purpose) payable public {
        require(msg.value > 0,"MakePayment: Invalid message value");
        (bool idExists, uint index) = getMerchantFromId(merchantId);
        require(idExists,"MakePayment: so merchant exists");
        Merchant memory currentMerchant = allMerchants[index]; 
        require(currentMerchant.status==true,"MakePayment: Merchant not active");
        address payable recipient = currentMerchant.owner;
        address payable burnAddr = 0x0000000000000000000000000000000000000000;
        if (currentMerchant.burnActive && currentMerchant.burnPercent > 0){
            // need to burn
            uint256 divisor = getDecimalDivisor(currentMerchant.burnDecimals);
            uint256 burnAmnt = currentMerchant.burnPercent*msg.value / (100*divisor);
            uint256 transferValue = msg.value -  burnAmnt;
            burnAddr.transfer(burnAmnt);
            recipient.transfer(transferValue);
            emit NewPayment(merchantId,msg.sender, recipient, msg.value, transferValue, burnAmnt ,purpose, currentMerchant.burnActive,currentMerchant.burnPercent,currentMerchant.burnDecimals) ;
        }
        else {
            // no need to burn
            recipient.transfer(msg.value);
            emit NewPayment(merchantId,msg.sender, recipient, msg.value ,msg.value, 0, purpose, currentMerchant.burnActive,allMerchants[index].burnPercent,allMerchants[index].burnDecimals) ;
        }
    }
    
    // Getters
    function getMerchantFromId(string memory id) public view returns (bool, uint) {
        for (uint i=0;i<allMerchants.length;i++){
            if (strCompare(allMerchants[i].id,id)==0){
                return (true, i);
            }
        }
        return (false,0);
    }
    
    function getMerchantData(string memory id)  public view returns (string memory,string memory,address,bool,bool,uint,uint) {
        (bool idExists, uint index) = getMerchantFromId(id);
        require(idExists,"GetMerchantData: merchant id not found.");
        Merchant memory currentMerchant = allMerchants[index];
        return (currentMerchant.name,currentMerchant.id, currentMerchant.owner,currentMerchant.status, currentMerchant.burnActive, currentMerchant.burnPercent,currentMerchant.burnDecimals);
    }
    
    
    function getDecimalDivisor(uint decimals) internal pure returns (uint) {
        return 10**decimals;
    }
    
    // Credit for this function goes to https://github.com/provable-things/ethereum-api/blob/master/oraclizeAPI_0.5.sol
    function strCompare(string memory _a, string memory _b) internal pure returns(int _returnCode) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint minLength = a.length;
        if (b.length < minLength) {
            minLength = b.length;
        }
        for (uint i = 0; i < minLength; i++) {
            if (a[i] < b[i]) {
                return -1;
            } else if (a[i] > b[i]) {
                return 1;
            }
        }
        if (a.length < b.length) {
            return -1;
        } else if (a.length > b.length) {
            return 1;
        } else {
            return 0;
        }
    }
}