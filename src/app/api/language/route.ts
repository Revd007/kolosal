import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let tokens = 0;
  let modelUsed = "";

  try {
    const { 
      model, 
      prompt,
      task = "completion",
      temperature = 0.7, 
      max_tokens = 512, 
      top_p = 0.9
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
      const fallbackModel = availableModels[0].name;
      modelUsed = fallbackModel;
      console.warn(`Model '${model}' not found, using '${fallbackModel}' instead`);
    }

    // Format prompt based on task type
    let formattedPrompt = "";
    
    switch (task) {
      case "completion":
        formattedPrompt = prompt;
        break;
      case "summarization":
        formattedPrompt = `Please provide a concise summary of the following text:\n\n${prompt}\n\nSummary:`;
        break;
      case "translation":
        formattedPrompt = `Translate the following text to English:\n\n${prompt}\n\nTranslation:`;
        break;
      case "question-answering":
        formattedPrompt = `Answer the following question based on the provided context:\n\n${prompt}\n\nAnswer:`;
        break;
      case "code-generation":
        formattedPrompt = `Generate code based on the following description:\n\n${prompt}\n\nCode:`;
        break;
      case "code-explanation":
        formattedPrompt = `Explain the following code:\n\n${prompt}\n\nExplanation:`;
        break;
      case "creative-writing":
        formattedPrompt = `Write a creative piece based on the following prompt:\n\n${prompt}\n\nStory:`;
        break;
      default:
        formattedPrompt = prompt;
    }

    // Estimate input tokens
    tokens = Math.ceil(formattedPrompt.length / 4);

    // Call Ollama API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelExists ? model : (availableModels[0]?.name || "phi"),
        prompt: formattedPrompt,
        stream: false,
        options: {
          temperature: Math.max(0, Math.min(2, temperature)),
          num_predict: Math.max(1, Math.min(4096, max_tokens)),
          top_p: Math.max(0, Math.min(1, top_p)),
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
        cost: 0
      });
      
      return NextResponse.json(
        { error: `Failed to generate response from Ollama: ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    
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
      cost: 0
    });
    
    return NextResponse.json({
      response: data.response,
      model: data.model,
      task: task,
      tokens_used: tokens,
      response_time: responseTime,
      created_at: data.created_at,
      done: data.done
    });
  } catch (error) {
    console.error("Language API error:", error);
    
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