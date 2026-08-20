import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instance, message, base64: providedBase64 } = body;

    let base64Audio = providedBase64;

    // Se o base64 não foi enviado diretamente, busca na Evolution API
    if (!base64Audio) {
      if (!instance || !message) {
        return NextResponse.json(
          { error: "Parâmetros 'instance' e 'message' são obrigatórios para buscar áudio" },
          { status: 400 }
        );
      }

      const evolutionUrl = process.env.EVOLUTION_API_URL || "https://evolution.88barber.top";
      const evolutionKey = process.env.EVOLUTION_API_KEY || "88barber-evolution-pbzJxGX3Ih2OHMKo";

      // Extrair ID da mensagem de qualquer estrutura recebida
      const messageId = 
        message?.key?.id || 
        message?.id || 
        body.messageId || 
        (typeof message === "string" ? message : null) ||
        body.rawMessage?.key?.id;

      const evolutionPayload = messageId 
        ? { message: { key: { id: messageId } }, convertToMp4: false }
        : { message, convertToMp4: false };

      const evolutionRes = await fetch(`${evolutionUrl}/chat/getBase64FromMediaMessage/${instance}`, {
        method: "POST",
        headers: {
          "apikey": evolutionKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(evolutionPayload)
      });

      if (!evolutionRes.ok) {
        const errText = await evolutionRes.text();
        console.error("[SDR /transcribe] Erro Evolution API:", errText, "Payload enviado:", evolutionPayload);
        return NextResponse.json(
          { error: "Falha ao obter mídia da Evolution API", details: errText },
          { status: evolutionRes.status }
        );
      }

      const mediaData = await evolutionRes.json();
      base64Audio = mediaData.base64 || mediaData.media || mediaData.data;
    }

    if (!base64Audio) {
      return NextResponse.json(
        { error: "Nenhum arquivo de áudio base64 encontrado" },
        { status: 400 }
      );
    }

    // Remove prefixos data:audio/...;base64, se houver
    const cleanBase64 = base64Audio.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, "").trim();
    const audioBuffer = Buffer.from(cleanBase64, "base64");

    // Buscar chave da Groq no banco de dados (SystemSetting)
    let groqApiKey = process.env.GROQ_API_KEY;
    try {
      const groqSetting = await db.systemSetting.findUnique({
        where: { key: "GROQ_CONFIG" }
      });
      if (groqSetting?.value) {
        const val = typeof groqSetting.value === "string" ? JSON.parse(groqSetting.value) : (groqSetting.value as any);
        if (val?.api_key) groqApiKey = String(val.api_key);
      }
    } catch (e) {
      console.warn("[SDR /transcribe] Falha ao carregar GROQ_CONFIG do banco:", e);
    }

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY não configurada no sistema (SystemSetting ou .env)" },
        { status: 500 }
      );
    }

    // Montar multipart/form-data para a Groq Whisper
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: "audio/ogg" });
    formData.append("file", blob, "audio.ogg");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", "pt");
    formData.append("response_format", "json");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`
      },
      body: formData
    });

    if (!groqRes.ok) {
      const groqErr = await groqRes.text();
      console.error("[SDR /transcribe] Erro Groq Whisper:", groqErr);
      return NextResponse.json(
        { error: "Falha na transcrição da Groq", details: groqErr },
        { status: groqRes.status }
      );
    }

    const transcription = await groqRes.json();

    return NextResponse.json({
      success: true,
      text: transcription.text || "",
      transcription
    });
  } catch (error: any) {
    console.error("[SDR /transcribe] Erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor de transcrição", details: error.message },
      { status: 500 }
    );
  }
}
