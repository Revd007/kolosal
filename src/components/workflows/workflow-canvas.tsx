"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  Plus,
  Play,
  Save,
  Settings,
  Trash2,
  Copy,
  Zap,
  GitBranch,
  Brain,
  Activity,
  FileText,
  Database,
  MessageSquare,
  Workflow,
  RefreshCw
} from "lucide-react";
import { WorkflowNode, WorkflowConnection, Workflow as WorkflowType, WorkflowCanvasProps } from "@/types/workflow";

interface NodeTemplate {
  id: string;
  name: string;
  category: "ai" | "core" | "integration" | "flow" | "human";
  description: string;
  icon: any;
  color: string;
}

export function WorkflowCanvas({ 
  workflow, 
  onWorkflowChange, 
  onExecute, 
  isExecuting 
}: WorkflowCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(false);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Node templates for the library
  const nodeTemplates: NodeTemplate[] = [
    {
      id: "ai-agent",
      name: "AI Agent",
      category: "ai",
      description: "Autonomous AI agent with reasoning capabilities",
      icon: Brain,
      color: "bg-purple-500"
    },
    {
      id: "llm-chain",
      name: "LLM Chain",
      category: "ai",
      description: "Chain multiple LLM prompts",
      icon: GitBranch,
      color: "bg-blue-500"
    },
    {
      id: "text-analyzer",
      name: "Text Analyzer",
      category: "ai",
      description: "Analyze text for sentiment, entities, etc.",
      icon: FileText,
      color: "bg-green-500"
    },
    {
      id: "http-request",
      name: "HTTP Request",
      category: "core",
      description: "Make HTTP requests to external APIs",
      icon: Zap,
      color: "bg-orange-500"
    },
    {
      id: "webhook",
      name: "Webhook",
      category: "core",
      description: "Receive data from external systems",
      icon: Activity,
      color: "bg-red-500"
    }
  ];

  const getNodeIcon = (node: WorkflowNode) => {
    switch (node.category) {
      case "ai":
        return <Brain className="h-4 w-4" />;
      case "core":
        return <Zap className="h-4 w-4" />;
      case "integration":
        return <Database className="h-4 w-4" />;
      case "flow":
        return <GitBranch className="h-4 w-4" />;
      default:
        return <Workflow className="h-4 w-4" />;
    }
  };

  const getNodeColor = (node: WorkflowNode) => {
    switch (node.status) {
      case "running":
        return "border-blue-500 bg-blue-50";
      case "success":
        return "border-green-500 bg-green-50";
      case "error":
        return "border-red-500 bg-red-50";
      case "waiting":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const handleAddNode = (template: NodeTemplate) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: template.category === "ai" ? "ai" : "action",
      category: template.category,
      name: template.name,
      description: template.description,
      config: {},
      position: { x: 300, y: 200 },
      connections: { input: [], output: [] },
      status: "idle"
    };

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
      updated_at: new Date().toISOString()
    };

    onWorkflowChange(updatedWorkflow);
    setIsNodeLibraryOpen(false);
  };

  const handleNodeSelect = (node: WorkflowNode) => {
    setSelectedNode(node);
  };

  const handleNodeUpdate = (updatedNode: WorkflowNode) => {
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      ),
      updated_at: new Date().toISOString()
    };

    onWorkflowChange(updatedWorkflow);
    setSelectedNode(updatedNode);
  };

  const handleNodeDelete = (nodeId: string) => {
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter(node => node.id !== nodeId),
      connections: workflow.connections.filter(conn => 
        conn.from !== nodeId && conn.to !== nodeId
      ),
      updated_at: new Date().toISOString()
    };

    onWorkflowChange(updatedWorkflow);
    setSelectedNode(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasPosition.x, y: e.clientY - canvasPosition.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-screen flex">
      {/* Canvas Area */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
          <Button
            onClick={() => setIsNodeLibraryOpen(true)}
            className="bg-white shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
          <Button
            onClick={onExecute}
            disabled={isExecuting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isExecuting ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="w-full h-full cursor-move"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          <div
            className="relative"
            style={{
              transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
              width: '2000px',
              height: '2000px'
            }}
          >
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Render Nodes */}
            {workflow.nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute cursor-pointer transition-all duration-200 ${getNodeColor(node)}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: '200px'
                }}
                onClick={() => handleNodeSelect(node)}
              >
                <Card className={`${selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getNodeIcon(node)}
                        <CardTitle className="text-sm">{node.name}</CardTitle>
                      </div>
                      <Badge 
                        variant={node.status === "idle" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {node.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {node.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Render Connections */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '2000px', height: '2000px' }}>
              {workflow.connections.map((connection) => {
                const fromNode = workflow.nodes.find(n => n.id === connection.from);
                const toNode = workflow.nodes.find(n => n.id === connection.to);
                
                if (!fromNode || !toNode) return null;

                const fromX = fromNode.position.x + 200;
                const fromY = fromNode.position.y + 40;
                const toX = toNode.position.x;
                const toY = toNode.position.y + 40;

                return (
                  <line
                    key={connection.id}
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              
              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Node Properties</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNodeDelete(selectedNode.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="node-name">Name</Label>
                <Input
                  id="node-name"
                  value={selectedNode.name}
                  onChange={(e) => handleNodeUpdate({
                    ...selectedNode,
                    name: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="node-description">Description</Label>
                <Textarea
                  id="node-description"
                  value={selectedNode.description}
                  onChange={(e) => handleNodeUpdate({
                    ...selectedNode,
                    description: e.target.value
                  })}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Badge variant="secondary">{selectedNode.category}</Badge>
              </div>

              <div>
                <Label>Status</Label>
                <Badge 
                  variant={selectedNode.status === "idle" ? "secondary" : "default"}
                >
                  {selectedNode.status}
                </Badge>
              </div>

              {/* Node-specific configuration */}
              {selectedNode.category === "ai" && (
                <div className="space-y-3 pt-3 border-t">
                  <h4 className="font-medium">AI Configuration</h4>
                  
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Select
                      value={selectedNode.config.model || "phi"}
                      onValueChange={(value) => handleNodeUpdate({
                        ...selectedNode,
                        config: { ...selectedNode.config, model: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phi">phi</SelectItem>
                        <SelectItem value="llama-2">llama-2</SelectItem>
                        <SelectItem value="gpt-4">gpt-4</SelectItem>
                        <SelectItem value="claude-3">claude-3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedNode.config.temperature || 0.7}
                      onChange={(e) => handleNodeUpdate({
                        ...selectedNode,
                        config: { 
                          ...selectedNode.config, 
                          temperature: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      value={selectedNode.config.system_prompt || ""}
                      onChange={(e) => handleNodeUpdate({
                        ...selectedNode,
                        config: { 
                          ...selectedNode.config, 
                          system_prompt: e.target.value 
                        }
                      })}
                      placeholder="Enter system prompt..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Node Library Dialog */}
      <Dialog open={isNodeLibraryOpen} onOpenChange={setIsNodeLibraryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Node</DialogTitle>
            <DialogDescription>
              Choose a node type to add to your workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {nodeTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleAddNode(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${template.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 