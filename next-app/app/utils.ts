import { headers } from "next/headers";

export function currentURL(pathname: string): URL {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";

  try {
    return new URL(pathname, `${protocol}://${host}`);
  } catch (error) {
    return new URL("http://localhost:3000");
  }
}

export function vercelURL() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
}

export function getProperTimeLeftString(timeLeft: number) {
  if (timeLeft > 0) {
    // X days Y hours X minutes
    const days = Math.floor(timeLeft / 24 / 60 / 60 / 1000);
    const hours = Math.floor((timeLeft / 60 / 60 / 1000) % 24);
    const minutes = Math.floor(timeLeft / 60 / 1000) % 60;

    const daysString = days > 0 ? `${days} days ` : "";
    const hoursString = hours > 0 ? `${hours} hours ` : "";
    const minutesString = days === 0 && minutes > 0 ? `${minutes} minutes` : "";

    return `${daysString}${hoursString}${minutesString}`;
  }
  return "Time is up!";
}

export function getPinataDate(date: Date) {
  // YYYY-MM-DD HH:MM:SS
  return date.toISOString().replace(/T/, " ").replace(/\..+/, "");
}
