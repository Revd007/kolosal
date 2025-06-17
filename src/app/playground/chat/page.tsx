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
  User,
  Bot,
  Copy,
  Download,
  RefreshCw,
  Zap,
  AlertCircle,
  ToggleLeft,
  ToggleRight
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Playground</h1>
        <p className="text-gray-600">Interact with leading language models in real-time.</p>
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

              {/* System Prompt */}
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt..."
                  rows={4}
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
                  <p className="text-xs text-gray-500">Controls randomness (0 = deterministic, 2 = very random)</p>
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
                  <p className="text-xs text-gray-500">Maximum number of tokens to generate</p>
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
                  <p className="text-xs text-gray-500">Nucleus sampling threshold</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={clearChat} variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Chat
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>Chat</CardTitle>
                <div className="flex items-center space-x-2">
                  {selectedModel && (
                    <Badge variant="outline">
                      {selectedModel}
                    </Badge>
                  )}
                  {streamingEnabled && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Streaming
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
                {messages.map((message) => (
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
                      <div className={`rounded-lg px-4 py-2 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse">|</span>
                          )}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {message.role === 'assistant' && !message.isStreaming && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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
              </div>

              {/* Message Input */}
              <div className="flex space-x-2 flex-shrink-0">
                <Input
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isLoading || ollamaStatus !== "online" || !selectedModel}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !userMessage.trim() || ollamaStatus !== "online" || !selectedModel}
                  className="flex-shrink-0"
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