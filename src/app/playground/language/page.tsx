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
  Brain,
  BookOpen,
  Type,
  BarChart3,
  Wand2,
  Scissors,
  AlignLeft,
  FileText,
  Clock,
  Hash,
  Target,
  PenTool,
  Sparkles,
  Library,
  History,
  Share2,
  Layers
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

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  task: string;
}

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  readabilityScore: number;
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

  // New useful features
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showTextStats, setShowTextStats] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [previousResults, setPreviousResults] = useState<GenerationResult[]>([]);

  const promptTemplates: PromptTemplate[] = [
    {
      id: "story",
      name: "📚 Creative Story",
      description: "Generate creative fiction stories",
      prompt: "Write an engaging short story about [TOPIC]. Include vivid descriptions, compelling characters, and an unexpected twist.",
      category: "Creative",
      task: "creative-writing"
    },
    {
      id: "email",
      name: "✉️ Professional Email",
      description: "Draft professional emails",
      prompt: "Write a professional email to [RECIPIENT] about [SUBJECT]. The tone should be [TONE] and include [SPECIFIC_DETAILS].",
      category: "Business",
      task: "completion"
    },
    {
      id: "summary",
      name: "📝 Text Summary",
      description: "Summarize long texts",
      prompt: "Please provide a concise summary of the following text, highlighting the key points and main conclusions:\n\n[TEXT_TO_SUMMARIZE]",
      category: "Analysis",
      task: "summarization"
    },
    {
      id: "code-explain",
      name: "💻 Code Explanation",
      description: "Explain code functionality",
      prompt: "Explain this code in simple terms, including what it does, how it works, and any important concepts:\n\n[CODE]",
      category: "Technical",
      task: "code-explanation"
    },
    {
      id: "translate",
      name: "🌐 Translation",
      description: "Translate text between languages",
      prompt: "Translate the following text from [SOURCE_LANGUAGE] to [TARGET_LANGUAGE], maintaining the original meaning and tone:\n\n[TEXT]",
      category: "Language",
      task: "translation"
    },
    {
      id: "improve",
      name: "✨ Text Improvement",
      description: "Enhance writing quality",
      prompt: "Improve the following text by enhancing clarity, flow, and engagement while maintaining the original meaning:\n\n[TEXT]",
      category: "Writing",
      task: "completion"
    }
  ];

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
      
      // Save to previous results for comparison
      setPreviousResults(prev => [data, ...prev.slice(0, 4)]);

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

  // New utility functions
  const calculateTextStats = (text: string): TextStats => {
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute average
    
    // Simple readability score (Flesch formula approximation)
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const avgSyllablesPerWord = words > 0 ? text.length / words / 2 : 0; // rough approximation
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    return {
      characters,
      words,
      sentences,
      paragraphs,
      readingTime,
      readabilityScore
    };
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
      setPrompt(template.prompt);
      setSelectedTask(template.task);
      setShowPromptLibrary(false);
    }
  };

  const savePrompt = () => {
    const promptName = `Prompt ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    setSavedPrompts(prev => [...prev, promptName]);
    // In a real app, you would save this to localStorage or a database
  };

  const formatText = (action: 'uppercase' | 'lowercase' | 'capitalize' | 'trim') => {
    let newText = prompt;
    switch (action) {
      case 'uppercase':
        newText = prompt.toUpperCase();
        break;
      case 'lowercase':
        newText = prompt.toLowerCase();
        break;
      case 'capitalize':
        newText = prompt.replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'trim':
        newText = prompt.trim().replace(/\s+/g, ' ');
        break;
    }
    setPrompt(newText);
  };

  const promptStats = calculateTextStats(prompt);
  const resultStats = result ? calculateTextStats(result.response) : null;

  return (
    <div className="responsive-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Language Playground</h1>
            <p className="text-gray-600 text-sm sm:text-base">Process and analyze text with advanced language models and NLP tools.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              className="w-full sm:w-auto"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Prompt Library
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTextStats(!showTextStats)}
              className="w-full sm:w-auto"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
              className="w-full sm:w-auto"
            >
              <Target className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {showTextStats && (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{promptStats.characters} characters</span>
            </div>
            <div className="flex items-center space-x-1">
              <Hash className="h-4 w-4" />
              <span>{promptStats.words} words</span>
            </div>
            <div className="flex items-center space-x-1">
              <Layers className="h-4 w-4" />
              <span>{promptStats.sentences} sentences</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>~{promptStats.readingTime} min read</span>
            </div>
          </div>
        )}
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
              {promptTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2 card-content-safe"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="font-medium text-wrap-anywhere">{template.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 text-wrap-anywhere">{template.description}</div>
                  <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                </Button>
              ))}
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
              {/* Text Formatting Tools */}
              <div className="space-y-2">
                <Label>Text Tools</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => formatText('uppercase')}
                    className="text-xs"
                  >
                    <Type className="mr-1 h-3 w-3" />
                    UPPER
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => formatText('lowercase')}
                    className="text-xs"
                  >
                    <Type className="mr-1 h-3 w-3" />
                    lower
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => formatText('capitalize')}
                    className="text-xs"
                  >
                    <PenTool className="mr-1 h-3 w-3" />
                    Title
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => formatText('trim')}
                    className="text-xs"
                  >
                    <Scissors className="mr-1 h-3 w-3" />
                    Trim
                  </Button>
                </div>
              </div>

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

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button onClick={savePrompt} variant="outline" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Save Prompt
                </Button>
              </div>
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
                  <FileText className="mr-2 h-5 w-5" />
                  Text Input
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
                    className="resize-none card-content-safe"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim() || ollamaStatus !== "online" || !selectedModel}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Text
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPrompt("")}
                    disabled={!prompt.trim()}
                  >
                    <Scissors className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Mode */}
            {compareMode && previousResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Previous Results Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previousResults.slice(0, 3).map((prevResult, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {prevResult.model} • {prevResult.task}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(prevResult.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {prevResult.response.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
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
                      Generated Text
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{result.model}</Badge>
                      <Badge variant="secondary">{result.task}</Badge>
                      {resultStats && (
                        <>
                          <Badge variant="outline" className="text-xs">
                            <Hash className="mr-1 h-3 w-3" />
                            {resultStats.words} words
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {resultStats.readingTime} min
                          </Badge>
                        </>
                      )}
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
                  {/* Diff-style Comparison */}
                  <div className="space-y-2">
                    <Label>Comparison View</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Original Prompt */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <Label className="text-sm font-medium text-red-700">Original Prompt</Label>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-900 text-sm whitespace-pre-wrap leading-relaxed">{prompt}</p>
                        </div>
                      </div>

                      {/* Generated Result */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <Label className="text-sm font-medium text-green-700">Generated Result</Label>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-900 text-sm whitespace-pre-wrap leading-relaxed">{result.response}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Traditional View */}
                  <div className="space-y-2">
                    <Label>Traditional View</Label>
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
                    <Button
                      variant="outline"
                      onClick={() => setPrompt(result.response)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Use as Input
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg flex-shrink-0 self-start">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">Language Processing Guide</h3>
                    <p className="text-gray-600 mb-4 text-wrap-anywhere">
                      Leverage advanced NLP models to analyze, transform, and understand text content.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Available Tasks</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li className="text-wrap-anywhere">• <strong>Summarization:</strong> Extract key points</li>
                          <li className="text-wrap-anywhere">• <strong>Translation:</strong> Convert between languages</li>
                          <li className="text-wrap-anywhere">• <strong>Sentiment Analysis:</strong> Understand emotions</li>
                          <li className="text-wrap-anywhere">• <strong>Entity Extraction:</strong> Find names and places</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Best Practices</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li className="text-wrap-anywhere">• Use clear, well-structured input text</li>
                          <li className="text-wrap-anywhere">• Choose appropriate models for your task</li>
                          <li className="text-wrap-anywhere">• Adjust temperature for creativity vs accuracy</li>
                          <li className="text-wrap-anywhere">• Review results and iterate as needed</li>
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