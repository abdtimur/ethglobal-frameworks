/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";

const frames = createFrames();
const handleRequest = frames(async (ctx) => {
  if (ctx.message?.transactionId) {
    const frameId = (ctx.message?.state as any).frameId; // e.g. /frames/12345 -> 12345
    return {
      image: (
        <div tw="flex">Transaction submitted! {ctx.message.transactionId}</div>
      ),
      buttons: [
        <Button
          action="post"
          target={{ pathname: `/mentors${frameId ? `/${frameId}` : ""}` }}
        >
          Return to the main page
        </Button>,
        <Button
          action="link"
          target={`https://sepolia.basescan.org/tx/${ctx.message.transactionId}`}
        >
          View on block explorer
        </Button>,
      ],
    };
  } else {
    return {
      image: <span>Missing transaction ID</span>,
      buttons: [
        <Button action="post" target={{ pathname: "/mentors" }}>
          Return to the main page
        </Button>,
      ],
    };
  }
});

export const POST = handleRequest;
