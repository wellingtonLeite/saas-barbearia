import { NextResponse } from "next/server";
import { EdgeTTS } from "@travisvn/edge-tts";

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
    // Remove espaços extras
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice = "pt-BR-AntonioNeural" } = body;

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

    // Instancia o EdgeTTS com a voz selecionada
    const tts = new EdgeTTS(spokenText, voice, {
      rate: "+0%",
      pitch: "+0Hz",
      volume: "+0%"
    });

    const result = await tts.synthesize();
    const arrayBuffer = await result.audio.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    const base64Audio = audioBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      base64: base64Audio,
      mimetype: "audio/mp3",
      byteLength: audioBuffer.length,
      voice,
      textSpoken: spokenText
    });
  } catch (error: any) {
    console.error("[SDR /speak] Erro na síntese de voz gratuita:", error);
    return NextResponse.json(
      {
        error: "Falha na síntese de voz gratuita (Edge TTS)",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
