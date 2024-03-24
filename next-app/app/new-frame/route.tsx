/* eslint-disable react/jsx-key */
import { getFrameMessage } from "frames.js";
import { createFrames, Button } from "frames.js/next";
import { formatEther, parseEther } from "viem";

export interface NewFrameStateData {
  newFrameId: string;
  mentor: string;
  mentorName: string;
  mentorProfile: string;
  sessionTitle: string;
  fid: number;
  closingTime: number;
  targetTime: number;
  minBid: string;
}

const frames = createFrames({
  // basePath: "/new-frame",
  initialState: {
    newFrameId: "",
    mentor: "",
    mentorName: "",
    mentorProfile: "",
    sessionTitle: "",
    fid: 0,
    closingTime: 0,
    targetTime: 0,
    minBid: "",
    stage: 0,
  },
});

const handleRequest = frames(async (ctx) => {
  const stateString = (ctx.message?.state as string) || "{}";
  const stage = JSON.parse(stateString)?.stage || 0;
  console.log("Stage", stage);

  switch (stage) {
    case 0:
      return await handle0stage(ctx);
    case 1:
      return await handle1stage(ctx);
    case 2:
      return await handle2stage(ctx);
    case 3:
      return await handle3stage(ctx);
    case 4:
      return await handle4stage(ctx);
    default:
      return await handle0stage(ctx);
  }
});

const handle0stage = async (ctx) => {
  const requesterFid = ctx?.message?.requesterFid || 0;

  const json = await ctx.request.json();
  const frameMessage = await getFrameMessage(json);
  const frameState = JSON.parse(frameMessage.state || "{}") as any;
  console.log("Frame message", frameMessage);

  const mentorAddress =
    frameMessage.connectedAddress || frameMessage.requesterVerifiedAddresses[0];
  const mentorProfile = `https://warpcast.com/${frameMessage.requesterUserData?.username}`;
  const mentorName = frameMessage.requesterUserData?.username;
  console.log("Mentor", mentorName, mentorAddress, mentorProfile);

  if (!requesterFid || !mentorName || !mentorAddress) {
    throw new Error(
      `Mentor name or address not found. ${mentorName} ${mentorAddress}`
    );
  }

  // here is the home frame. We will need to go through home -> captcha -> frames to get to user's frames
  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-6xl font-bold text-start mr-10">
          1/4 What will be your event name?
        </h1>
        <p tw="text-4xl py-0 text-start">
          Please share the title of your event below:
        </p>
      </div>
    ),
    textInput: "Session Title",
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: "/new-frame" }}>
        Next
      </Button>,
    ],
    state: {
      ...frameState,
      mentor: mentorAddress,
      mentorName,
      mentorProfile,
      fid: requesterFid,
      stage: 1,
    },
  };
};

const handle1stage = async (ctx) => {
  const stateString = (ctx.message?.state as string) || "{}";
  const frameState = JSON.parse(stateString) as any;
  const inputTitle = (ctx.message?.inputText || "").trim();

  if (!inputTitle || !frameState) {
    throw new Error(
      `Stage 1 frame state or input not found. ${inputTitle} ${frameState}`
    );
  }

  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-6xl font-bold text-start mr-10">
          2/4 What will be your event time?
        </h1>
        <p tw="text-4xl py-0 text-start">
          {`Please share the time of your event below (Timezone: UTC):`}
        </p>
      </div>
    ),
    textInput: "Event Time",
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: "/new-frame" }}>
        Next
      </Button>,
    ],
    state: {
      ...(frameState as any),
      sessionTitle: inputTitle,
      stage: 2,
    },
  };
};

