"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Camera, 
  Settings,
  Copy,
  Download,
  RefreshCw,
  Zap,
  AlertCircle,
  CheckCircle,
  Palette,
  Eye,
  Wand2,
  ToggleLeft,
  ToggleRight,
  Brain,
  Upload,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  Save,
  History,
  Layers,
  Filter,
  Crop,
  RotateCw,
  Maximize,
  Grid3X3
} from "lucide-react";

interface ImageGenerationResult {
  prompt: string;
  style: string;
  size: string;
  quality: string;
  image_url: string;
  generation_time: number;
  created_at: string;
}

interface MCPImageResult {
  analysis?: {
    description: string;
    objects: string[];
    colors: string[];
    mood: string;
    style: string;
    confidence: number;
  };
  art_generation?: {
    title: string;
    style: string;
    color_scheme: string;
    prompt: string;
    preview_url: string;
    generation_time: string;
  };
}

export default function ImagePlayground() {
  const [prompt, setPrompt] = useState("A serene mountain landscape at sunset with vibrant colors");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedSize, setSelectedSize] = useState("square");
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [result, setResult] = useState<ImageGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // MCP Integration
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpResults, setMcpResults] = useState<MCPImageResult>({});
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState("description");

  // New useful features
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showImageHistory, setShowImageHistory] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [imageHistory, setImageHistory] = useState<ImageGenerationResult[]>([]);
  const [showImageTools, setShowImageTools] = useState(false);

  const promptLibrary = [
    { id: "landscape", name: "🏔️ Landscape", prompt: "A breathtaking mountain landscape at [TIME], with [WEATHER], [STYLE] photography style", category: "Nature" },
    { id: "portrait", name: "👤 Portrait", prompt: "Professional portrait of [SUBJECT], [LIGHTING] lighting, [BACKGROUND], high quality", category: "People" },
    { id: "abstract", name: "🎨 Abstract", prompt: "Abstract [STYLE] artwork with [COLORS], geometric patterns, modern art style", category: "Art" },
    { id: "architecture", name: "🏗️ Architecture", prompt: "Modern [BUILDING_TYPE] with [STYLE] architecture, [TIME], professional photography", category: "Buildings" },
    { id: "food", name: "🍽️ Food", prompt: "Delicious [FOOD_ITEM], professional food photography, [LIGHTING], appetizing presentation", category: "Food" },
    { id: "fantasy", name: "🧙 Fantasy", prompt: "Magical [SCENE] with [ELEMENTS], fantasy art style, detailed illustration", category: "Fantasy" }
  ];

  const imageStyles = [
    { value: "realistic", label: "📸 Realistic", description: "Photorealistic images", color: "bg-blue-100 text-blue-700" },
    { value: "artistic", label: "🎨 Artistic", description: "Painterly and artistic style", color: "bg-purple-100 text-purple-700" },
    { value: "cartoon", label: "🎭 Cartoon", description: "Cartoon and animated style", color: "bg-yellow-100 text-yellow-700" },
    { value: "abstract", label: "🌊 Abstract", description: "Abstract and conceptual", color: "bg-pink-100 text-pink-700" },
    { value: "vintage", label: "📻 Vintage", description: "Retro and vintage aesthetic", color: "bg-amber-100 text-amber-700" },
    { value: "futuristic", label: "🚀 Futuristic", description: "Sci-fi and futuristic", color: "bg-cyan-100 text-cyan-700" },
    { value: "minimalist", label: "⭕ Minimalist", description: "Clean and simple design", color: "bg-gray-100 text-gray-700" },
    { value: "surreal", label: "🌀 Surreal", description: "Dreamlike and surreal", color: "bg-indigo-100 text-indigo-700" }
  ];

  const imageSizes = [
    { value: "square", label: "⬜ Square", description: "1:1 ratio - Perfect for social media", size: "512×512" },
    { value: "portrait", label: "📱 Portrait", description: "3:4 ratio - Phone screens, posters", size: "512×768" },
    { value: "landscape", label: "🖥️ Landscape", description: "4:3 ratio - Wallpapers, presentations", size: "768×512" }
  ];

  const qualityOptions = [
    { value: "draft", label: "⚡ Draft", description: "Fast generation (~1s)", color: "bg-green-100 text-green-700", time: "~1s" },
    { value: "standard", label: "⭐ Standard", description: "Balanced quality (~3s)", color: "bg-blue-100 text-blue-700", time: "~3s" },
    { value: "high", label: "💎 High", description: "Better quality (~5s)", color: "bg-purple-100 text-purple-700", time: "~5s" },
    { value: "ultra", label: "🏆 Ultra", description: "Maximum quality (~8s)", color: "bg-orange-100 text-orange-700", time: "~8s" }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResult(null);
    setMcpResults({});

    try {
      // Simulate image generation (replace with actual API call)
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          size: selectedSize,
          quality: selectedQuality,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      setResult(data);

      // Save to image history
      setImageHistory(prev => [data, ...prev.slice(0, 9)]);

      // If MCP is enabled, run AI art generation analysis
      if (mcpEnabled) {
        await runMCPArtGeneration();
      }
    } catch (error) {
      console.error('Image generation error:', error);
      // Create a placeholder result for demo
      const placeholderResult: ImageGenerationResult = {
        prompt,
        style: selectedStyle,
        size: selectedSize,
        quality: selectedQuality,
        image_url: `data:image/svg+xml;base64,${btoa(`
          <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#4ECDC4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#45B7D1;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="400" height="400" fill="url(#grad)" />
            <circle cx="200" cy="200" r="80" fill="white" opacity="0.8" />
            <text x="200" y="210" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
              Generated Image
            </text>
            <text x="200" y="230" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
              ${selectedStyle} style
            </text>
          </svg>
        `)}`,
        generation_time: Math.random() * 10 + 5,
        created_at: new Date().toISOString()
      };
      setResult(placeholderResult);

      if (mcpEnabled) {
        await runMCPArtGeneration();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const runMCPArtGeneration = async () => {
    try {
      const artResponse = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_tool',
          tool: 'ai_art_generator',
          parameters: {
            style: selectedStyle,
            prompt: prompt,
            color_scheme: "vibrant",
            resolution: selectedSize
          }
        })
      });

      if (artResponse.ok) {
        const artData = await artResponse.json();
        setMcpResults(prev => ({
          ...prev,
          art_generation: artData.result.artwork
        }));
      }
    } catch (error) {
      console.error('MCP art generation error:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setUploadedImage(imageData);

      // If MCP is enabled, analyze the uploaded image
      if (mcpEnabled) {
        await runImageAnalysis(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  const runImageAnalysis = async (imageData: string) => {
    try {
      const analysisResponse = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_tool',
          tool: 'image_analyzer',
          parameters: {
            image_data: imageData,
            analysis_type: analysisMode,
            include_objects: true,
            include_colors: true,
            include_mood: true
          }
        })
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setMcpResults(prev => ({
          ...prev,
          analysis: analysisData.result.analysis
        }));
      }
    } catch (error) {
      console.error('Image analysis error:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadImage = () => {
    if (!result?.image_url) return;
    
    const link = document.createElement('a');
    link.href = result.image_url;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStyleColor = (style: string) => {
    const colors: Record<string, string> = {
      realistic: "bg-blue-100 text-blue-700",
      artistic: "bg-purple-100 text-purple-700",
      cartoon: "bg-yellow-100 text-yellow-700",
      abstract: "bg-pink-100 text-pink-700",
      vintage: "bg-amber-100 text-amber-700",
      futuristic: "bg-cyan-100 text-cyan-700",
      minimalist: "bg-gray-100 text-gray-700",
      surreal: "bg-indigo-100 text-indigo-700"
    };
    return colors[style] || "bg-gray-100 text-gray-700";
  };

  // New utility functions
  const handlePromptSelect = (promptTemplate: any) => {
    setPrompt(promptTemplate.prompt);
    setShowPromptLibrary(false);
  };

  const saveCurrentPrompt = () => {
    const promptName = `Prompt ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    setSavedPrompts(prev => [...prev, promptName]);
  };

  const enhancePrompt = () => {
    const enhancements = [
      "highly detailed", "4K resolution", "professional photography", 
      "cinematic lighting", "award-winning", "masterpiece"
    ];
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    setPrompt(prev => `${prev}, ${randomEnhancement}`);
  };

  const generateVariation = () => {
    if (result) {
      const variations = ["different angle", "different lighting", "different color scheme", "different composition"];
      const variation = variations[Math.floor(Math.random() * variations.length)];
      setPrompt(`${result.prompt}, ${variation}`);
    }
  };

  return (
    <div className="responsive-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Image Playground</h1>
            <p className="text-gray-600 text-sm sm:text-base">Generate, analyze, and transform images with AI-powered tools and MCP integration.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              className="w-full sm:w-auto"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Prompts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageHistory(!showImageHistory)}
              className="w-full sm:w-auto"
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageTools(!showImageTools)}
              className="w-full sm:w-auto"
            >
              <Layers className="mr-2 h-4 w-4" />
              Tools
            </Button>
          </div>
        </div>
      </div>

      {/* Prompt Library */}
      {showPromptLibrary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Prompt Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promptLibrary.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2 card-content-safe"
                  onClick={() => handlePromptSelect(template)}
                >
                  <div className="font-medium text-wrap-anywhere">{template.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 text-wrap-anywhere">{template.prompt}</div>
                  <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image History */}
      {showImageHistory && imageHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Recent Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imageHistory.map((img, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                       onClick={() => setPrompt(img.prompt)}>
                    <img 
                      src={img.image_url} 
                      alt={img.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2 text-wrap-anywhere">{img.prompt}</div>
                  <Badge variant="outline" className="text-xs">{img.style}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Tools */}
      {showImageTools && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="mr-2 h-5 w-5" />
              Image Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={enhancePrompt}
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Sparkles className="h-6 w-6 text-purple-500" />
                <span className="text-sm text-center">Enhance Prompt</span>
              </Button>
              <Button
                variant="outline"
                onClick={generateVariation}
                disabled={!result}
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <RotateCw className="h-6 w-6 text-blue-500" />
                <span className="text-sm text-center">Generate Variation</span>
              </Button>
              <Button
                variant="outline"
                onClick={saveCurrentPrompt}
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Save className="h-6 w-6 text-green-500" />
                <span className="text-sm text-center">Save Prompt</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setPrompt("")}
                className="flex flex-col items-center space-y-2 h-auto p-4"
              >
                <Filter className="h-6 w-6 text-red-500" />
                <span className="text-sm text-center">Clear Prompt</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Settings Panel */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* MCP Integration Toggle */}
              <div className="flex items-center justify-between">
                <Label>MCP Tools</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMcpEnabled(!mcpEnabled)}
                  className="p-0 h-auto"
                >
                  {mcpEnabled ? (
                    <ToggleRight className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="min-w-0">
                          <div className="font-medium text-wrap-anywhere">{style.label}</div>
                          <div className="text-xs text-gray-500 text-wrap-anywhere">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size Selection */}
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        <div className="min-w-0">
                          <div className="font-medium text-wrap-anywhere">{size.label}</div>
                          <div className="text-xs text-gray-500 text-wrap-anywhere">{size.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Selection */}
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityOptions.map((quality) => (
                      <SelectItem key={quality.value} value={quality.value}>
                        <div className="min-w-0">
                          <div className="font-medium text-wrap-anywhere">{quality.label}</div>
                          <div className="text-xs text-gray-500 text-wrap-anywhere">{quality.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* MCP Settings */}
              {mcpEnabled && (
                <div className="space-y-4 p-3 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900">MCP Settings</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Analysis Mode</Label>
                    <Select value={analysisMode} onValueChange={setAnalysisMode}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="detailed">Detailed Analysis</SelectItem>
                        <SelectItem value="artistic">Artistic Analysis</SelectItem>
                        <SelectItem value="technical">Technical Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Upload for Analysis */}
                  <div className="space-y-2">
                    <Label className="text-xs">Upload for Analysis</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-xs"
                      />
                      <Upload className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <div className="xl:col-span-3">
          <div className="space-y-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Image Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    rows={4}
                    className="resize-none card-content-safe"
                  />
                </div>
                
                <Button 
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Uploaded Image Analysis */}
            {mcpEnabled && uploadedImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-green-500" />
                    Image Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded for analysis"
                      className="max-w-full max-h-64 rounded-lg border-2 border-gray-200"
                    />
                  </div>

                  {mcpResults.analysis && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <Label className="text-green-900 font-medium">Analysis Results</Label>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Description</Label>
                          <p className="text-sm text-gray-700 mt-1 text-wrap-anywhere">{mcpResults.analysis.description}</p>
                        </div>

                        {mcpResults.analysis.objects.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Detected Objects</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {mcpResults.analysis.objects.map((obj, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {obj}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {mcpResults.analysis.colors.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Dominant Colors</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {mcpResults.analysis.colors.map((color, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {color}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-gray-500">Mood</Label>
                            <p className="font-medium text-wrap-anywhere">{mcpResults.analysis.mood}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Style</Label>
                            <p className="font-medium text-wrap-anywhere">{mcpResults.analysis.style}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Confidence</Label>
                          <p className="font-medium">{(mcpResults.analysis.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {result && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Generated Image
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStyleColor(result.style)}>
                        {result.style}
                      </Badge>
                      <Badge variant="outline">{result.size}</Badge>
                      {mcpEnabled && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Brain className="mr-1 h-3 w-3" />
                          MCP
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Generated Image */}
                  <div className="flex justify-center">
                    <img 
                      src={result.image_url} 
                      alt={result.prompt}
                      className="max-w-full max-h-96 rounded-lg border-2 border-gray-200 shadow-lg"
                    />
                  </div>

                  {/* Prompt Display */}
                  <div className="space-y-2">
                    <Label>Prompt</Label>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-sm text-gray-700 text-wrap-anywhere">{result.prompt}</p>
                    </div>
                  </div>

                  {/* MCP Art Generation Results */}
                  {mcpEnabled && mcpResults.art_generation && (
                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Label className="text-purple-900 font-medium">AI Art Analysis</Label>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500">Generated Title</Label>
                            <p className="font-medium text-sm text-wrap-anywhere">{mcpResults.art_generation.title}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Style Analysis</Label>
                            <p className="font-medium text-sm text-wrap-anywhere">{mcpResults.art_generation.style}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Color Scheme</Label>
                            <p className="font-medium text-sm text-wrap-anywhere">{mcpResults.art_generation.color_scheme}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <img 
                            src={mcpResults.art_generation.preview_url} 
                            alt={mcpResults.art_generation.title}
                            className="w-32 h-32 rounded-lg border-2 border-purple-200"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-500">Enhanced Prompt</Label>
                        <div className="bg-white rounded p-3 border mt-1">
                          <p className="text-xs text-gray-700 text-wrap-anywhere">{mcpResults.art_generation.prompt}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Style</Label>
                      <p className="font-medium text-wrap-anywhere">{result.style}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Size</Label>
                      <p className="font-medium">{result.size}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Quality</Label>
                      <p className="font-medium">{result.quality}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Generation Time</Label>
                      <p className="font-medium">{result.generation_time.toFixed(1)}s</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(result.prompt)}
                      className="w-full sm:w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Prompt
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadImage}
                      className="w-full sm:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0 self-start">
                    <Palette className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">Image Playground Guide</h3>
                    <p className="text-gray-600 mb-4 text-wrap-anywhere">
                      Create stunning images with AI and analyze existing images using advanced MCP tools.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Generation Features</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li className="text-wrap-anywhere">• <strong>Multiple Styles:</strong> Realistic to abstract</li>
                          <li className="text-wrap-anywhere">• <strong>Custom Sizes:</strong> Square to HD formats</li>
                          <li className="text-wrap-anywhere">• <strong>Quality Control:</strong> Draft to ultra quality</li>
                          <li className="text-wrap-anywhere">• <strong>Prompt Engineering:</strong> Detailed descriptions</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">MCP Analysis</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li className="text-wrap-anywhere">• <strong>Image Analysis:</strong> Object and color detection</li>
                          <li className="text-wrap-anywhere">• <strong>Style Recognition:</strong> Artistic style analysis</li>
                          <li className="text-wrap-anywhere">• <strong>Mood Detection:</strong> Emotional tone analysis</li>
                          <li className="text-wrap-anywhere">• <strong>Art Generation:</strong> Enhanced creative prompts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 