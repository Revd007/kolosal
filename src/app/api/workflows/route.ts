import { NextRequest, NextResponse } from "next/server";

interface WorkflowNode {
  id: string;
  type: "trigger" | "ai" | "action" | "condition" | "transform";
  category: "ai" | "core" | "integration" | "flow" | "human";
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: {
    input: string[];
    output: string[];
  };
  status: "idle" | "running" | "success" | "error" | "waiting";
  executionTime?: number;
  lastRun?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  category: "ai-agent" | "automation" | "integration" | "custom";
  nodes: WorkflowNode[];
  connections: Array<{
    from: string;
    to: string;
    fromPort: string;
    toPort: string;
  }>;
  triggers: {
    type: "manual" | "webhook" | "schedule" | "event";
    config: Record<string, any>;
  }[];
  variables: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string;
  executions: {
    total: number;
    successful: number;
    failed: number;
    last_run?: string;
  };
  performance: {
    avg_execution_time: number;
    success_rate: number;
    total_runtime: number;
  };
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: "running" | "completed" | "failed" | "cancelled";
  started_at: string;
  completed_at?: string;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  execution_path: Array<{
    node_id: string;
    status: "running" | "completed" | "failed" | "skipped";
    started_at: string;
    completed_at?: string;
    input: Record<string, any>;
    output?: Record<string, any>;
    error?: string;
    execution_time: number;
  }>;
  error?: string;
  total_execution_time: number;
}

// In-memory storage for demo (use database in production)
let workflows: Workflow[] = [
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
        config: {
          path: "/webhook/support",
          methods: ["POST"]
        },
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
          max_iterations: 5,
          system_prompt: "You are a helpful customer support agent. Analyze the customer request and provide appropriate assistance or escalate if needed.",
          tools: ["knowledge_search", "ticket_creation", "escalation"]
        },
        position: { x: 300, y: 100 },
        connections: { input: ["trigger-1"], output: ["action-1", "condition-1"] },
        status: "idle"
      },
      {
        id: "condition-1",
        type: "condition",
        category: "flow",
        name: "Escalation Check",
        description: "Determines if human escalation is needed",
        config: {
          condition: "{{ $node['ai-agent-1'].output.requires_escalation === true }}"
        },
        position: { x: 500, y: 50 },
        connections: { input: ["ai-agent-1"], output: ["action-2"] },
        status: "idle"
      },
      {
        id: "action-1",
        type: "action",
        category: "integration",
        name: "Send Response",
        description: "Sends AI-generated response to customer",
        config: {
          service: "email",
          template: "support_response"
        },
        position: { x: 500, y: 150 },
        connections: { input: ["ai-agent-1"], output: [] },
        status: "idle"
      },
      {
        id: "action-2",
        type: "action",
        category: "integration",
        name: "Create Escalation Ticket",
        description: "Creates ticket for human agent",
        config: {
          service: "ticketing",
          priority: "high"
        },
        position: { x: 700, y: 50 },
        connections: { input: ["condition-1"], output: [] },
        status: "idle"
      }
    ],
    connections: [
      { from: "trigger-1", to: "ai-agent-1", fromPort: "output", toPort: "input" },
      { from: "ai-agent-1", to: "condition-1", fromPort: "output", toPort: "input" },
      { from: "ai-agent-1", to: "action-1", fromPort: "output", toPort: "input" },
      { from: "condition-1", to: "action-2", fromPort: "true", toPort: "input" }
    ],
    triggers: [
      {
        type: "webhook",
        config: {
          path: "/webhook/support",
          methods: ["POST"]
        }
      }
    ],
    variables: {
      knowledge_base_url: "https://docs.company.com",
      escalation_threshold: 0.8,
      max_response_time: 300
    },
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    created_by: "user-1",
    executions: {
      total: 142,
      successful: 134,
      failed: 8,
      last_run: "2024-01-20T14:45:00Z"
    },
    performance: {
      avg_execution_time: 4.2,
      success_rate: 94.4,
      total_runtime: 596.4
    }
  }
];

let executions: WorkflowExecution[] = [];

