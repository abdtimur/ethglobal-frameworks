import { createPublicClient, getContract, http } from "viem";
import { baseSepolia } from "viem/chains";
import { MEETFRAMES_ADDRESS, MeetFramesAbi } from "./txdata/abi";

export interface FrameConfig {
  mentor: string;
  mentorName: string;
  mentorProfile: string;
  sessionTitle: string;
  fid: bigint;
  closingTime: bigint;
  targetTime: bigint;
  minBid: string;
  completed: boolean;
  activated: boolean;

  winner: bigint; // address of the winner
  winnerBid: string; // bid amount of the winner
}

export interface FrameBid {
  bidder: string;
  bidderFid: bigint;
  bid: bigint;
  valueLocked: bigint;
}

export function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
}

export async function getActiveFrames(reguesterFid: number) {
  const publicClient = getPublicClient();
  const meetFramesRegistry = getContract({
    address: MEETFRAMES_ADDRESS,
    abi: MeetFramesAbi,
    client: publicClient,
  });

  const activeFramesIds: [string, string, string, string] =
    (await meetFramesRegistry.read.getActiveFrames([
      BigInt(reguesterFid),
    ])) as any;
  return activeFramesIds.filter((id) => id !== ""); // filter out empty strings
}

export async function getFrameConfig(frameId: string): Promise<FrameConfig> {
  const publicClient = getPublicClient();
  const meetFramesRegistry = getContract({
    address: MEETFRAMES_ADDRESS,
    abi: MeetFramesAbi,
    client: publicClient,
  });

  const frameConfig = (await meetFramesRegistry.read.getFrameConfig([
    frameId,
  ])) as FrameConfig;
  return frameConfig;
}

export async function getFrameBidFor(requesterFid: number, frameId: string) {
  const publicClient = getPublicClient();
  const meetFramesRegistry = getContract({
    address: MEETFRAMES_ADDRESS,
    abi: MeetFramesAbi,
    client: publicClient,
  });

  const bid = (await meetFramesRegistry.read.getFrameBid([
    frameId,
    BigInt(requesterFid),
  ])) as FrameBid;
  return bid;
}
