"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Settings,
  Monitor,
  Cpu,
  HardDrive,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Server,
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Database
} from "lucide-react";

interface Cluster {
  id: string;
  name: string;
  status: "running" | "stopped" | "pending" | "error";
  type: "compute" | "storage" | "inference" | "training";
  region: string;
  nodes: number;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  gpu_count: number;
  gpu_type: string;
  created_at: string;
  last_activity: string;
  cost_per_hour: number;
  uptime_hours: number;
  utilization: {
    cpu: number;
    memory: number;
    storage: number;
    gpu: number;
  };
  models_deployed: string[];
  endpoints: number;
  requests_per_minute: number;
}

interface ClusterMetrics {
  total_clusters: number;
  running_clusters: number;
  total_cost_today: number;
  total_requests: number;
  avg_utilization: number;
  active_endpoints: number;
}

export default function ClustersPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [metrics, setMetrics] = useState<ClusterMetrics | null>(null);
  const [filteredClusters, setFilteredClusters] = useState<Cluster[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for new cluster
  const [newCluster, setNewCluster] = useState({
    name: "",
    type: "inference",
    region: "us-west-2",
    nodes: 1,
    instance_type: "g4dn.xlarge",
    auto_scaling: true,
    max_nodes: 10,
    storage_gb: 100
  });

  // Mock data - in production, this would come from your API
  const mockClusters: Cluster[] = [
    {
      id: "cluster-1",
      name: "Production Inference",
      status: "running",
      type: "inference",
      region: "us-west-2",
      nodes: 3,
      cpu_cores: 24,
      memory_gb: 96,
      storage_gb: 500,
      gpu_count: 3,
      gpu_type: "NVIDIA A100",
      created_at: "2024-01-15T10:30:00Z",
      last_activity: "2024-01-20T14:45:00Z",
      cost_per_hour: 15.50,
      uptime_hours: 120,
      utilization: {
        cpu: 75,
        memory: 68,
        storage: 45,
        gpu: 82
      },
      models_deployed: ["llama-2-70b", "gpt-3.5-turbo", "claude-instant"],
      endpoints: 5,
      requests_per_minute: 1250
    },
    {
      id: "cluster-2",
      name: "Development Cluster",
      status: "running",
      type: "compute",
      region: "us-east-1",
      nodes: 2,
      cpu_cores: 16,
      memory_gb: 64,
      storage_gb: 200,
      gpu_count: 2,
      gpu_type: "NVIDIA V100",
      created_at: "2024-01-18T09:15:00Z",
      last_activity: "2024-01-20T13:20:00Z",
      cost_per_hour: 8.75,
      uptime_hours: 48,
      utilization: {
        cpu: 45,
        memory: 52,
        storage: 30,
        gpu: 38
      },
      models_deployed: ["phi-2", "mistral-7b"],
      endpoints: 2,
      requests_per_minute: 350
    },
    {
      id: "cluster-3",
      name: "Training Cluster",
      status: "stopped",
      type: "training",
      region: "us-west-1",
      nodes: 8,
      cpu_cores: 64,
      memory_gb: 512,
      storage_gb: 2000,
      gpu_count: 8,
      gpu_type: "NVIDIA H100",
      created_at: "2024-01-10T16:00:00Z",
      last_activity: "2024-01-19T22:30:00Z",
      cost_per_hour: 45.00,
      uptime_hours: 0,
      utilization: {
        cpu: 0,
        memory: 0,
        storage: 15,
        gpu: 0
      },
      models_deployed: [],
      endpoints: 0,
      requests_per_minute: 0
    },
    {
      id: "cluster-4",
      name: "Storage Cluster",
      status: "running",
      type: "storage",
      region: "eu-west-1",
      nodes: 4,
      cpu_cores: 32,
      memory_gb: 128,
      storage_gb: 5000,
      gpu_count: 0,
      gpu_type: "None",
      created_at: "2024-01-12T11:45:00Z",
      last_activity: "2024-01-20T15:10:00Z",
      cost_per_hour: 12.25,
      uptime_hours: 192,
      utilization: {
        cpu: 25,
        memory: 35,
        storage: 78,
        gpu: 0
      },
      models_deployed: [],
      endpoints: 0,
      requests_per_minute: 0
    }
  ];

  const mockMetrics: ClusterMetrics = {
    total_clusters: 4,
    running_clusters: 3,
    total_cost_today: 890.50,
    total_requests: 125000,
    avg_utilization: 58,
    active_endpoints: 7
  };

  const fetchClusters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setClusters(mockClusters);
      setMetrics(mockMetrics);
      setFilteredClusters(mockClusters);
    } catch (err) {
      console.error('Clusters fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchClusters, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = clusters;

    // Apply type filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "running") {
        filtered = filtered.filter(cluster => cluster.status === "running");
      } else if (selectedFilter === "stopped") {
        filtered = filtered.filter(cluster => cluster.status === "stopped");
      } else {
        filtered = filtered.filter(cluster => cluster.type === selectedFilter);
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cluster => 
        cluster.name.toLowerCase().includes(query) ||
        cluster.region.toLowerCase().includes(query) ||
        cluster.type.toLowerCase().includes(query)
      );
    }

    setFilteredClusters(filtered);
  }, [clusters, selectedFilter, searchQuery]);

  const handleCreateCluster = async () => {
    if (!newCluster.name.trim()) return;

    setIsCreating(true);
    try {
      // Simulate cluster creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const cluster: Cluster = {
        id: `cluster-${Date.now()}`,
        name: newCluster.name,
        status: "pending",
        type: newCluster.type as any,
        region: newCluster.region,
        nodes: newCluster.nodes,
        cpu_cores: newCluster.nodes * 8,
        memory_gb: newCluster.nodes * 32,
        storage_gb: newCluster.storage_gb,
        gpu_count: newCluster.type === "inference" || newCluster.type === "training" ? newCluster.nodes : 0,
        gpu_type: newCluster.type === "inference" ? "NVIDIA A100" : newCluster.type === "training" ? "NVIDIA H100" : "None",
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        cost_per_hour: newCluster.nodes * 5.25,
        uptime_hours: 0,
        utilization: {
          cpu: 0,
          memory: 0,
          storage: 0,
          gpu: 0
        },
        models_deployed: [],
        endpoints: 0,
        requests_per_minute: 0
      };

      setClusters(prev => [cluster, ...prev]);
      setIsCreateDialogOpen(false);
      
      // Reset form
      setNewCluster({
        name: "",
        type: "inference",
        region: "us-west-2",
        nodes: 1,
        instance_type: "g4dn.xlarge",
        auto_scaling: true,
        max_nodes: 10,
        storage_gb: 100
      });

      // Simulate cluster starting
      setTimeout(() => {
        setClusters(prev => prev.map(c => 
          c.id === cluster.id ? { ...c, status: "running" as const } : c
        ));
      }, 5000);
      
    } catch (err) {
      console.error('Cluster creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create cluster');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClusterAction = async (clusterId: string, action: "start" | "stop" | "delete") => {
    try {
      setClusters(prev => prev.map(cluster => {
        if (cluster.id === clusterId) {
          switch (action) {
            case "start":
              return { ...cluster, status: "pending" as const };
            case "stop":
              return { ...cluster, status: "stopped" as const };
            case "delete":
              return cluster; // Will be filtered out below
            default:
              return cluster;
          }
        }
        return cluster;
      }));

      if (action === "delete") {
        setClusters(prev => prev.filter(cluster => cluster.id !== clusterId));
      } else if (action === "start") {
        // Simulate startup delay
        setTimeout(() => {
          setClusters(prev => prev.map(cluster => 
            cluster.id === clusterId ? { ...cluster, status: "running" as const } : cluster
          ));
        }, 3000);
      }
    } catch (err) {
      console.error(`Cluster ${action} error:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} cluster`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "stopped":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-700";
      case "stopped":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inference":
        return <Zap className="h-4 w-4 text-blue-500" />;
      case "training":
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case "compute":
        return <Cpu className="h-4 w-4 text-green-500" />;
      case "storage":
        return <HardDrive className="h-4 w-4 text-orange-500" />;
      default:
        return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatUptime = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  if (isLoading && clusters.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading clusters...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clusters</h1>
            <p className="text-gray-600">Manage your compute clusters and infrastructure.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchClusters} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Cluster
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Cluster</DialogTitle>
                  <DialogDescription>
                    Configure your new compute cluster with the desired specifications.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cluster Name *</Label>
                      <Input
                        value={newCluster.name}
                        onChange={(e) => setNewCluster(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="my-inference-cluster"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cluster Type</Label>
                      <Select 
                        value={newCluster.type} 
                        onValueChange={(value) => setNewCluster(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[150px] overflow-y-auto">
                          <SelectItem value="inference">Inference</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="compute">Compute</SelectItem>
                          <SelectItem value="storage">Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Region</Label>
                      <Select 
                        value={newCluster.region} 
                        onValueChange={(value) => setNewCluster(prev => ({ ...prev, region: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[150px] overflow-y-auto">
                          <SelectItem value="us-west-2">US West 2 (Oregon)</SelectItem>
                          <SelectItem value="us-east-1">US East 1 (N. Virginia)</SelectItem>
                          <SelectItem value="us-west-1">US West 1 (N. California)</SelectItem>
                          <SelectItem value="eu-west-1">EU West 1 (Ireland)</SelectItem>
                          <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Instance Type</Label>
                      <Select 
                        value={newCluster.instance_type} 
                        onValueChange={(value) => setNewCluster(prev => ({ ...prev, instance_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[150px] overflow-y-auto">
                          <SelectItem value="g4dn.xlarge">g4dn.xlarge (4 vCPU, 16 GB, 1 GPU)</SelectItem>
                          <SelectItem value="g4dn.2xlarge">g4dn.2xlarge (8 vCPU, 32 GB, 1 GPU)</SelectItem>
                          <SelectItem value="g5.xlarge">g5.xlarge (4 vCPU, 16 GB, 1 GPU)</SelectItem>
                          <SelectItem value="p3.2xlarge">p3.2xlarge (8 vCPU, 61 GB, 1 GPU)</SelectItem>
                          <SelectItem value="p4d.24xlarge">p4d.24xlarge (96 vCPU, 1152 GB, 8 GPU)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Initial Nodes: {newCluster.nodes}</Label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={newCluster.nodes}
                        onChange={(e) => setNewCluster(prev => ({ ...prev, nodes: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Nodes: {newCluster.max_nodes}</Label>
                      <input
                        type="range"
                        min={newCluster.nodes}
                        max="100"
                        value={newCluster.max_nodes}
                        onChange={(e) => setNewCluster(prev => ({ ...prev, max_nodes: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Storage: {newCluster.storage_gb}GB</Label>
                      <input
                        type="range"
                        min="50"
                        max="5000"
                        step="50"
                        value={newCluster.storage_gb}
                        onChange={(e) => setNewCluster(prev => ({ ...prev, storage_gb: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoScaling"
                      checked={newCluster.auto_scaling}
                      onChange={(e) => setNewCluster(prev => ({ ...prev, auto_scaling: e.target.checked }))}
                    />
                    <Label htmlFor="autoScaling">Enable Auto-scaling</Label>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Cost Estimation</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(newCluster.nodes * 5.25)}
                        </div>
                        <div className="text-sm text-gray-600">per hour</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(newCluster.nodes * 5.25 * 24)}
                        </div>
                        <div className="text-sm text-gray-600">per day</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(newCluster.nodes * 5.25 * 24 * 30)}
                        </div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateCluster}
                      disabled={!newCluster.name.trim() || isCreating}
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Cluster
                        </>
                      )}
                    </Button>
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

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clusters</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_clusters}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.running_clusters} running
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.total_cost_today)}</div>
              <p className="text-xs text-muted-foreground">
                Today's spend
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_requests.toLocaleString('en-US')}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avg_utilization}%</div>
              <p className="text-xs text-muted-foreground">
                Across all clusters
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.active_endpoints}</div>
              <p className="text-xs text-muted-foreground">
                Serving models
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clusters..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { type: "all", label: "All Clusters" },
            { type: "running", label: "Running" },
            { type: "stopped", label: "Stopped" },
            { type: "inference", label: "Inference" },
            { type: "training", label: "Training" },
            { type: "compute", label: "Compute" },
            { type: "storage", label: "Storage" }
          ].map((filter) => (
            <Button
              key={filter.type}
              variant={filter.type === selectedFilter ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => setSelectedFilter(filter.type)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Clusters Table */}
      {filteredClusters.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clusters found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Create your first cluster to get started"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Cluster
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cluster Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Cost/Hour</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClusters.map((cluster) => (
                    <TableRow key={cluster.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cluster.name}</div>
                          <div className="text-sm text-gray-500">
                            {cluster.models_deployed.length > 0 
                              ? `${cluster.models_deployed.length} models deployed`
                              : 'No models deployed'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(cluster.status)}
                          <Badge variant="secondary" className={getStatusColor(cluster.status)}>
                            {cluster.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(cluster.type)}
                          <span className="capitalize">{cluster.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{cluster.region}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{cluster.nodes} nodes</div>
                          <div className="text-gray-500">
                            {cluster.cpu_cores} CPU, {cluster.memory_gb}GB RAM
                          </div>
                          {cluster.gpu_count > 0 && (
                            <div className="text-gray-500">
                              {cluster.gpu_count}x {cluster.gpu_type}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>CPU</span>
                            <span>{cluster.utilization.cpu}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${cluster.utilization.cpu}%` }}
                            ></div>
                          </div>
                          {cluster.gpu_count > 0 && (
                            <>
                              <div className="flex items-center justify-between text-xs">
                                <span>GPU</span>
                                <span>{cluster.utilization.gpu}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full"
                                  style={{ width: `${cluster.utilization.gpu}%` }}
                                ></div>
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(cluster.cost_per_hour)}</div>
                        <div className="text-sm text-gray-500">per hour</div>
                      </TableCell>
                      <TableCell>
                        <div>{formatUptime(cluster.uptime_hours)}</div>
                        <div className="text-sm text-gray-500">
                          {cluster.requests_per_minute > 0 
                            ? `${cluster.requests_per_minute} req/min`
                            : 'Idle'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {cluster.status === "running" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClusterAction(cluster.id, "stop")}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClusterAction(cluster.id, "start")}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClusterAction(cluster.id, "delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 