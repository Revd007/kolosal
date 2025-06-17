import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
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
      return new Response(
        JSON.stringify({ error: "Ollama is not running. Please start Ollama first." }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
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

    // Format messages for Ollama API with system prompt
    let prompt = system_prompt ? `System: ${system_prompt}\n\n` : "";
    
    prompt += messages
      .map((msg: { role: string; content: string }) => {
        if (msg.role === "user") return `Human: ${msg.content}`;
        if (msg.role === "assistant") return `Assistant: ${msg.content}`;
        return msg.content;
      })
      .join("\n\n") + "\n\nAssistant: ";

    // Estimate input tokens
    tokens = Math.ceil(prompt.length / 4);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: modelExists ? model : (availableModels[0]?.name || "phi"),
              prompt: prompt,
              stream: true, // Enable streaming
              options: {
                temperature: Math.max(0, Math.min(2, temperature)),
                num_predict: Math.max(1, Math.min(4096, max_tokens)),
                top_p: Math.max(0, Math.min(1, top_p)),
              },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ error: `Ollama API error: ${errorText}` })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ error: "No response body" })}\n\n`
              )
            );
            controller.close();
            return;
          }

          let fullResponse = "";
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                // Send final message with metadata
                const responseTime = (Date.now() - startTime) / 1000;
                tokens += Math.ceil(fullResponse.length / 4);
                
                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({ 
                      done: true, 
                      response_time: responseTime,
                      tokens_used: tokens,
                      model: modelUsed
                    })}\n\n`
                  )
                );
                
                // Log analytics
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      timestamp: new Date().toISOString(),
                      model: modelUsed,
                      tokens,
                      responseTime,
                      success: true,
                      cost: 0
                    }),
                  });
                } catch (logError) {
                  console.error('Failed to log analytics:', logError);
                }
                
                break;
              }

              // Parse the chunk
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                  const data = JSON.parse(line);
                  if (data.response) {
                    fullResponse += data.response;
                    // Send the chunk to the client
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          response: data.response,
                          done: false 
                        })}\n\n`
                      )
                    );
                  }
                } catch (parseError) {
                  console.error('Error parsing chunk:', parseError);
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error("Streaming API error:", error);
    
    // Log failed request
    const responseTime = (Date.now() - startTime) / 1000;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          model: modelUsed || "unknown",
          tokens,
          responseTime,
          success: false,
          cost: 0
        }),
      });
    } catch (logError) {
      console.error('Failed to log analytics:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 