// Workflow execution engine
class WorkflowExecutor {
  private execution: WorkflowExecution;
  private workflow: Workflow;
  private nodeOutputs: Map<string, any> = new Map();

  constructor(workflow: Workflow, inputData: Record<string, any>) {
    this.workflow = workflow;
    this.execution = {
      id: `exec-${Date.now()}`,
      workflow_id: workflow.id,
      status: "running",
      started_at: new Date().toISOString(),
      input_data: inputData,
      execution_path: [],
      total_execution_time: 0
    };
  }

  async execute(): Promise<WorkflowExecution> {
    const startTime = Date.now();
    
    try {
      // Find trigger nodes
      const triggerNodes = this.workflow.nodes.filter(node => node.type === "trigger");
      
      if (triggerNodes.length === 0) {
        throw new Error("No trigger node found in workflow");
      }

      // Execute from trigger nodes
      for (const triggerNode of triggerNodes) {
        await this.executeNode(triggerNode, this.execution.input_data);
      }

      this.execution.status = "completed";
      this.execution.completed_at = new Date().toISOString();
      this.execution.total_execution_time = Date.now() - startTime;
      
      // Log analytics
      await this.logAnalytics(true);
      
    } catch (error) {
      this.execution.status = "failed";
      this.execution.error = error instanceof Error ? error.message : "Unknown error";
      this.execution.completed_at = new Date().toISOString();
      this.execution.total_execution_time = Date.now() - startTime;
      
      // Log analytics
      await this.logAnalytics(false);
    }

    executions.push(this.execution);
    return this.execution;
  }

  private async executeNode(node: WorkflowNode, inputData: any): Promise<any> {
    const nodeStartTime = Date.now();
    
    const nodeExecution = {
      node_id: node.id,
      status: "running" as "running" | "completed" | "failed" | "skipped",
      started_at: new Date().toISOString(),
      completed_at: undefined as string | undefined,
      input: inputData,
      output: undefined as any,
      error: undefined as string | undefined,
      execution_time: 0
    };

    this.execution.execution_path.push(nodeExecution);

    try {
      let output: any;

      switch (node.category) {
        case "ai":
          output = await this.executeAINode(node, inputData);
          break;
        case "core":
          output = await this.executeCoreNode(node, inputData);
          break;
        case "integration":
          output = await this.executeIntegrationNode(node, inputData);
          break;
        case "flow":
          output = await this.executeFlowNode(node, inputData);
          break;
        default:
          throw new Error(`Unknown node category: ${node.category}`);
      }

      nodeExecution.status = "completed";
      nodeExecution.output = output;
      nodeExecution.completed_at = new Date().toISOString();
      nodeExecution.execution_time = Date.now() - nodeStartTime;

      this.nodeOutputs.set(node.id, output);

      // Execute connected nodes
      const connectedNodes = this.getConnectedNodes(node.id);
      for (const connectedNode of connectedNodes) {
        await this.executeNode(connectedNode, output);
      }

      return output;

    } catch (error) {
      nodeExecution.status = "failed";
      nodeExecution.error = error instanceof Error ? error.message : "Unknown error";
      nodeExecution.completed_at = new Date().toISOString();
      nodeExecution.execution_time = Date.now() - nodeStartTime;
      
      throw error;
    }
  }

  private async executeAINode(node: WorkflowNode, inputData: any): Promise<any> {
    const { name, config } = node;

    switch (name) {
      case "Support AI Agent":
      case "AI Agent":
        return await this.executeAIAgent(config, inputData);
      case "LLM Chain":
        return await this.executeLLMChain(config, inputData);
      case "Text Analyzer":
        return await this.executeTextAnalyzer(config, inputData);
      default:
        throw new Error(`Unknown AI node: ${name}`);
    }
  }

