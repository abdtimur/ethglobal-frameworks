// ./app/page.tsx
import { fetchMetadata } from "frames.js/next";

export async function generateMetadata() {
  const object =  {
    title: "My Page",
    // provide a full URL to your /frames endpoint
    ...(await fetchMetadata(
      new URL("/frames", process.env.VERCEL_URL || "http://localhost:8000")
    )),
  };
  return object;
}
 
export default function Page() {
  return <span>Home page template</span>;
}
