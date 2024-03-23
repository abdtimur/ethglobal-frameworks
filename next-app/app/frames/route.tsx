/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";

interface ServerResponse {
  hasFrame: boolean;
  frameData: {
    id: string;
    targetNickname: string;
    targetProfile: string;
    timestamp: string;
    deadline: string;
    sessionName: string;
    totalBids: number;
    maxBid: number;
    yourBid: number | null;
  };
}

const mockServerCall = async (requesterFid: string) => {
  return new Promise<ServerResponse>((resolve) => {
    setTimeout(() => {
      const serverResponse = {
        hasFrame: true,
        frameData: {
          id: "my-frame-id",
          targetNickname: "lolchto",
          targetProfile: "https://warpcast.com/lolchto",
          timestamp: "2024-04-07T00:00:00.000Z",
          deadline: "2024-04-01T00:00:00.000Z",
          sessionName: "Offline coffee break with Vitalik",
          totalBids: 5,
          maxBid: 0.01,
          yourBid: 0.001, // or null if no bid
        },
      };
      resolve(serverResponse);
    }, 1000);
  });
};

const frames = createFrames();
const handleRequest = frames(async (ctx) => {
  const requesterFid = ctx?.message?.requestedFid || null;
  const serverData = await mockServerCall(requesterFid);

  const hoursLeft = Math.floor(
    (new Date(serverData.frameData.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60)
  ); // hours left to bid
  const minsLeft = Math.floor(
    (new Date(serverData.frameData.deadline).getTime() - new Date().getTime()) /
      (1000 * 60)
  ); // mins left to bid if less than 1 hour left
  const timeLeft = hoursLeft > 0 ? `${hoursLeft} hours` : `${minsLeft} mins`;

  const actionButton = (
    <Button
      action="post"
      target={{
        query: {
          maxBid: serverData.frameData.maxBid,
          totalBids: serverData.frameData.totalBids,
          yourBid: serverData.frameData.yourBid,
        },
        pathname: "/bid",
      }}
    >
      {serverData.frameData.yourBid ? "Top up" : "Bid To Book"}
    </Button>
  );
  const needWithdrawButton = !!serverData.frameData.yourBid; // TODO: add withdraw logic
  const pretiffiedDate = new Date(serverData.frameData.timestamp).toLocaleDateString();

  return {
    // Want to book a session with @lolchto?
    // Make your offer before the deadline!
    // Session name: Offline coffee break with Vitalik
    // Session date: 2024-04-07
    // Time to make your offer: 5 hours
    image: (
      <div tw="flex flex-col justify-items-center bg-white">
        <h1 tw="text-lg font-bold text-indigo-600 mb-2">
          Want to book a session with @{serverData.frameData.targetNickname}?
        </h1>
        <p tw="text-sm text-gray-700 mb-4">
          Make your offer before the deadline!
        </p>
        <div tw="border-t border-gray-200 pt-4 flex flex-col">
          <h2 tw="text-md font-semibold text-gray-900">
            Session name:{" "}
            <span tw="font-normal">
              {serverData.frameData.sessionName}
            </span>
          </h2>
          <p tw="text-sm text-gray-600">
            Session date: {pretiffiedDate}
          </p>
          <p tw="text-sm font-semibold text-indigo-500">
            Time to make your offer: {timeLeft}
          </p>
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      actionButton,
      needWithdrawButton && (
        <Button
          action="post"
          target={{ query: { value: "No" }, pathname: "/frames" }}
        >
          Withdraw Bid
        </Button>
      ),
      <Button action="link" target={serverData.frameData.targetProfile}>
        Check Profile
      </Button>,
    ],
    headers: {
      // Max cache age in seconds
      "Cache-Control": "max-age=0",
    },
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
