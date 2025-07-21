import { NextRequest, NextResponse } from "next/server";

interface ImageGenerationRequest {
  prompt: string;
  style: string;
  size: string;
  quality: string;
}

interface ImageGenerationResponse {
  prompt: string;
  style: string;
  size: string;
  quality: string;
  image_url: string;
  generation_time: number;
  created_at: string;
  model?: string;
}

// Generate SVG placeholder based on prompt and style
function generateImagePlaceholder(prompt: string, style: string, size: string): string {
  const dimensions = size === "square" ? { width: 512, height: 512 } :
                   size === "portrait" ? { width: 512, height: 768 } :
                   size === "landscape" ? { width: 768, height: 512 } :
                   { width: 512, height: 512 };

  const styleColors = {
    realistic: ["#6B73FF", "#9575CD", "#7986CB"],
    artistic: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    cartoon: ["#FFD93D", "#6BCF7F", "#4D96FF"],
    abstract: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFD93D"],
    vintage: ["#D4A574", "#B5A165", "#8B7355"],
    futuristic: ["#00E5FF", "#3F51B5", "#9C27B0"],
    minimalist: ["#F5F5F5", "#E0E0E0", "#BDBDBD"],
    surreal: ["#E91E63", "#9C27B0", "#673AB7"]
  };

  const colors = styleColors[style as keyof typeof styleColors] || styleColors.artistic;
  const gradientStops = colors.map((color, index) => 
    `<stop offset="${(index / (colors.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />`
  ).join('');

  // Create a hash from the prompt to make the image consistent for the same prompt
  const hash = prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 360;

  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          ${gradientStops}
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
        </filter>
      </defs>
      <rect width="${dimensions.width}" height="${dimensions.height}" fill="url(#grad1)" />
      
      <!-- Dynamic elements based on prompt -->
      ${style === 'abstract' ? `
        <circle cx="${dimensions.width * 0.3}" cy="${dimensions.height * 0.3}" r="${Math.min(dimensions.width, dimensions.height) * 0.15}" fill="white" opacity="0.7" />
        <circle cx="${dimensions.width * 0.7}" cy="${dimensions.height * 0.7}" r="${Math.min(dimensions.width, dimensions.height) * 0.1}" fill="white" opacity="0.5" />
      ` : ''}
      
      ${style === 'geometric' ? `
        <polygon points="${dimensions.width * 0.5},${dimensions.height * 0.2} ${dimensions.width * 0.8},${dimensions.height * 0.8} ${dimensions.width * 0.2},${dimensions.height * 0.8}" fill="white" opacity="0.6" />
      ` : ''}
      
      <!-- Central focus element -->
      <circle cx="${dimensions.width / 2}" cy="${dimensions.height / 2}" r="${Math.min(dimensions.width, dimensions.height) * 0.12}" fill="white" opacity="0.8" />
      
      <!-- Text overlay -->
      <text x="${dimensions.width / 2}" y="${dimensions.height / 2 - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333">
        Generated Image
      </text>
      <text x="${dimensions.width / 2}" y="${dimensions.height / 2 + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
        ${style.charAt(0).toUpperCase() + style.slice(1)} Style
      </text>
      <text x="${dimensions.width / 2}" y="${dimensions.height / 2 + 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">
        ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Check if Ollama has image generation capabilities (future implementation)
async function checkOllamaImageCapabilities(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      // Check for image generation models (like DALL-E variants or Stable Diffusion)
      const imageModels = data.models?.filter((model: any) => 
        model.name.includes('dall') || 
        model.name.includes('stable') || 
        model.name.includes('diffusion') ||
        model.name.includes('midjourney')
      );
      return imageModels?.length > 0;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { 
      prompt, 
      style = "realistic",
      size = "square",
      quality = "standard"
    }: ImageGenerationRequest = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required for image generation" },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: "Prompt is too long. Maximum 1000 characters allowed." },
        { status: 400 }
      );
    }

    // Check if Ollama has image generation capabilities
    const hasOllamaImageGen = await checkOllamaImageCapabilities();

    if (hasOllamaImageGen) {
      // Future: Implement actual Ollama image generation
      // For now, we'll use placeholder generation
    }

    // Simulate processing time based on quality
    const processingTime = {
      draft: 1000,
      standard: 3000,
      high: 5000,
      ultra: 8000
    }[quality] || 3000;

    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Generate placeholder image
    const imageUrl = generateImagePlaceholder(prompt, style, size);
    const generationTime = (Date.now() - startTime) / 1000;

    const response: ImageGenerationResponse = {
      prompt,
      style,
      size,
      quality,
      image_url: imageUrl,
      generation_time: generationTime,
      created_at: new Date().toISOString(),
      model: hasOllamaImageGen ? "ollama-image-gen" : "placeholder-generator"
    };

    // Log analytics
    await logAnalytics({
      model: `image-gen-${style}`,
      tokens: Math.ceil(prompt.length / 4),
      responseTime: generationTime,
      success: true,
      cost: 0.002 * (quality === 'ultra' ? 2 : quality === 'high' ? 1.5 : 1)
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Image generation error:", error);
    
    // Log failed request
    const responseTime = (Date.now() - startTime) / 1000;
    await logAnalytics({
      model: "image-gen-error",
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

export async function GET() {
  try {
    const hasOllamaImageGen = await checkOllamaImageCapabilities();
    
    return NextResponse.json({
      status: "online",
      image_generation_available: hasOllamaImageGen,
      supported_styles: [
        "realistic", "artistic", "cartoon", "abstract", 
        "vintage", "futuristic", "minimalist", "surreal"
      ],
      supported_sizes: ["square", "portrait", "landscape"],
      supported_qualities: ["draft", "standard", "high", "ultra"],
      message: hasOllamaImageGen 
        ? "Ollama image generation available" 
        : "Using placeholder image generation"
    });
  } catch (error) {
    console.error("Image status check error:", error);
    return NextResponse.json(
      { error: "Failed to check image generation status" },
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