/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";
import { getProperTimeLeftString } from "../../utils";
import { FrameConfig, getFrameBidFor, getFrameConfig } from "../../chain";
import { formatEther } from "viem";
import {
  PinataFcUser,
  getFcUser,
  readPinataInteractions,
  sendPinataEvent,
} from "../../pinata-events";

const loadChainData = async (frameId: string, requesterFid: number) => {
  const config = await getFrameConfig(frameId);
  const requesterBid = await getFrameBidFor(requesterFid, frameId);
  return {
    config,
    requesterBid,
  };
};

const frames = createFrames();
const handleRequest = frames(async (ctx) => {
  console.log(ctx);
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

  const requesterFid = ctx?.message?.requesterFid || null;
  const { config, requesterBid } = await loadChainData(frameId, requesterFid);
  console.log(config, requesterBid);

  const isRequesterWinner = config.winner.toString() === requesterFid + "";
  const isRequesterMentor = config.fid.toString() === requesterFid + "";
  console.log(
    config.fid.toString(),
    requesterFid,
    isRequesterMentor,
    isRequesterWinner
  );
  const requesterCanBid =
    !config.completed &&
    !isRequesterWinner &&
    !isRequesterMentor &&
    new Date(Number(config.closingTime)).getTime() > new Date().getTime();

  const timeLeft = getProperTimeLeftString(
    new Date(Number(config.closingTime)).getTime() - new Date().getTime()
  );

  const linkButton = (
    <Button action="link" target={config.mentorProfile}>
      Verify Profile
    </Button>
  );

  // TODO: Test in the morning
  // const getInteractions = await readPinataInteractions(
  //   frameId,
  //   `${frameId}/details`
  // );
  // const messageBody = await ctx.request.json();
  // console.log(messageBody);
  // sendPinataEvent(frameId, `${frameId}/details`, messageBody);

  const winnerFcUser =
    config.winner > 0n ? await getFcUser(config.winner.toString()) : null;

  if (isRequesterMentor) {
    return prepareMentorView(frameId, config, winnerFcUser);
  }
  return requesterCanBid
    ? prepareBidderView(frameId, linkButton, config, timeLeft)
    : prepareJustView(frameId, isRequesterWinner, linkButton, config, timeLeft);
});

const prepareMentorView = (
  frameId: string,
  config: FrameConfig,
  winnerFcUser: PinataFcUser | null
) => {
  const buttons = [
    <Button action="post" target={{ pathname: "/frames" }}>
      Return to Your Events
    </Button>,
  ];
  if (!config.completed && config.winner > 0n) {
    buttons.push(
      <Button action="tx" target="/txdata-complete" post_url="/tx-result">
        Close Bids
      </Button>
    );
  }

  if (config.winner > 0n) {
    buttons.push(
      <Button
        action="link"
        target={
          winnerFcUser
            ? `https://warpcast.com/${winnerFcUser.username}`
            : `https://warpcast.com/${config.winner.toString()}`
        }
      >
        Current Winner Profile
      </Button>
    );
  }

  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-4xl font-bold text-start mr-10">
          Your Frame: {config.sessionTitle}
        </h1>

        <div tw="flex flex-col justify-center text-3xl py-0 text-start">
          <div tw="flex text-2xl text-start font-black mb-4">
            When: {new Date(Number(config.targetTime)).toLocaleDateString()}
          </div>
          <div tw="flex text-2xl text-start font-black mb-4">
            Current event status: {config.completed ? "Completed" : "Active"}
          </div>
          {config.winner > 0n && (
            <div tw="flex text-2xl text-start font-black mb-4">
              Current bid:{" "}
              {`@${
                winnerFcUser ? winnerFcUser.username : config.winner.toString()
              }`}{" "}
              with {formatEther(BigInt(config.winnerBid))} ETH
            </div>
          )}
          {config.winner === 0n && (
            <div tw="flex text-2xl text-start font-black mb-4">
              No bids yet. Want to share the frame with your friends and
              followers? 😏
            </div>
          )}
          {!config.completed && (
            <div tw="flex text-2xl text-start font-black mb-4">
              Time left:{" "}
              {getProperTimeLeftString(
                new Date(Number(config.closingTime)).getTime() -
                  new Date().getTime()
              )}
            </div>
          )}
          {!config.completed && config.winner > 0n && (
            <div tw="flex text-2xl text-start font-black mb-4">
              You can close the bids ahead of time if you want and like the
              current winner 🤪
            </div>
          )}
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [...buttons],
    headers: {
      "Cache-Control": "max-age=0",
    },
    state: {
      frameId: frameId,
    },
  };
};

const prepareBidderView = (
  frameId: string,
  linkButton: JSX.Element,
  config: FrameConfig,
  timeLeft: string
) => {
  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-4xl font-bold text-start mr-10">{config.sessionTitle}</h1>
        <div tw="flex flex-col justify-center text-3xl py-0 text-start">
          <div tw="flex text-2xl text-start font-black mb-4">
            When: {new Date(Number(config.targetTime)).toLocaleDateString()}
          </div>
          <div tw="flex text-2xl text-start font-black mb-4">
            Current event status: {config.completed ? "Completed" : "Active"}
          </div>
          <div tw="flex text-2xl text-start font-black mb-4">
            Bids start from {formatEther(BigInt(config.minBid))} ETH
          </div>
          <div tw="flex text-2xl text-start font-black mb-4">
            You still have a chance to participate! Time left: {timeLeft}
          </div>
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    textInput: "Enter your bid (ETH)",
    buttons: [
      <Button action="post" target={{ pathname: "/frames/" + frameId }}>
        Return
      </Button>,
      <Button action="tx" target="/txdata" post_url="/tx-result">
        {"Bid To Book"}
      </Button>,
      linkButton,
    ],
    headers: {
      "Cache-Control": "max-age=0",
    },
    state: {
      frameId: frameId,
    },
  };
};

const prepareJustView = (
  frameId: string,
  isWinner: boolean,
  linkButton: JSX.Element,
  config: FrameConfig,
  timeLeft: string
) => {
  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-4xl font-bold text-start mr-10">{config.sessionTitle}</h1>
        <div tw="flex flex-col justify-center text-3xl py-0 text-start">
          <div tw="flex text-2xl text-start font-black mb-4">
            When: {new Date(Number(config.targetTime)).toLocaleDateString()}
          </div>
          <div tw="flex text-2xl text-start font-black mb-4">
            Current event status: {config.completed ? "Completed" : "Active"}
          </div>
          <div tw="flex text-2xl text-start font-black mb-4">
            Time left: {timeLeft}
          </div>
          {!isWinner && (
            <div tw="flex text-2xl text-start font-black mb-4">
              Winner is: {config.winner.toString()}
            </div>
          )}
          {isWinner && config.completed && (
            <div tw="flex text-2xl text-start font-black mb-4">
              You are the winner! 🎉
            </div>
          )}
          {isWinner && !config.completed && (
            <div tw="flex text-2xl text-start font-black mb-4">
              You are almost there! Just wait for a bit 🤪
            </div>
          )}
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: "/meetframes" }}>
        Return to the main page
      </Button>,
      linkButton,
    ],
    headers: {
      "Cache-Control": "max-age=0",
    },
    state: {
      frameId: frameId,
    },
  };
};

export const POST = handleRequest;
