"use client";

import { useState, useEffect, useRef } from "react";
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
  User,
  Bot,
  Copy,
  Download,
  RefreshCw,
  Zap,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Edit,
  Save,
  X,
  RotateCcw,
  MoreHorizontal,
  Repeat,
  UserX,
  Brain,
  Wrench,
  Search,
  FileText,
  Clock,
  Hash,
  BookOpen,
  Bookmark,
  Share2,
  MessageSquare
} from "lucide-react";

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  initialMessage: string;
  category: string;
}

export default function ChatPlayground() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<"online" | "offline" | "loading">("loading");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm here to help you. What would you like to know or discuss?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [topP, setTopP] = useState(0.9);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [mcpToolsEnabled, setMcpToolsEnabled] = useState(false);
  const [selectedMcpTools, setSelectedMcpTools] = useState<string[]>([]);
  const [showMcpSettings, setShowMcpSettings] = useState(false);
  const [availableMcpTools, setAvailableMcpTools] = useState<string[]>([]);

  // New useful features
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [savedConversations, setSavedConversations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationTemplates: ConversationTemplate[] = [
    {
      id: "coding",
      name: "💻 Coding Assistant",
      description: "Help with programming and code review",
      systemPrompt: "You are an expert programming assistant. Help with code, debugging, best practices, and technical explanations.",
      initialMessage: "I'm ready to help with your coding questions! What programming language or project are you working on?",
      category: "Development"
    },
    {
      id: "writing",
      name: "✍️ Writing Helper",
      description: "Creative writing and content creation",
      systemPrompt: "You are a creative writing assistant. Help with storytelling, editing, grammar, and content creation.",
      initialMessage: "Let's create something amazing together! What kind of writing project are you working on?",
      category: "Creative"
    },
    {
      id: "learning",
      name: "🎓 Learning Tutor",
      description: "Educational support and explanations",
      systemPrompt: "You are a patient and knowledgeable tutor. Explain concepts clearly, provide examples, and adapt to the student's learning pace.",
      initialMessage: "I'm here to help you learn! What subject or topic would you like to explore today?",
      category: "Education"
    },
    {
      id: "business",
      name: "💼 Business Advisor",
      description: "Business strategy and analysis",
      systemPrompt: "You are a business consultant with expertise in strategy, operations, and market analysis. Provide practical business advice.",
      initialMessage: "Ready to discuss your business challenges and opportunities. What can I help you with?",
      category: "Business"
    },
    {
      id: "research",
      name: "🔬 Research Assistant",
      description: "Research and fact-finding",
      systemPrompt: "You are a research assistant. Help with information gathering, analysis, and presenting findings in a structured way.",
      initialMessage: "Let's dive into research! What topic would you like me to help you investigate?",
      category: "Research"
    }
  ];

  // Fetch available models from Ollama and MCP tools
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

    const fetchMcpTools = async () => {
      try {
        const response = await fetch('/api/mcp?action=tools');
        const data = await response.json();
        if (data.tools) {
          setAvailableMcpTools(data.tools.map((tool: any) => tool.name));
        }
      } catch (error) {
        console.error("Failed to fetch MCP tools:", error);
      }
    };

    fetchOllamaModels();
    fetchMcpTools();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !selectedModel) return;

    const newUserMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage("");
    setIsLoading(true);

    if (streamingEnabled) {
      await handleStreamingResponse(newUserMessage);
    } else {
      await handleRegularResponse(newUserMessage);
    }
  };

  const handleStreamingResponse = async (newUserMessage: ChatMessage) => {
    const assistantMessageId = messages.length + 2;
    
    // Add empty assistant message for streaming
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, newUserMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: temperature,
          max_tokens: maxTokens,
          top_p: topP,
          system_prompt: systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get streaming response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  throw new Error(data.error);
                }
                
                if (data.response && !data.done) {
                  fullContent += data.response;
                  
                  // Update the streaming message
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullContent }
                      : msg
                  ));
                }
                
                if (data.done) {
                  // Mark streaming as complete
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
                }
              } catch (parseError) {
                console.error('Error parsing streaming data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      
      // Update with error message
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: error instanceof Error 
                ? `Error: ${error.message}` 
                : "Sorry, something went wrong with streaming.",
              isStreaming: false
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularResponse = async (newUserMessage: ChatMessage) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, newUserMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: temperature,
          max_tokens: maxTokens,
          top_p: topP,
          system_prompt: systemPrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: messages.length + 2,
        role: "assistant", 
        content: data.response || "Sorry, I couldn't generate a response.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        role: "assistant",
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : "Sorry, something went wrong. Please make sure Ollama is running.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      role: "assistant",
      content: "Hello! I'm here to help you. What would you like to know or discuss?",
      timestamp: new Date().toISOString()
    }]);
  };

  const handleEditMessage = (messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId === null) return;

    setMessages(prev => prev.map(msg => 
      msg.id === editingMessageId 
        ? { ...msg, content: editingContent }
        : msg
    ));
    
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleResendFrom = async (messageId: number) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Remove messages after the selected one
    const newMessages = messages.slice(0, messageIndex + 1);
    setMessages(newMessages);

    // Get the user message to resend
    const userMessage = messages[messageIndex];
    if (userMessage.role === "user") {
      setIsLoading(true);
      if (streamingEnabled) {
        await handleStreamingResponse(userMessage);
      } else {
        await handleRegularResponse(userMessage);
      }
    }
  };

  const handleChangeRole = (messageId: number, newRole: "user" | "assistant") => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, role: newRole }
        : msg
    ));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatModelSize = (size: number) => {
    const gb = size / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  // New utility functions
  const getWordCount = () => {
    return messages.reduce((count, msg) => count + msg.content.split(' ').length, 0);
  };

  const getReadingTime = () => {
    const words = getWordCount();
    const minutes = Math.ceil(words / 200); // Average reading speed
    return minutes;
  };

  const filteredMessages = messages.filter(msg => 
    searchQuery === "" || 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSelect = (templateId: string) => {
    const template = conversationTemplates.find(t => t.id === templateId);
    if (template) {
      setSystemPrompt(template.systemPrompt);
      setMessages([{
        id: 1,
        role: "assistant",
        content: template.initialMessage,
        timestamp: new Date().toISOString()
      }]);
      setSelectedTemplate(templateId);
      setShowTemplates(false);
    }
  };

  const saveConversation = () => {
    const conversationName = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    setSavedConversations(prev => [...prev, conversationName]);
    // In a real app, you would save this to localStorage or a database
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareConversation = async () => {
    const chatSummary = `Chat with ${selectedModel} - ${messages.length} messages`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Chat Conversation',
          text: chatSummary,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      copyToClipboard(chatSummary);
    }
  };

  return (
    <div className="responsive-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Chat Playground</h1>
            <p className="text-gray-600 text-sm sm:text-base">Interact with leading language models in real-time.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full sm:w-auto"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={saveConversation}
              className="w-full sm:w-auto"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareConversation}
              className="w-full sm:w-auto"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{messages.length} messages</span>
          </div>
          <div className="flex items-center space-x-1">
            <Hash className="h-4 w-4" />
            <span>{getWordCount()} words</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{getReadingTime()} min read</span>
          </div>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Conversation Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversationTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2 card-content-safe"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="font-medium text-wrap-anywhere">{template.name}</div>
                  <div className="text-xs text-gray-500 text-wrap-anywhere">{template.description}</div>
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
              {/* Search Messages */}
              <div className="space-y-2">
                <Label>Search Messages</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in conversation..."
                    className="pl-10"
                  />
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

              {/* Streaming Toggle */}
              <div className="flex items-center justify-between">
                <Label>Streaming</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStreamingEnabled(!streamingEnabled)}
                  className="p-0 h-auto"
                >
                  {streamingEnabled ? (
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
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">Ollama is not running</span>
                  </div>
                ) : availableModels.length === 0 ? (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
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
                        <div className="min-w-0">
                          <div className="font-medium text-wrap-anywhere">{model.name}</div>
                            <div className="text-xs text-gray-500 text-wrap-anywhere">
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

              {/* System Prompt */}
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt..."
                  rows={4}
                  className="card-content-safe"
                />
              </div>

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
                  <p className="text-xs text-gray-500 text-wrap-anywhere">Controls randomness (0 = deterministic, 2 = very random)</p>
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
                  <p className="text-xs text-gray-500 text-wrap-anywhere">Maximum number of tokens to generate</p>
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
                  <p className="text-xs text-gray-500 text-wrap-anywhere">Nucleus sampling threshold</p>
                </div>
              </div>

              {/* MCP Tools Settings */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>MCP Tools</span>
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMcpToolsEnabled(!mcpToolsEnabled)}
                    className="p-0 h-auto"
                  >
                    {mcpToolsEnabled ? (
                      <ToggleRight className="h-6 w-6 text-blue-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {mcpToolsEnabled && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMcpSettings(!showMcpSettings)}
                      className="w-full text-xs"
                    >
                      <Wrench className="mr-2 h-3 w-3" />
                      Configure Tools
                    </Button>
                    
                    {showMcpSettings && availableMcpTools.length > 0 && (
                      <div className="space-y-2 p-2 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-600">Select tools to enable:</p>
                        {availableMcpTools.map((tool) => (
                          <label key={tool} className="flex items-center space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedMcpTools.includes(tool)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMcpTools(prev => [...prev, tool]);
                                } else {
                                  setSelectedMcpTools(prev => prev.filter(t => t !== tool));
                                }
                              }}
                              className="h-3 w-3"
                            />
                            <span className="capitalize text-wrap-anywhere">{tool.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={clearChat} variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Chat
                </Button>
                <Button onClick={exportChat} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="xl:col-span-3">
          <Card className="h-[600px] sm:h-[700px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Chat</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedModel && (
                  <Badge variant="outline" className="text-wrap-anywhere">
                      {selectedModel}
                    </Badge>
                  )}
                  {streamingEnabled && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Streaming
                  </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <Search className="mr-1 h-3 w-3" />
                      {filteredMessages.length} found
                    </Badge>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={
                      ollamaStatus === "online" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }
                  >
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      ollamaStatus === "online" ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    {ollamaStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-blue-100 ml-3' : 'bg-gray-100 mr-3'
                      }`}>
                        {message.role === 'user' ? 
                          <User className="h-4 w-4 text-blue-600" /> : 
                          <Bot className="h-4 w-4 text-gray-600" />
                        }
                      </div>
                      <div className={`rounded-lg px-4 py-2 relative group min-w-0 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {editingMessageId === message.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="min-h-[60px] text-sm card-content-safe"
                              autoFocus
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                size="sm" 
                                onClick={handleSaveEdit}
                                className="h-6 px-2 text-xs"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-6 px-2 text-xs"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap break-words text-wrap-anywhere">
                              {message.content}
                              {message.isStreaming && (
                                <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse">|</span>
                              )}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                              <div className="flex items-center space-x-2">
                                <p className={`text-xs ${
                                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleChangeRole(message.id, message.role === 'user' ? 'assistant' : 'user')}
                                  className={`h-5 px-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                                    message.role === 'user' ? 'text-blue-100 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  {message.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                </Button>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!message.isStreaming && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleEditMessage(message.id, message.content)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(message.content)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    {message.role === 'user' && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleResendFrom(message.id)}
                                      >
                                        <Repeat className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && !streamingEnabled && (
                  <div className="flex justify-start">
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <Input
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isLoading || ollamaStatus !== "online" || !selectedModel}
                  className="flex-1 card-content-safe"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !userMessage.trim() || ollamaStatus !== "online" || !selectedModel}
                  className="flex-shrink-0 w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 