export const MEETFRAMES_ADDRESS = "0xd1e97BB35831c0F2ef4b9884500B554e76e5A1e4";
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
        internalType: "uint256",
        name: "bidderFid",
        type: "uint256",
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
        name: "newFrameId",
        type: "string",
      },
      {
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        internalType: "string",
        name: "mentorName",
        type: "string",
      },
      {
        internalType: "string",
        name: "mentorProfile",
        type: "string",
      },
      {
        internalType: "string",
        name: "sessionTitle",
        type: "string",
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
        internalType: "uint256",
        name: "mentorFid",
        type: "uint256",
      },
    ],
    name: "getActiveFrames",
    outputs: [
      {
        internalType: "string[4]",
        name: "",
        type: "string[4]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "mentorFid",
        type: "uint256",
      },
    ],
    name: "getActiveFramesCount",
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
    name: "getCurrentFrameId",
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
        internalType: "string",
        name: "frameId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "bidderFid",
        type: "uint256",
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
            name: "bidderFid",
            type: "uint256",
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
            internalType: "string",
            name: "mentorName",
            type: "string",
          },
          {
            internalType: "string",
            name: "mentorProfile",
            type: "string",
          },
          {
            internalType: "string",
            name: "sessionTitle",
            type: "string",
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
            internalType: "uint256",
            name: "winner",
            type: "uint256",
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
          {
            internalType: "bool",
            name: "activated",
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
        internalType: "uint256",
        name: "bidder",
        type: "uint256",
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
        internalType: "string",
        name: "frameId",
        type: "string",
      },
    ],
    name: "getFrameWinner",
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
];
