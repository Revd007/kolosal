export interface WorkflowNode {
  id: string;
  type: "trigger" | "ai" | "action" | "condition" | "transform";
  category: "ai" | "core" | "integration" | "flow" | "human";
  name: string;
  description: string;
  icon?: any;
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

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  category: "ai-agent" | "automation" | "integration" | "custom";
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
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

export interface NodeTemplate {
  id: string;
  name: string;
  category: "ai" | "core" | "integration" | "flow" | "human";
  description: string;
  icon: any;
  color: string;
  inputs: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  config_schema: Record<string, any>;
}

export interface WorkflowCanvasProps {
  workflow: Workflow;
  onWorkflowChange: (workflow: Workflow) => void;
  onExecute: () => void;
  isExecuting: boolean;
} 