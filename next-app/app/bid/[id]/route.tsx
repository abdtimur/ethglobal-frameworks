/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";
import { mockServerCall } from "../../mentors/[id]/route";
import { getFrameMessage } from "frames.js";

const frames = createFrames({});

const handleRequest = frames(async (ctx) => {
  const pathParams = ctx?.url?.pathname.split("/").filter(Boolean);
  console.log(pathParams);
  const frameId = pathParams[1]; // e.g. /frames/12345 -> 12345

  const requesterFid = ctx?.message?.requesterFid || null;
  console.error(frameId, requesterFid);

  if (!frameId || !requesterFid) {
    return {
      image: <span>Missing Bid details</span>,
      buttons: [
        <Button
          action="post"
          target={{ pathname: `/mentors${frameId ? `/${frameId}` : ""}` }}
        >
          Return to the main page
        </Button>,
      ],
    };
  }

  const body = await ctx.request.json();
  console.log(body);
  const frameMessage = await getFrameMessage(body);
  console.log(frameMessage);

  const serverData = await mockServerCall(frameId, requesterFid);

  const minBid = serverData.frameData.maxBid + 0.001; // add analytics analysis here

  return {
    image: (
      <span>{`Want to book a session for\n${serverData.frameData.sessionName}?\ `}</span>
    ),
    textInput: `Your Bid Here. Min bid is ${minBid}`,
    buttons: [
      <Button action="tx" target="/txdata" post_url="/tx-result">
        Bid To Book - Tx Here
      </Button>,
      <Button
        action="post"
        target={{ pathname: `/mentors${frameId ? `/${frameId}` : ""}` }}
      >
        Say No
      </Button>,
    ],
    state: {
      frameId,
    },
  };
});

// export const GET = handleRequest;
export const POST = handleRequest;