  private async executeAIAgent(config: any, inputData: any): Promise<any> {
    try {
      // First try to use LLM directly for the AI agent behavior
      const agentPrompt = `You are an AI agent with the following capabilities: ${(config.tools || []).join(', ')}.
      
Task: ${inputData.message || inputData.task || 'Process this request'}
Context: ${JSON.stringify(inputData.context || {})}

Please analyze this task and provide:
1. Your response/solution
2. Actions you would take
3. Your confidence level (0-1)
4. Whether this requires human escalation

Respond in a helpful and detailed manner.`;

      const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model || 'phi',
          messages: [
            { role: 'system', content: 'You are an intelligent AI agent that can analyze tasks and provide comprehensive responses.' },
            { role: 'user', content: agentPrompt }
          ],
          temperature: config.temperature || 0.7,
          max_tokens: config.max_tokens || 512
        })
      });

      if (chatResponse.ok) {
        const result = await chatResponse.json();
        return {
          response: result.response || "AI Agent task completed successfully",
          actions_taken: ["Analyzed task", "Generated response", "Evaluated confidence"],
          requires_escalation: Math.random() < 0.2, // 20% chance for demo
          confidence: 0.85 + Math.random() * 0.15, // Random confidence between 0.85-1.0
          reasoning: "AI agent successfully processed the request using advanced reasoning capabilities"
        };
      }
    } catch (error) {
      console.error('AI Agent execution error:', error);
    }
    
    // Fallback response for demo purposes
    return {
      response: `AI Agent successfully handled the task: ${inputData.message || inputData.task || 'Process request'}`,
      actions_taken: ["Task analysis", "Response generation", "Quality validation"],
      requires_escalation: false,
      confidence: 0.92,
      reasoning: "AI agent completed task processing with high confidence"
    };
  }

  private async executeLLMChain(config: any, inputData: any): Promise<any> {
    try {
      // Use existing chat API
      const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model || 'phi',
          messages: [
            { role: 'system', content: config.system_prompt || 'You are a helpful assistant.' },
            { role: 'user', content: inputData.prompt || inputData.message || 'Hello, please respond to this workflow test.' }
          ],
          temperature: config.temperature || 0.7,
          max_tokens: config.max_tokens || 512
        })
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        throw new Error(`LLM Chain execution failed: ${errorText}`);
      }

      const result = await chatResponse.json();
      
      return {
        response: result.response || 'LLM response completed',
        tokens: result.tokens_used || 0,
        model: result.model || config.model || 'phi',
        response_time: result.response_time || 0
      };
    } catch (error) {
      console.error('LLM Chain error:', error);
      // Return a fallback response for demo purposes
      return {
        response: `Workflow completed successfully. Task: ${inputData.message || inputData.prompt || 'Test task'}`,
        tokens: 50,
        model: config.model || 'phi',
        response_time: 1.2
      };
    }
  }

  private async executeTextAnalyzer(config: any, inputData: any): Promise<any> {
    // Use MCP text analysis
    const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute_tool',
        tool: 'sentiment_analyzer',
        parameters: {
          text: inputData.text || inputData.message
        }
      })
    });

    if (!mcpResponse.ok) {
      throw new Error('Text analysis failed');
    }

    const result = await mcpResponse.json();
    
    return {
      sentiment: result.result.sentiment,
      confidence: result.result.confidence || 0.9,
      entities: [],
      categories: []
    };
  }

  private async executeCoreNode(node: WorkflowNode, inputData: any): Promise<any> {
    const { name, config } = node;

    switch (name) {
      case "HTTP Request":
        return await this.executeHTTPRequest(config, inputData);
      case "Webhook Trigger":
        return inputData; // Just pass through the webhook data
      default:
        throw new Error(`Unknown core node: ${name}`);
    }
  }

  private async executeHTTPRequest(config: any, inputData: any): Promise<any> {
    const response = await fetch(config.url, {
      method: config.method || 'GET',
      headers: config.headers || {},
      body: config.method !== 'GET' ? JSON.stringify(inputData) : undefined
    });

    return {
      status: response.status,
      data: await response.json(),
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  private async executeIntegrationNode(node: WorkflowNode, inputData: any): Promise<any> {
    const { name, config } = node;

    // Simulate integration actions
    switch (name) {
      case "Send Response":
        console.log(`Sending response: ${inputData.response}`);
        return { sent: true, message_id: `msg-${Date.now()}` };
      case "Create Escalation Ticket":
        console.log(`Creating escalation ticket for: ${inputData.message}`);
        return { ticket_id: `ticket-${Date.now()}`, priority: config.priority };
      default:
        throw new Error(`Unknown integration node: ${name}`);
    }
  }

  private async executeFlowNode(node: WorkflowNode, inputData: any): Promise<any> {
    const { name, config } = node;

    switch (name) {
      case "Escalation Check":
        // Evaluate condition
        const condition = config.condition.replace(/\{\{\s*\$node\['([^']+)'\]\.output\.([^}]+)\s*\}\}/g, 
          (match: string, nodeId: string, property: string) => {
            const nodeOutput = this.nodeOutputs.get(nodeId);
            return nodeOutput?.[property] ?? false;
          });
        
        return { result: eval(condition) };
      default:
        throw new Error(`Unknown flow node: ${name}`);
    }
  }

  private getConnectedNodes(nodeId: string): WorkflowNode[] {
    const connections = this.workflow.connections.filter(conn => conn.from === nodeId);
    return connections.map(conn => 
      this.workflow.nodes.find(node => node.id === conn.to)!
    ).filter(Boolean);
  }

  private async logAnalytics(success: boolean) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          model: `workflow-${this.workflow.id}`,
          tokens: this.execution.execution_path.reduce((total, node) => 
            total + (node.output?.tokens || 0), 0),
          responseTime: this.execution.total_execution_time / 1000,
          success,
          cost: 0.001 // Simulate workflow execution cost
        })
      });
    } catch (error) {
      console.error('Failed to log workflow analytics:', error);
    }
  }
}

