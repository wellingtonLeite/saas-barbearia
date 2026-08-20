import { POST as speakHandler } from "../speak/route";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return speakHandler(request);
}
