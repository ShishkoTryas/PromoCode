// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

contract PromoCode {
    bytes32 public currentCode;
    mapping (address => bytes32) private paidCodes;
    address public admin;

    constructor () {
        admin = msg.sender;
    }

    event PromoCodeCreated(bytes32 promoCode);
    event PromoCodePaid(address indexed buyer, bytes32 promoCode);
    event ContractDeleted(address indexed owner, uint balance);

    modifier onlyAdmin {
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    function assignNewPromoCode(string memory newCode) public onlyAdmin {
        require(bytes(newCode).length > 0, "Promo code cannot be empty.");
        currentCode = keccak256(abi.encodePacked(newCode));
        emit PromoCodeCreated(currentCode);
    }

    function buyPromoCode() public payable {
        require(msg.value >= 0.01 ether, "You must pay at least 0.01 ETH to buy a promo code.");
        paidCodes[msg.sender] = currentCode;
        emit PromoCodePaid(msg.sender, currentCode);
    }

    function getBoughtPromoCode() public view returns (bytes32) {
        require(paidCodes[msg.sender] != bytes32(0), "You haven't bought a promo code yet.");
        return paidCodes[msg.sender];
    }

    function deleteContract() public onlyAdmin {
        uint contractBalance = address(this).balance;
        selfdestruct(payable(admin));
        emit ContractDeleted(msg.sender, contractBalance);
    }
}