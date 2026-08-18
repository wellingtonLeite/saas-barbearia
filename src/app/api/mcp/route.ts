import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import * as readline from "readline";

export const dynamic = "force-dynamic";

// Global map to hold active MCP sessions across requests
const globalSessions = global as unknown as { 
  mcpSessions: Map<string, import("child_process").ChildProcess> 
};
if (!globalSessions.mcpSessions) {
  globalSessions.mcpSessions = new Map();
}

export async function GET(req: NextRequest) {
  const sessionId = crypto.randomUUID();
  
  const child = spawn("npx", ["prisma", "mcp"], {
    stdio: ["pipe", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  
  globalSessions.mcpSessions.set(sessionId, child);

  child.on('close', () => globalSessions.mcpSessions.delete(sessionId));

  const stream = new ReadableStream({
    start(controller) {
      // 1. O MCP cliente vai se conectar aqui e receber a URL para onde deve enviar as mensagens POST
      const requestUrl = new URL(req.url);
      const postUrl = `${requestUrl.protocol}//${requestUrl.host}/api/mcp?sessionId=${sessionId}`;
      controller.enqueue(new TextEncoder().encode(`event: endpoint\ndata: ${postUrl}\n\n`));

      // 2. Lê a saída do Prisma MCP (que é via terminal/stdio) linha por linha
      const rl = readline.createInterface({ input: child.stdout! });
      rl.on("line", (line) => {
        if (line.trim()) {
          // 3. Encaminha as mensagens (JSON-RPC) para o cliente MCP via Server-Sent Events
          controller.enqueue(new TextEncoder().encode(`event: message\ndata: ${line}\n\n`));
        }
      });
      
      child.stderr!.on("data", (data) => {
        console.error(`MCP Stderr: ${data.toString()}`);
      });
    },
    cancel() {
      child.kill();
      globalSessions.mcpSessions.delete(sessionId);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  
  const child = globalSessions.mcpSessions.get(sessionId);
  if (!child) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  
  try {
    const body = await req.text();
    // Garante que o payload vai em uma única linha, sem quebras
    const payload = JSON.stringify(JSON.parse(body));
    
    if (child.stdin && !child.stdin.destroyed) {
        child.stdin.write(payload + "\n");
        return new Response("Accepted", { status: 202 });
    } else {
        return NextResponse.json({ error: "Stream closed" }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