const handle2stage = async (ctx) => {
  const stateString = (ctx.message?.state as string) || "{}";
  const frameState = JSON.parse(stateString) as any;
  const inputTime = (ctx.message?.inputText || "").trim();
  let dateTime: number;
  try {
    dateTime = new Date(inputTime)?.getTime();
    if (!dateTime) {
      throw new Error("Invalid date time input");
    }
    if (dateTime < Date.now() + 1000 * 60 * 60 * 24) {
      // 24 hours from now
      throw new Error("Invalid date time input");
    }
  } catch (e) {
    throw new Error(`Stage 2: Invalid date time input: ${inputTime}`);
  }

  if (!inputTime || !frameState) {
    throw new Error(
      `Stage 2 frame state or input not found. ${inputTime} ${frameState}`
    );
  }

  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-6xl font-bold text-start mr-10">
          3/4 What will be your event deadline for sales?
        </h1>
        <p tw="text-4xl py-0 text-start">
          {`Please share the deadline for sales below (Timezone: UTC):`}
        </p>
      </div>
    ),
    textInput: "Sales Deadline",
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: "/new-frame" }}>
        Next
      </Button>,
    ],
    state: {
      ...(frameState as any),
      targetTime: dateTime,
      stage: 3,
    },
  };
};

const handle3stage = async (ctx) => {
  const stateString = (ctx.message?.state as string) || "{}";
  const frameState = JSON.parse(stateString) as any;
  const inputTime = (ctx.message?.inputText || "").trim();
  let dateTime: number;
  try {
    dateTime = new Date(inputTime)?.getTime();
    if (!dateTime) {
      throw new Error("Invalid date time input");
    }
    if (dateTime < Date.now() + 1000 * 60 * 60 * 24) {
      // 24 hours from now
      throw new Error("Invalid date time input");
    }
    if (dateTime > Number(frameState.targetTime)) {
      throw new Error("Invalid date time input - after target time");
    }
  } catch (e) {
    throw new Error(`Invalid date time input: ${e}`);
  }

  if (!inputTime || !frameState) {
    throw new Error(
      `Stage 3 frame state or input not found. ${inputTime} ${frameState}`
    );
  }

  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-6xl font-bold text-start mr-10">
          4/4 What will be your minimum bid?
        </h1>
        <p tw="text-4xl py-0 text-start">
          {`Please share the minimum bid amount below:`}
        </p>
      </div>
    ),
    textInput: "Minimum Bid Amount",
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: "/new-frame" }}>
        Next
      </Button>,
    ],
    state: {
      ...(frameState as any),
      closingTime: dateTime,
      stage: 4,
    },
  };
};

const handle4stage = async (ctx) => {
  const stateString = (ctx.message?.state as string) || "{}";
  const frameState = JSON.parse(stateString) as any;
  const inputBid = (ctx.message?.inputText || "").trim();

  let minBid: string;
  try {
    const minBidwei = parseEther(inputBid);
    if (!minBidwei || minBidwei < 1n) {
      throw new Error("Invalid bid amount");
    }
    minBid = minBidwei.toString();
  } catch (e) {
    throw new Error(`Invalid bid amount: ${inputBid}`);
  }

  if (!minBid || !frameState) {
    throw new Error(
      `Stage 4 frame state or input not found. ${inputBid} ${frameState}`
    );
  }

  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-5xl font-bold text-start mr-10">
          {`Congratulations! Your frame is ready ☺️`}
        </h1>
        <span tw="text-3xl py-0 text-start mb-4">
          Know we will put it on-chain, so you can get paid to your wallet by
          the winner. Please verify all the details below:
        </span>
        <div tw="flex flex-col justify-center text-3xl py-0 text-start">
          <span>- Event Name: {frameState.sessionTitle}</span>
          <span>
            - Event Time: {new Date(frameState.targetTime).toUTCString()}
          </span>
          <span>
            - Sales Deadline: {new Date(frameState.closingTime).toUTCString()}
          </span>
          <span>- Minimum Bid: {formatEther(BigInt(minBid))} ETH</span>
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    buttons: [
      <Button action="tx" target="/txdata-mentor" post_url="/tx-result-mentor">
        All Good, Let's do it!
      </Button>,
      // TODO: Add back / cancel button
    ],
    state: {
      ...(frameState as any),
      minBid: minBid,
      stage: 5,
    },
  };
};

export const POST = handleRequest;
