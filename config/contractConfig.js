module.exports = {
  apothem: {
    acceptToken_abi: [
      {
        constant: false,
        inputs: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "id",
            type: "string"
          },
          {
            name: "owner",
            type: "address"
          },
          {
            name: "burnPercent",
            type: "uint256"
          },
          {
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "addMerchant",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          },
          {
            name: "newOwner",
            type: "address"
          }
        ],
        name: "changeOwner",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "disableBurning",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "disableMerchant",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "enableBurning",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "enableMerchant",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "merchantId",
            type: "string"
          },
          {
            name: "purpose",
            type: "string"
          }
        ],
        name: "makePayment",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          },
          {
            name: "burnPercent",
            type: "uint256"
          },
          {
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "setBurnPercent",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "newOwner",
            type: "address"
          }
        ],
        name: "transferOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "name",
            type: "string"
          },
          {
            indexed: false,
            name: "id",
            type: "string"
          },
          {
            indexed: false,
            name: "owner",
            type: "address"
          },
          {
            indexed: false,
            name: "burnPercent",
            type: "uint256"
          },
          {
            indexed: false,
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "NewMerchant",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "merchantId",
            type: "string"
          },
          {
            indexed: false,
            name: "sender",
            type: "address"
          },
          {
            indexed: false,
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            name: "totalValue",
            type: "uint256"
          },
          {
            indexed: false,
            name: "tokenTransfered",
            type: "uint256"
          },
          {
            indexed: false,
            name: "tokenBurnt",
            type: "uint256"
          },
          {
            indexed: false,
            name: "purpose",
            type: "string"
          },
          {
            indexed: false,
            name: "burnActive",
            type: "bool"
          },
          {
            indexed: false,
            name: "burnPercent",
            type: "uint256"
          },
          {
            indexed: false,
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "NewPayment",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "merchantId",
            type: "string"
          },
          {
            indexed: false,
            name: "owner",
            type: "address"
          },
          {
            indexed: false,
            name: "newOwner",
            type: "address"
          }
        ],
        name: "MerchantOwnerChanged",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "previousOwner",
            type: "address"
          },
          {
            indexed: true,
            name: "newOwner",
            type: "address"
          }
        ],
        name: "OwnershipTransferred",
        type: "event"
      },
      {
        constant: true,
        inputs: [
          {
            name: "",
            type: "uint256"
          }
        ],
        name: "allMerchants",
        outputs: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "id",
            type: "string"
          },
          {
            name: "owner",
            type: "address"
          },
          {
            name: "status",
            type: "bool"
          },
          {
            name: "burnActive",
            type: "bool"
          },
          {
            name: "burnPercent",
            type: "uint256"
          },
          {
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "getMerchantData",
        outputs: [
          {
            name: "",
            type: "string"
          },
          {
            name: "",
            type: "string"
          },
          {
            name: "",
            type: "address"
          },
          {
            name: "",
            type: "bool"
          },
          {
            name: "",
            type: "bool"
          },
          {
            name: "",
            type: "uint256"
          },
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "getMerchantFromId",
        outputs: [
          {
            name: "",
            type: "bool"
          },
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "isOwner",
        outputs: [
          {
            name: "",
            type: "bool"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [
          {
            name: "",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      }
    ],
    acceptToken_addr: "xdc6141662dd52c3e1fc742fffc87491ac51d645200"
  },
  mainnet:{
    acceptToken_abi: [
      {
        constant: false,
        inputs: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "id",
            type: "string"
          },
          {
            name: "owner",
            type: "address"
          },
          {
            name: "burnPercent",
            type: "uint256"
          },
          {
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "addMerchant",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          },
          {
            name: "newOwner",
            type: "address"
          }
        ],
        name: "changeOwner",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "disableBurning",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "disableMerchant",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "enableBurning",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "enableMerchant",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "merchantId",
            type: "string"
          },
          {
            name: "purpose",
            type: "string"
          }
        ],
        name: "makePayment",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "id",
            type: "string"
          },
          {
            name: "burnPercent",
            type: "uint256"
          },
          {
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "setBurnPercent",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "newOwner",
            type: "address"
          }
        ],
        name: "transferOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "name",
            type: "string"
          },
          {
            indexed: false,
            name: "id",
            type: "string"
          },
          {
            indexed: false,
            name: "owner",
            type: "address"
          },
          {
            indexed: false,
            name: "burnPercent",
            type: "uint256"
          },
          {
            indexed: false,
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "NewMerchant",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "merchantId",
            type: "string"
          },
          {
            indexed: false,
            name: "sender",
            type: "address"
          },
          {
            indexed: false,
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            name: "totalValue",
            type: "uint256"
          },
          {
            indexed: false,
            name: "tokenTransfered",
            type: "uint256"
          },
          {
            indexed: false,
            name: "tokenBurnt",
            type: "uint256"
          },
          {
            indexed: false,
            name: "purpose",
            type: "string"
          },
          {
            indexed: false,
            name: "burnActive",
            type: "bool"
          },
          {
            indexed: false,
            name: "burnPercent",
            type: "uint256"
          },
          {
            indexed: false,
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        name: "NewPayment",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "merchantId",
            type: "string"
          },
          {
            indexed: false,
            name: "owner",
            type: "address"
          },
          {
            indexed: false,
            name: "newOwner",
            type: "address"
          }
        ],
        name: "MerchantOwnerChanged",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "previousOwner",
            type: "address"
          },
          {
            indexed: true,
            name: "newOwner",
            type: "address"
          }
        ],
        name: "OwnershipTransferred",
        type: "event"
      },
      {
        constant: true,
        inputs: [
          {
            name: "",
            type: "uint256"
          }
        ],
        name: "allMerchants",
        outputs: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "id",
            type: "string"
          },
          {
            name: "owner",
            type: "address"
          },
          {
            name: "status",
            type: "bool"
          },
          {
            name: "burnActive",
            type: "bool"
          },
          {
            name: "burnPercent",
            type: "uint256"
          },
          {
            name: "burnDecimals",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "getMerchantData",
        outputs: [
          {
            name: "",
            type: "string"
          },
          {
            name: "",
            type: "string"
          },
          {
            name: "",
            type: "address"
          },
          {
            name: "",
            type: "bool"
          },
          {
            name: "",
            type: "bool"
          },
          {
            name: "",
            type: "uint256"
          },
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "id",
            type: "string"
          }
        ],
        name: "getMerchantFromId",
        outputs: [
          {
            name: "",
            type: "bool"
          },
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "isOwner",
        outputs: [
          {
            name: "",
            type: "bool"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [
          {
            name: "",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      }
    ],
    acceptToken_addr: "" // addr on mainnet
  }
};

// new Address: xdc6141662dd52c3e1fc742fffc87491ac51d645200
// old Address: xdc95370fa297449f89f745a452cc942df1a6d1be2c
