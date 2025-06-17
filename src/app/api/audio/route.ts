import { NextRequest, NextResponse } from "next/server";

interface AudioGenerationRequest {
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  format: string;
}

interface AudioGenerationResponse {
  audio_url: string;
  duration: number;
  format: string;
  voice: string;
  text: string;
  created_at: string;
  file_size: number;
}

// Generate actual audio data (simplified WAV format)
function generateAudioData(text: string, voice: string, speed: number, pitch: number, duration: number): string {
  const sampleRate = 44100;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);
  
  // Generate audio samples (simple tone based on text and voice characteristics)
  const baseFreq = voice === 'nova' || voice === 'shimmer' ? 220 : 110; // Higher for female voices
  const freqModifier = pitch;
  const textHash = text.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const freq = baseFreq * freqModifier + (textHash % 50);
    const envelope = Math.exp(-t * 2) * Math.sin(2 * Math.PI * freq * t / speed);
    const sample = Math.floor(envelope * 16383);
    view.setInt16(44 + i * 2, sample, true);
  }
  
  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Simulate audio generation since we don't have a real TTS service
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { 
      text, 
      voice = "alloy",
      speed = 1.0,
      pitch = 1.0,
      format = "mp3"
    }: AudioGenerationRequest = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required for audio generation" },
        { status: 400 }
      );
    }

    if (text.length > 4000) {
      return NextResponse.json(
        { error: "Text is too long. Maximum 4000 characters allowed." },
        { status: 400 }
      );
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate estimated duration (rough approximation: 150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = Math.max(1, Math.round((wordCount / 150) * 60 / speed));

    // Simulate file size (rough approximation: 1KB per second for MP3)
    const estimatedFileSize = estimatedDuration * 1024;

    // Generate actual audio data using Web Audio API simulation
    const audioData = generateAudioData(text, voice, speed, pitch, estimatedDuration);
    const audioUrl = `data:audio/${format};base64,${audioData}`;

    const response: AudioGenerationResponse = {
      audio_url: audioUrl,
      duration: estimatedDuration,
      format: format,
      voice: voice,
      text: text,
      created_at: new Date().toISOString(),
      file_size: estimatedFileSize
    };

    // Log analytics
    const responseTime = (Date.now() - startTime) / 1000;
    await logAnalytics({
      model: `tts-${voice}`,
      tokens: Math.ceil(text.length / 4),
      responseTime,
      success: true,
      cost: 0.001 * wordCount // Simulate cost per word
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Audio generation error:", error);
    
    // Log failed request
    const responseTime = (Date.now() - startTime) / 1000;
    await logAnalytics({
      model: "tts-unknown",
      tokens: 0,
      responseTime,
      success: false,
      cost: 0
    });
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get available voices
export async function GET() {
  try {
    const voices = [
      {
        id: "alloy",
        name: "Alloy",
        gender: "neutral",
        language: "en-US",
        description: "A balanced, versatile voice"
      },
      {
        id: "echo",
        name: "Echo",
        gender: "male",
        language: "en-US",
        description: "A clear, professional male voice"
      },
      {
        id: "fable",
        name: "Fable",
        gender: "male",
        language: "en-US",
        description: "A warm, storytelling voice"
      },
      {
        id: "onyx",
        name: "Onyx",
        gender: "male",
        language: "en-US",
        description: "A deep, authoritative voice"
      },
      {
        id: "nova",
        name: "Nova",
        gender: "female",
        language: "en-US",
        description: "A bright, energetic female voice"
      },
      {
        id: "shimmer",
        name: "Shimmer",
        gender: "female",
        language: "en-US",
        description: "A soft, gentle female voice"
      }
    ];

    return NextResponse.json({ voices });
  } catch (error) {
    console.error("Voices fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available voices" },
      { status: 500 }
    );
  }
}

// Helper function to log analytics data
const logAnalytics = async (data: {
  model: string;
  tokens: number;
  responseTime: number;
  success: boolean;
  cost: number;
}) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...data
      }),
    });
  } catch (error) {
    console.error('Failed to log analytics:', error);
  }
}; 