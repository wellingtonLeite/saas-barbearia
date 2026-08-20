import { NextResponse } from "next/server";
import * as googleTTS from "google-tts-api";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Limpa marcações markdown e caracteres especiais que possam prejudicar a fala natural do TTS
 */
function cleanTextForSpeech(input: string): string {
  if (!input) return "";

  let cleaned = input
    // Remove links markdown [texto](url) -> texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove URLs diretas
    .replace(/https?:\/\/\S+/g, "link no nosso site")
    // Remove formatação de negrito/itálico (*, _, ~)
    .replace(/[*_~`]/g, "")
    // Remove cabeçalhos markdown (#)
    .replace(/#{1,6}\s*/g, "")
    // Remove marcadores de lista
    .replace(/^\s*[-*•+]\s+/gm, "")
    // Substitui quebras de linha múltiplas por ponto ou pausa
    .replace(/\n+/g, ". ")
    // Remove emojis e caracteres especiais que possam atrapalhar a síntese
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    // Remove espaços extras
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, number, instance, lang = "pt" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "O parâmetro 'text' é obrigatório e não pode ser vazio." },
        { status: 400 }
      );
    }

    const spokenText = cleanTextForSpeech(text);

    if (!spokenText) {
      return NextResponse.json(
        { error: "Texto inválido ou vazio após processamento." },
        { status: 400 }
      );
    }

    // Gera os pedaços de áudio em base64 usando Google TTS API
    const results = await googleTTS.getAllAudioBase64(spokenText, {
      lang: lang || "pt",
      slow: false,
      timeout: 10000,
    });

    if (!results || results.length === 0) {
      throw new Error("Nenhum áudio foi gerado pelo serviço de TTS.");
    }

    // Concatena todos os buffers de áudio em um único buffer MP3
    const audioBuffers = results.map((item) => Buffer.from(item.base64, "base64"));
    const combinedBuffer = Buffer.concat(audioBuffers);
    const base64Audio = combinedBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      base64: base64Audio,
      number: number || null,
      instance: instance || "ms-barber",
      mimetype: "audio/mp3",
      byteLength: combinedBuffer.length,
      lang: lang || "pt",
      textSpoken: spokenText
    });
  } catch (error: any) {
    console.error("[SDR /speak] Erro na síntese de voz (Google TTS):", error);
    return NextResponse.json(
      {
        error: "Falha na síntese de voz (Google TTS)",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