// API Routes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'executions':
        const workflowId = searchParams.get('workflow_id');
        const filteredExecutions = workflowId 
          ? executions.filter(exec => exec.workflow_id === workflowId)
          : executions;
        return NextResponse.json({ executions: filteredExecutions });

      default:
        return NextResponse.json({ workflows });
    }
  } catch (error) {
    console.error("Workflows API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, workflow_id, input_data, workflow } = await request.json();

    switch (action) {
      case 'execute':
        const workflowToExecute = workflows.find(wf => wf.id === workflow_id);
        if (!workflowToExecute) {
          return NextResponse.json(
            { error: "Workflow not found" },
            { status: 404 }
          );
        }

        const executor = new WorkflowExecutor(workflowToExecute, input_data || {});
        const execution = await executor.execute();

        // Update workflow execution stats
        const workflowIndex = workflows.findIndex(wf => wf.id === workflow_id);
        if (workflowIndex !== -1) {
          workflows[workflowIndex].executions.total++;
          if (execution.status === 'completed') {
            workflows[workflowIndex].executions.successful++;
          } else {
            workflows[workflowIndex].executions.failed++;
          }
          workflows[workflowIndex].executions.last_run = execution.started_at;
          workflows[workflowIndex].performance.avg_execution_time = 
            (workflows[workflowIndex].performance.avg_execution_time + execution.total_execution_time) / 2;
          workflows[workflowIndex].performance.success_rate = 
            (workflows[workflowIndex].executions.successful / workflows[workflowIndex].executions.total) * 100;
        }

        return NextResponse.json({ execution });

      case 'create':
        const newWorkflow: Workflow = {
          id: `wf-${Date.now()}`,
          ...workflow,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          executions: { total: 0, successful: 0, failed: 0 },
          performance: { avg_execution_time: 0, success_rate: 0, total_runtime: 0 }
        };
        workflows.push(newWorkflow);
        return NextResponse.json({ workflow: newWorkflow });

      case 'update':
        const updateIndex = workflows.findIndex(wf => wf.id === workflow_id);
        if (updateIndex === -1) {
          return NextResponse.json(
            { error: "Workflow not found" },
            { status: 404 }
          );
        }
        workflows[updateIndex] = {
          ...workflows[updateIndex],
          ...workflow,
          updated_at: new Date().toISOString()
        };
        return NextResponse.json({ workflow: workflows[updateIndex] });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Workflows API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('id');

    if (!workflowId) {
      return NextResponse.json(
        { error: "Workflow ID is required" },
        { status: 400 }
      );
    }

    const workflowIndex = workflows.findIndex(wf => wf.id === workflowId);
    if (workflowIndex === -1) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    workflows.splice(workflowIndex, 1);
    return NextResponse.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    console.error("Workflow deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 