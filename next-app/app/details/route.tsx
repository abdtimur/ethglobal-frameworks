// /* eslint-disable react/jsx-key */
// import { createFrames, Button } from "frames.js/next";

// const frames = createFrames({
//   basePath: "/mentors",
// });

// const handleRequest = frames(async (ctx) => {
//   console.log(ctx);

//   const date = ctx?.searchParams?.value;
//   const minBid = ctx?.searchParams?.minBid ?? 0.001;
//   if (!date) {
//     return {
//       image: <span>Missing date</span>,
//       buttons: [
//         <Button action="post" target={{ pathname: "/frames" }}>
//           Return to the main page
//         </Button>,
//       ],
//     };
//   }
//   return {
//     image: <span>{`Want to book a slot for ${date}?\ `}</span>,
//     textInput: `Your Bid Here. Min bid is ${minBid}`,
//     buttons: [
//       <Button
//         action="post"
//         target={{ query: { value: minBid }, pathname: "/bid" }}
//       >
//         Bid To Book - Tx Here
//       </Button>,
//       <Button
//         action="post"
//         target={{ query: { value: "No" }, pathname: "/frames" }}
//       >
//         Say No
//       </Button>,
//     ],
//   };
// });

// export const GET = handleRequest;
// export const POST = handleRequest;
