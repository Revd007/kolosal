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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Zap, 
  Settings,
  Play,
  Plus,
  Brain,
  Search,
  Code,
  BarChart3,
  Heart,
  Database,
  Shuffle,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Trash2,
  Camera,
  FileText,
  Palette,
  Music,
  Languages,
  FileEdit,
  Calendar
} from "lucide-react";

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface MCPContext {
  id: string;
  name: string;
  description: string;
  tools: string[];
  memory: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ToolResult {
  tool: string;
  result: any;
  timestamp: string;
  parameters: any;
}

export default function MCPPlayground() {
  const [availableTools, setAvailableTools] = useState<MCPTool[]>([]);
  const [contexts, setContexts] = useState<MCPContext[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("web_search");
  const [selectedContext, setSelectedContext] = useState<string>("none");
  const [toolParameters, setToolParameters] = useState<Record<string, any>>({});
  const [results, setResults] = useState<ToolResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateContextOpen, setIsCreateContextOpen] = useState(false);
  const [newContextName, setNewContextName] = useState("");
  const [newContextDescription, setNewContextDescription] = useState("");

  // Fetch available tools and contexts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolsResponse, contextsResponse] = await Promise.all([
          fetch('/api/mcp?action=tools'),
          fetch('/api/mcp?action=contexts')
        ]);
        
        if (toolsResponse.ok) {
          const toolsData = await toolsResponse.json();
          setAvailableTools(toolsData.tools || []);
          if (toolsData.tools && toolsData.tools.length > 0) {
            // Check if the current selectedTool exists in the available tools
            const toolExists = toolsData.tools.some((tool: MCPTool) => tool.name === selectedTool);
            if (!toolExists) {
              setSelectedTool(toolsData.tools[0].name);
            }
          }
        }
        
        if (contextsResponse.ok) {
          const contextsData = await contextsResponse.json();
          setContexts(contextsData.contexts || []);
        }
      } catch (error) {
        console.error('Failed to fetch MCP data:', error);
        setError('Failed to load MCP tools and contexts');
      }
    };

    fetchData();
  }, []);

  const handleExecuteTool = async () => {
    if (!selectedTool) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute_tool',
          tool: selectedTool,
          parameters: toolParameters,
          context_id: selectedContext === "none" ? undefined : selectedContext
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute tool');
      }

      const result = await response.json();
      setResults(prev => [{ ...result, parameters: toolParameters }, ...prev]);
      setToolParameters({});
    } catch (error) {
      console.error('Tool execution error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContext = async () => {
    if (!newContextName.trim()) return;

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_context',
          parameters: {
            name: newContextName,
            description: newContextDescription,
            tools: [selectedTool]
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create context');
      }

      const newContext = await response.json();
      setContexts(prev => [newContext, ...prev]);
      setSelectedContext(newContext.id);
      setNewContextName("");
      setNewContextDescription("");
      setIsCreateContextOpen(false);
    } catch (error) {
      console.error('Context creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create context');
    }
  };

  const getToolIcon = (toolName: string) => {
    const icons: Record<string, any> = {
      web_search: Search,
      code_analyzer: Code,
      data_visualizer: BarChart3,
      sentiment_analyzer: Heart,
      memory_manager: Database,
      random_generator: Shuffle,
      image_analyzer: Camera,
      file_processor: FileText,
      ai_art_generator: Palette,
      music_composer: Music,
      language_translator: Languages,
      document_generator: FileEdit,
      task_scheduler: Calendar
    };
    return icons[toolName] || Zap;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const selectedToolData = availableTools.find(tool => tool.name === selectedTool);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MCP Playground</h1>
        <p className="text-gray-600">Model Context Protocol - Advanced AI tool integration and context management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 min-w-0">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 min-w-0">
              {/* Tool Selection */}
              <div className="space-y-2">
                <Label>Available Tools</Label>
                <Select 
                  value={availableTools.some(tool => tool.name === selectedTool) ? selectedTool : (availableTools[0]?.name || "web_search")} 
                  onValueChange={setSelectedTool}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTools.map((tool) => {
                      const IconComponent = getToolIcon(tool.name);
                      return (
                        <SelectItem key={tool.name} value={tool.name}>
                          <div className="flex items-center space-x-2 w-full min-w-0">
                            <IconComponent className="h-4 w-4 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{tool.name}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {tool.description.length > 50 
                                  ? `${tool.description.substring(0, 50)}...` 
                                  : tool.description
                                }
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Context Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Context</Label>
                  <Dialog open={isCreateContextOpen} onOpenChange={setIsCreateContextOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Context</DialogTitle>
                        <DialogDescription>
                          Create a new MCP context to organize your tools and memory.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={newContextName}
                            onChange={(e) => setNewContextName(e.target.value)}
                            placeholder="My Context"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newContextDescription}
                            onChange={(e) => setNewContextDescription(e.target.value)}
                            placeholder="Describe what this context is for..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateContextOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateContext} disabled={!newContextName.trim()}>
                            Create
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={selectedContext} onValueChange={setSelectedContext}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select context (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Context</SelectItem>
                    {contexts.map((context) => (
                      <SelectItem key={context.id} value={context.id}>
                        <div className="w-full min-w-0">
                          <div className="font-medium truncate">{context.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {context.description.length > 60 
                              ? `${context.description.substring(0, 60)}...` 
                              : context.description
                            }
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tool Parameters */}
              {selectedToolData && (
                <div className="space-y-4">
                  <Label>Parameters</Label>
                  {Object.entries(selectedToolData.parameters).map(([key, param]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-sm">
                        {key}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {param.type === 'string' && (
                        <Input
                          value={toolParameters[key] || ''}
                          onChange={(e) => setToolParameters(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }))}
                          placeholder={param.default || `Enter ${key}...`}
                        />
                      )}
                      {param.type === 'number' && (
                        <Input
                          type="number"
                          value={toolParameters[key] || param.default || ''}
                          onChange={(e) => setToolParameters(prev => ({
                            ...prev,
                            [key]: parseFloat(e.target.value) || 0
                          }))}
                        />
                      )}
                      {param.type === 'array' && (
                        <Textarea
                          value={toolParameters[key] ? JSON.stringify(toolParameters[key]) : ''}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setToolParameters(prev => ({
                                ...prev,
                                [key]: parsed
                              }));
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="[1, 2, 3, 4, 5]"
                          rows={3}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Execute Button */}
              <Button 
                onClick={handleExecuteTool}
                disabled={isLoading || !selectedTool}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Tool
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  Tool Results
                </CardTitle>
                <Badge variant="secondary">{results.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No results yet</p>
                  <p className="text-sm text-gray-400">Execute a tool to see results here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {results.map((result, index) => {
                    const IconComponent = getToolIcon(result.tool);
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{result.tool}</span>
                            <Badge variant="outline">
                              {new Date(result.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(JSON.stringify(result.result, null, 2))}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Parameters */}
                        {Object.keys(result.parameters).length > 0 && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium">Parameters:</Label>
                            <div className="bg-gray-50 rounded p-3 mt-1">
                              <pre className="text-xs text-gray-700">
                                {JSON.stringify(result.parameters, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Result */}
                        <div>
                          <Label className="text-sm font-medium">Result:</Label>
                          <div className="bg-gray-50 rounded p-3 mt-1">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(result.result, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* MCP Info */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Model Context Protocol</h3>
                  <p className="text-gray-600 mb-4">
                    MCP enables AI models to securely connect to data sources and tools, 
                    providing enhanced capabilities and context-aware interactions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Available Tools</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• <strong>Web Search:</strong> Real-time information retrieval</li>
                        <li>• <strong>Code Analyzer:</strong> Code quality and bug detection</li>
                        <li>• <strong>Data Visualizer:</strong> Chart and graph generation</li>
                        <li>• <strong>Sentiment Analyzer:</strong> Emotion and sentiment detection</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Context management and memory</li>
                        <li>• Tool chaining and workflows</li>
                        <li>• Real-time data integration</li>
                        <li>• Secure parameter handling</li>
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
  );
} 