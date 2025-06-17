"use client";

import { useState, useEffect } from "react";
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
  Send, 
  Settings,
  Copy,
  Download,
  RefreshCw,
  Zap,
  AlertCircle,
  CheckCircle,
  Heart,
  Languages,
  FileEdit,
  ToggleLeft,
  ToggleRight,
  Brain
} from "lucide-react";

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
}

interface GenerationResult {
  response: string;
  model: string;
  task: string;
  tokens_used: number;
  response_time: number;
  created_at: string;
}

interface MCPResult {
  sentiment?: {
    label: string;
    confidence: number;
    emotions: Array<{
      emotion: string;
      intensity: number;
    }>;
  };
  translation?: {
    original_text: string;
    translated_text: string;
    from_language: string;
    to_language: string;
    confidence: number;
  };
  document?: {
    type: string;
    title: string;
    content: string;
    word_count: number;
    pages: number;
  };
}



export default function LanguagePlayground() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<"online" | "offline" | "loading">("loading");
  const [selectedTask, setSelectedTask] = useState("completion");
  const [prompt, setPrompt] = useState("Write a creative story about a robot learning to paint.");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpResults, setMcpResults] = useState<MCPResult>({});
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [documentType, setDocumentType] = useState("report");
  
  // Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [topP, setTopP] = useState(0.9);

  // Fetch available models from Ollama
  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        setOllamaStatus("loading");
        const response = await fetch('/api/chat');
        const data = await response.json();
        
        if (response.ok && data.models && data.models.length > 0) {
          setAvailableModels(data.models);
          setSelectedModel(data.models[0].name);
          setOllamaStatus("online");
        } else {
          setOllamaStatus("offline");
          console.error("No models available:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch Ollama models:", error);
        setOllamaStatus("offline");
      }
    };

    fetchOllamaModels();
  }, []);



  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setMcpResults({});

    try {
      // Generate text with Ollama
      const response = await fetch('/api/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          task: selectedTask,
          temperature: temperature,
          max_tokens: maxTokens,
          top_p: topP,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate text');
      }

      const data = await response.json();
      setResult(data);

      // If MCP is enabled, run additional analysis
      if (mcpEnabled && data.response) {
        await runMCPAnalysis(data.response);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Sorry, something went wrong.');
      setResult({
        response: error instanceof Error ? `Error: ${error.message}` : "Sorry, something went wrong.",
        model: selectedModel,
        task: selectedTask,
        tokens_used: 0,
        response_time: 0,
        created_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runMCPAnalysis = async (text: string) => {
    const mcpResults: MCPResult = {};

    try {
      // Sentiment Analysis
      const sentimentResponse = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_tool',
          tool: 'sentiment_analyzer',
          parameters: { text }
        })
      });

      if (sentimentResponse.ok) {
        const sentimentData = await sentimentResponse.json();
        mcpResults.sentiment = sentimentData.result.sentiment;
      }

      // Translation (if task is translation or if enabled)
      if (selectedTask === "translation" || targetLanguage !== "en") {
        const translationResponse = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'execute_tool',
            tool: 'language_translator',
            parameters: {
              text,
              from_language: "auto",
              to_language: targetLanguage,
              context: "general"
            }
          })
        });

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          mcpResults.translation = translationData.result.translation;
        }
      }

      // Document Generation (if applicable)
      if (["completion", "creative-writing"].includes(selectedTask)) {
        const docResponse = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'execute_tool',
            tool: 'document_generator',
            parameters: {
              document_type: documentType,
              content_outline: text.substring(0, 200),
              style: "professional",
              length: "medium"
            }
          })
        });

        if (docResponse.ok) {
          const docData = await docResponse.json();
          mcpResults.document = docData.result.document;
        }
      }

      setMcpResults(mcpResults);
    } catch (error) {
      console.error('MCP analysis error:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    
    const content = `Language Generation Result
    
Model: ${result.model}
Task: ${result.task}
Tokens Used: ${result.tokens_used}
Response Time: ${result.response_time}s
Generated: ${new Date(result.created_at).toLocaleString('en-US')}

Prompt:
${prompt}

Result:
${result.response}

${mcpEnabled && mcpResults.sentiment ? `
Sentiment Analysis:
- Label: ${mcpResults.sentiment.label}
- Confidence: ${(mcpResults.sentiment.confidence * 100).toFixed(1)}%
- Emotions: ${mcpResults.sentiment.emotions.map(e => `${e.emotion} (${(e.intensity * 100).toFixed(1)}%)`).join(', ')}
` : ''}

${mcpResults.translation ? `
Translation:
- From: ${mcpResults.translation.from_language}
- To: ${mcpResults.translation.to_language}
- Confidence: ${(mcpResults.translation.confidence * 100).toFixed(1)}%
- Result: ${mcpResults.translation.translated_text}
` : ''}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `language-generation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatModelSize = (size: number) => {
    const gb = size / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Language Playground</h1>
        <p className="text-gray-600">Generate, analyze, and transform text with advanced AI models and MCP tools.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ollama Status */}
              <div className="flex items-center justify-between">
                <Label>Ollama Status</Label>
                <Badge 
                  variant="secondary" 
                  className={
                    ollamaStatus === "online" 
                      ? "bg-green-100 text-green-700" 
                      : ollamaStatus === "offline"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    ollamaStatus === "online" 
                      ? "bg-green-500" 
                      : ollamaStatus === "offline"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}></div>
                  {ollamaStatus === "loading" ? "Connecting..." : ollamaStatus}
                </Badge>
              </div>

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

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Model</Label>
                {ollamaStatus === "offline" ? (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">Ollama is not running</span>
                  </div>
                ) : availableModels.length === 0 ? (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">No models available</span>
                  </div>
                ) : (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatModelSize(model.size)} • Modified {new Date(model.modified_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Task Selection */}
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completion">Text Completion</SelectItem>
                    <SelectItem value="summarization">Summarization</SelectItem>
                    <SelectItem value="translation">Translation</SelectItem>
                    <SelectItem value="question-answering">Q&A</SelectItem>
                    <SelectItem value="code-generation">Code Generation</SelectItem>
                    <SelectItem value="code-explanation">Code Explanation</SelectItem>
                    <SelectItem value="creative-writing">Creative Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* MCP Settings */}
              {mcpEnabled && (
                <div className="space-y-4 p-3 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900">MCP Settings</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Translation Target</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="resume">Resume</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Model Parameters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature: {temperature}</Label>
                  <Input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.1" 
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens: {maxTokens}</Label>
                  <Input 
                    type="range" 
                    min="1" 
                    max="4096" 
                    step="1"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top P: {topP}</Label>
                  <Input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Text Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    rows={6}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim() || ollamaStatus !== "online" || !selectedModel}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Text
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Generated Text
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{result.model}</Badge>
                      <Badge variant="secondary">{result.task}</Badge>
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
                  {/* Generated Text */}
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-gray-900 whitespace-pre-wrap">{result.response}</p>
                    </div>
                  </div>

                  {/* MCP Analysis Results */}
                  {mcpEnabled && Object.keys(mcpResults).length > 0 && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label className="text-blue-900 font-medium">MCP Analysis</Label>
                      
                      {/* Sentiment Analysis */}
                      {mcpResults.sentiment && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            <span className="text-sm font-medium">Sentiment Analysis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getSentimentColor(mcpResults.sentiment.label)}>
                              {mcpResults.sentiment.label}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {(mcpResults.sentiment.confidence * 100).toFixed(1)}% confidence
                            </span>
                          </div>
                          {mcpResults.sentiment.emotions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {mcpResults.sentiment.emotions.map((emotion, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {emotion.emotion} ({(emotion.intensity * 100).toFixed(0)}%)
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Translation */}
                      {mcpResults.translation && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Languages className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Translation</span>
                          </div>
                          <div className="bg-white rounded p-3 border">
                            <p className="text-sm text-gray-700">{mcpResults.translation.translated_text}</p>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{mcpResults.translation.from_language} → {mcpResults.translation.to_language}</span>
                            <span>{(mcpResults.translation.confidence * 100).toFixed(1)}% confidence</span>
                          </div>
                        </div>
                      )}

                      {/* Document Generation */}
                      {mcpResults.document && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FileEdit className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Document Template</span>
                          </div>
                          <div className="bg-white rounded p-3 border">
                            <h4 className="font-medium text-sm mb-2">{mcpResults.document.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {mcpResults.document.word_count} words • {mcpResults.document.pages} pages
                            </p>
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {mcpResults.document.content.substring(0, 200)}...
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Tokens Used</Label>
                      <p className="font-medium">{result.tokens_used}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Response Time</Label>
                      <p className="font-medium">{result.response_time.toFixed(2)}s</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Model</Label>
                      <p className="font-medium">{result.model}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Generated</Label>
                      <p className="font-medium">
                        {new Date(result.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(result.response)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadResult}
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
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Language Playground Guide</h3>
                    <p className="text-gray-600 mb-4">
                      Generate, analyze, and transform text using advanced AI models and MCP tools.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Available Tasks</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• <strong>Completion:</strong> Continue or expand text</li>
                          <li>• <strong>Summarization:</strong> Create concise summaries</li>
                          <li>• <strong>Translation:</strong> Convert between languages</li>
                          <li>• <strong>Q&A:</strong> Answer questions based on context</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">MCP Features</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• <strong>Sentiment Analysis:</strong> Emotion detection</li>
                          <li>• <strong>Translation:</strong> Multi-language support</li>
                          <li>• <strong>Document Generation:</strong> Template creation</li>
                          <li>• <strong>Real-time Analysis:</strong> Instant insights</li>
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