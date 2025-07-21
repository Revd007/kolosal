"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus,
  Play,
  Pause,
  Square,
  Settings,
  Trash2,
  Copy,
  Share2,
  Download,
  Upload,
  Zap,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Brain,
  Workflow,
  Cpu,
  Database,
  MessageSquare,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Activity
} from "lucide-react";
import { WorkflowCanvas } from "@/components/workflows";
import { WorkflowNode, WorkflowConnection, Workflow as WorkflowType, NodeTemplate } from "@/types/workflow";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null);
  
  // Debug logging
  useEffect(() => {
    console.log('Selected workflow changed:', selectedWorkflow?.id, selectedWorkflow?.name);
  }, [selectedWorkflow]);
  const [nodeTemplates, setNodeTemplates] = useState<NodeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<WorkflowNode[]>([]);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isExecuting, setIsExecuting] = useState(false);

  // AI Node Templates based on N8N patterns
  const aiNodeTemplates: NodeTemplate[] = [
    {
      id: "ai-agent",
      name: "AI Agent",
      category: "ai",
      description: "Autonomous AI agent that can plan and execute tasks using available tools",
      icon: Brain,
      color: "bg-purple-500",
      inputs: [
        { name: "task", type: "string", required: true, description: "Task description for the AI agent" },
        { name: "context", type: "object", required: false, description: "Additional context data" }
      ],
      outputs: [
        { name: "result", type: "object", description: "Agent execution result" },
        { name: "actions", type: "array", description: "List of actions taken" }
      ],
      config_schema: {
        model: { type: "select", options: ["gpt-4", "claude-3", "phi", "llama-2"], default: "gpt-4" },
        temperature: { type: "number", min: 0, max: 2, default: 0.7 },
        max_iterations: { type: "number", default: 5 },
        tools: { type: "array", description: "Available tools for the agent" }
      }
    },
    {
      id: "llm-chain",
      name: "LLM Chain",
      category: "ai",
      description: "Chain multiple LLM prompts with context passing",
      icon: GitBranch,
      color: "bg-blue-500",
      inputs: [
        { name: "prompt", type: "string", required: true, description: "LLM prompt template" },
        { name: "variables", type: "object", required: false, description: "Template variables" }
      ],
      outputs: [
        { name: "response", type: "string", description: "LLM response" },
        { name: "tokens", type: "number", description: "Tokens used" }
      ],
      config_schema: {
        model: { type: "select", options: ["gpt-4", "claude-3", "phi"], default: "gpt-4" },
        system_prompt: { type: "textarea", description: "System prompt" },
        temperature: { type: "number", min: 0, max: 2, default: 0.7 }
      }
    },
    {
      id: "text-analyzer",
      name: "Text Analyzer",
      category: "ai",
      description: "Analyze text for sentiment, entities, classification, etc.",
      icon: FileText,
      color: "bg-green-500",
      inputs: [
        { name: "text", type: "string", required: true, description: "Text to analyze" }
      ],
      outputs: [
        { name: "sentiment", type: "object", description: "Sentiment analysis result" },
        { name: "entities", type: "array", description: "Named entities found" },
        { name: "categories", type: "array", description: "Text categories" }
      ],
      config_schema: {
        analysis_types: { type: "multiselect", options: ["sentiment", "entities", "classification"] },
        confidence_threshold: { type: "number", min: 0, max: 1, default: 0.8 }
      }
    }
  ];

  // Core Node Templates
  const coreNodeTemplates: NodeTemplate[] = [
    {
      id: "http-request",
      name: "HTTP Request",
      category: "core",
      description: "Make HTTP requests to external APIs",
      icon: Zap,
      color: "bg-orange-500",
      inputs: [
        { name: "url", type: "string", required: true, description: "Request URL" },
        { name: "data", type: "object", required: false, description: "Request payload" }
      ],
      outputs: [
        { name: "response", type: "object", description: "HTTP response" },
        { name: "status", type: "number", description: "HTTP status code" }
      ],
      config_schema: {
        method: { type: "select", options: ["GET", "POST", "PUT", "DELETE"], default: "GET" },
        headers: { type: "object", description: "HTTP headers" },
        timeout: { type: "number", default: 30000 }
      }
    },
    {
      id: "webhook",
      name: "Webhook",
      category: "core",
      description: "Receive data from external webhook calls",
      icon: Activity,
      color: "bg-red-500",
      inputs: [],
      outputs: [
        { name: "body", type: "object", description: "Webhook payload" },
        { name: "headers", type: "object", description: "Request headers" }
      ],
      config_schema: {
        path: { type: "string", description: "Webhook path" },
        methods: { type: "multiselect", options: ["GET", "POST", "PUT", "DELETE"] }
      }
    }
  ];

  // Mock workflows data - sync with API data
  const mockWorkflows: WorkflowType[] = [
    {
      id: "wf-ai-agent-1",
      name: "Customer Support AI Agent",
      description: "Intelligent customer support automation with AI reasoning",
      status: "active",
      category: "ai-agent",
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          category: "core",
          name: "Webhook Trigger",
          description: "Receives customer support requests",
          config: { path: "/webhook/support", methods: ["POST"] },
          position: { x: 100, y: 100 },
          connections: { input: [], output: ["ai-agent-1"] },
          status: "idle"
        },
        {
          id: "ai-agent-1",
          type: "ai",
          category: "ai",
          name: "Support AI Agent",
          description: "AI agent that analyzes and responds to support requests",
          config: {
            model: "gpt-4",
            temperature: 0.7,
            system_prompt: "You are a helpful customer support agent."
          },
          position: { x: 400, y: 100 },
          connections: { input: ["trigger-1"], output: ["action-1"] },
          status: "idle"
        },
        {
          id: "action-1",
          type: "action",
          category: "integration",
          name: "Send Response",
          description: "Sends AI-generated response to customer",
          config: { service: "email", template: "support_response" },
          position: { x: 700, y: 100 },
          connections: { input: ["ai-agent-1"], output: [] },
          status: "idle"
        }
      ],
      connections: [
        { id: "conn-1", from: "trigger-1", to: "ai-agent-1", fromPort: "output", toPort: "input" },
        { id: "conn-2", from: "ai-agent-1", to: "action-1", fromPort: "output", toPort: "input" }
      ],
      triggers: [{ type: "webhook", config: { path: "/webhook/support" } }],
      variables: {},
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T14:45:00Z",
      created_by: "user-1",
      executions: { total: 142, successful: 134, failed: 8, last_run: "2024-01-20T14:45:00Z" },
      performance: { avg_execution_time: 4.2, success_rate: 94.4, total_runtime: 596.4 }
    },
    {
      id: "wf-2", 
      name: "Content Generation Pipeline",
      description: "AI-powered content creation workflow with review and publishing",
      status: "active",
      category: "ai-agent",
      nodes: [],
      connections: [],
      triggers: [{ type: "schedule", config: { cron: "0 9 * * *" } }],
      variables: {},
      created_at: "2024-01-18T09:15:00Z",
      updated_at: "2024-01-20T13:20:00Z",
      created_by: "user-2",
      executions: { total: 42, successful: 40, failed: 2, last_run: "2024-01-20T13:20:00Z" },
      performance: { avg_execution_time: 12.5, success_rate: 95.2, total_runtime: 525 }
    },
    {
      id: "wf-3",
      name: "Data Analysis Agent",
      description: "Intelligent data processing and insights generation workflow",
      status: "draft",
      category: "automation",
      nodes: [],
      connections: [],
      triggers: [{ type: "manual", config: {} }],
      variables: {},
      created_at: "2024-01-20T16:00:00Z",
      updated_at: "2024-01-20T16:00:00Z",
      created_by: "user-1",
      executions: { total: 0, successful: 0, failed: 0 },
      performance: { avg_execution_time: 0, success_rate: 0, total_runtime: 0 }
    }
  ];

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWorkflows(mockWorkflows);
      setNodeTemplates([...aiNodeTemplates, ...coreNodeTemplates]);
    } catch (err) {
      console.error('Workflows fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || workflow.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateWorkflow = () => {
    const newWorkflow: WorkflowType = {
      id: `wf-${Date.now()}`,
      name: "New Workflow",
      description: "A new AI workflow",
      status: "draft",
      category: "ai-agent",
      nodes: [
        {
          id: "start-node",
          type: "trigger",
          category: "core",
          name: "Manual Trigger",
          description: "Start workflow manually",
          config: {},
          position: { x: 200, y: 200 },
          connections: { input: [], output: [] },
          status: "idle"
        }
      ],
      connections: [],
      triggers: [{ type: "manual", config: {} }],
      variables: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "current-user",
      executions: { total: 0, successful: 0, failed: 0 },
      performance: { avg_execution_time: 0, success_rate: 0, total_runtime: 0 }
    };
    
    setWorkflows(prev => [newWorkflow, ...prev]);
    setSelectedWorkflow(newWorkflow);
    setIsCreateDialogOpen(false);
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    setIsExecuting(true);
    try {
      // Call the actual workflow API
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute',
          workflow_id: workflowId,
          input_data: {
            message: "Test execution from dashboard",
            context: {
              user_id: "current-user",
              source: "dashboard"
            }
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Workflow execution result:', result);
        
        setWorkflows(prev => prev.map(wf => 
          wf.id === workflowId 
            ? {
                ...wf,
                executions: {
                  ...wf.executions,
                  total: wf.executions.total + 1,
                  successful: result.execution.status === 'completed' ? wf.executions.successful + 1 : wf.executions.successful,
                  failed: result.execution.status === 'failed' ? wf.executions.failed + 1 : wf.executions.failed,
                  last_run: new Date().toISOString()
                }
              }
            : wf
        ));
      } else {
        throw new Error('Workflow execution failed');
      }
    } catch (err) {
      console.error('Workflow execution error:', err);
      setError(err instanceof Error ? err.message : 'Workflow execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "draft":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai-agent":
        return <Brain className="h-4 w-4 text-purple-500" />;
      case "automation":
        return <Workflow className="h-4 w-4 text-blue-500" />;
      case "integration":
        return <Zap className="h-4 w-4 text-orange-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading workflows...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Workflows</h1>
            <p className="text-gray-600">Build and manage intelligent automation workflows with AI agents.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => handleExecuteWorkflow('wf-ai-agent-1')} 
              variant="outline"
              disabled={isExecuting}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              {isExecuting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isExecuting ? 'Testing...' : 'Test Workflow'}
            </Button>
            <Button 
              onClick={() => {
                const testWorkflow = workflows.find(w => w.id === 'wf-ai-agent-1');
                if (testWorkflow) {
                  console.log('Opening canvas for:', testWorkflow.name);
                  setSelectedWorkflow(testWorkflow);
                }
              }} 
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Eye className="mr-2 h-4 w-4" />
              Open Canvas
            </Button>
            <Button onClick={fetchWorkflows} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>
                    Choose a template or start from scratch to build your AI workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateWorkflow}>
                      <CardContent className="p-4 text-center">
                        <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <h3 className="font-medium">AI Agent</h3>
                        <p className="text-sm text-gray-500">Autonomous AI workflow</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateWorkflow}>
                      <CardContent className="p-4 text-center">
                        <Workflow className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-medium">Automation</h3>
                        <p className="text-sm text-gray-500">Process automation</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

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

      {/* Workflow Canvas or List View */}
      {selectedWorkflow ? (
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Canvas Mode:</strong> Editing workflow "{selectedWorkflow.name}"
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedWorkflow(null)}
                className="text-blue-700 border-blue-300"
              >
                ← Back to List
              </Button>
            </div>
          </div>
          <WorkflowCanvas 
            workflow={selectedWorkflow}
            onWorkflowChange={(updatedWorkflow: WorkflowType) => {
              setWorkflows(prev => prev.map(wf => 
                wf.id === updatedWorkflow.id ? updatedWorkflow : wf
              ));
              setSelectedWorkflow(updatedWorkflow);
            }}
            onExecute={() => handleExecuteWorkflow(selectedWorkflow.id)}
            isExecuting={isExecuting}
          />
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search workflows..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ai-agent">AI Agents</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow) => (
              <Card 
                key={workflow.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(workflow.category)}
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(workflow.status)}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkflow(workflow);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Executions:</span>
                      <span>{workflow.executions.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate:</span>
                      <span className="text-green-600">{workflow.performance.success_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Time:</span>
                      <span>{workflow.performance.avg_execution_time.toFixed(1)}s</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                      {workflow.status}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteWorkflow(workflow.id);
                        }}
                        disabled={isExecuting || workflow.status !== "active"}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Create your first AI workflow to get started"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 