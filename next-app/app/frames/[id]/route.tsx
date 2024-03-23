/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";
import { getProperTimeLeftString } from "../../utils";

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

export const mockServerCall = async (frameId: string, requesterFid: string) => {
  return new Promise<ServerResponse>((resolve) => {
    setTimeout(() => {
      const serverResponse = {
        hasFrame: true,
        frameData: {
          id: "my-frame-1",
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
  console.log(ctx.url);
  const pathParams = ctx?.url?.pathname.split("/").filter(Boolean);
  const frameId = pathParams[1]; // e.g. /frames/12345 -> 12345

  if (!frameId) {
    return {
      image: <span>Missing target frame ID</span>,
      buttons: [
        <Button action="post" target={{ pathname: "/meetframes" }}>
          Return to the main page
        </Button>,
      ],
    };
  }

  const requesterFid = ctx?.message?.requestedFid || null;
  const serverData = await mockServerCall(frameId, requesterFid);

  const timeLeft = getProperTimeLeftString(
    new Date(serverData.frameData.deadline).getTime() - new Date().getTime()
  );

  const actionButton = (
    <Button
      action="post"
      target={{
        query: {
          maxBid: serverData.frameData.maxBid,
          totalBids: serverData.frameData.totalBids,
          yourBid: serverData.frameData.yourBid,
        },
        pathname: `/bid/${serverData.frameData.id}`,
      }}
    >
      {serverData.frameData.yourBid ? "Top up" : "Bid To Book"}
    </Button>
  );
  const needWithdrawButton = !!serverData.frameData.yourBid; // TODO: add withdraw logic
  const pretiffiedDate = new Date(
    serverData.frameData.timestamp
  ).toLocaleDateString();

  return {
    // Want to book a session with @lolchto?
    // Make your offer before the deadline!
    // Session name: Offline coffee break with Vitalik
    // Session date: 2024-04-07
    // Time to make your offer: 5 hours
    image: (
      <div tw="flex flex-col justify-items-center  bg-white">
        <h1 tw="text-lg font-bold text-indigo-600 mb-2">
          Want to book a session with @{serverData.frameData.targetNickname}?
        </h1>
        <p tw="text-sm text-gray-700 mb-4">
          Make your offer before the deadline!
        </p>
        <div tw="border-t border-gray-200 pt-4 flex flex-col">
          <h2 tw="text-sm font-semibold text-gray-900">
            Session name:{" "}
            <span tw="font-normal">{serverData.frameData.sessionName}</span>
          </h2>
          <p tw="text-sm text-gray-600">Session date: {pretiffiedDate}</p>
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
          target={{
            query: { value: "No" },
            pathname: `/bid/${serverData.frameData.id}`,
          }}
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
    state: {
      frameId: serverData.frameData.id,
    },
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
