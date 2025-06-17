import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let success = false;
  let tokens = 0;
  let modelUsed = "";

  try {
    const { 
      model, 
      messages, 
      temperature = 0.7, 
      max_tokens = 512, 
      top_p = 0.9,
      system_prompt = "You are a helpful AI assistant."
    } = await request.json();

    modelUsed = model;

    // Check if Ollama is available
    const ollamaHealthCheck = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
    }).catch(() => null);

    if (!ollamaHealthCheck) {
      return NextResponse.json(
        { error: "Ollama is not running. Please start Ollama first." },
        { status: 503 }
      );
    }

    // Get available models to validate the selected model
    const modelsResponse = await ollamaHealthCheck.json();
    const availableModels = modelsResponse.models || [];
    const modelExists = availableModels.some((m: any) => m.name === model);
    
    if (!modelExists && availableModels.length > 0) {
      // Use the first available model if the requested one doesn't exist
      const fallbackModel = availableModels[0].name;
      modelUsed = fallbackModel;
      console.warn(`Model '${model}' not found, using '${fallbackModel}' instead`);
    }

    // Format messages for Ollama API with system prompt
    let prompt = system_prompt ? `System: ${system_prompt}\n\n` : "";
    
    prompt += messages
      .map((msg: { role: string; content: string }) => {
        if (msg.role === "user") return `Human: ${msg.content}`;
        if (msg.role === "assistant") return `Assistant: ${msg.content}`;
        return msg.content;
      })
      .join("\n\n") + "\n\nAssistant: ";

    // Estimate input tokens (rough approximation)
    tokens = Math.ceil(prompt.length / 4);

    // Call Ollama API with all parameters
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelExists ? model : (availableModels[0]?.name || "phi"),
        prompt: prompt,
        stream: false,
        options: {
          temperature: Math.max(0, Math.min(2, temperature)), // Clamp between 0-2
          num_predict: Math.max(1, Math.min(4096, max_tokens)), // Clamp between 1-4096
          top_p: Math.max(0, Math.min(1, top_p)), // Clamp between 0-1
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API error:", errorText);
      
      // Log failed request
      const responseTime = (Date.now() - startTime) / 1000;
      await logAnalytics({
        model: modelUsed,
        tokens,
        responseTime,
        success: false,
        cost: 0 // Free for local models
      });
      
      return NextResponse.json(
        { error: `Failed to generate response from Ollama: ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    success = true;
    
    // Add output tokens to total
    if (data.response) {
      tokens += Math.ceil(data.response.length / 4);
    }
    
    // Calculate response time
    const responseTime = (Date.now() - startTime) / 1000;
    
    // Log successful request
    await logAnalytics({
      model: modelUsed,
      tokens,
      responseTime,
      success: true,
      cost: 0 // Free for local models
    });
    
    return NextResponse.json({
      response: data.response,
      model: data.model,
      created_at: data.created_at,
      done: data.done,
      total_duration: data.total_duration,
      load_duration: data.load_duration,
      prompt_eval_count: data.prompt_eval_count,
      eval_count: data.eval_count,
      tokens_used: tokens,
      response_time: responseTime
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Log failed request
    const responseTime = (Date.now() - startTime) / 1000;
    await logAnalytics({
      model: modelUsed || "unknown",
      tokens,
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

// Get available models from Ollama
export async function GET() {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch models from Ollama" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      models: data.models || [],
      status: "online"
    });
  } catch (error) {
    console.error("Failed to fetch Ollama models:", error);
    return NextResponse.json(
      { error: "Ollama is not running or not accessible", models: [], status: "offline" },
      { status: 503 }
    );
  }
} 