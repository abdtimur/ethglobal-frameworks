export const MeetFramesAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "bidFrame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "completeFrame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "completeFrameOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "closingTime",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "targetTime",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "minBid",
        type: "uint256",
      },
    ],
    name: "createFrame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
      {
        internalType: "address",
        name: "bidder",
        type: "address",
      },
    ],
    name: "getFrameBid",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "bidder",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "bid",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "valueLocked",
            type: "uint256",
          },
        ],
        internalType: "struct MeetFrames.FrameBid",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "getFrameCompleted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "getFrameConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "mentor",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fid",
            type: "uint256",
          },
          {
            internalType: "uint64",
            name: "closingTime",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "targetTime",
            type: "uint64",
          },
          {
            internalType: "uint256",
            name: "minBid",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fee",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "winner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "winnerBid",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "completed",
            type: "bool",
          },
        ],
        internalType: "struct MeetFrames.FrameConfig",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
      {
        internalType: "address",
        name: "bidder",
        type: "address",
      },
    ],
    name: "getFrameValueLocked",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "getFrameWinner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "getFrameWinnerBid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "withdrawBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
