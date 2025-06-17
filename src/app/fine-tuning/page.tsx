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
  Plus, 
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Download,
  Eye,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings
} from "lucide-react";

interface FineTuningJob {
  id: string;
  model: string;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  finished_at?: string;
  training_file: string;
  validation_file?: string;
  hyperparameters: {
    n_epochs: number;
    batch_size: number;
    learning_rate: number;
  };
  result_files?: string[];
  trained_tokens?: number;
  error?: string;
}

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
}

export default function FineTuningPage() {
  const [jobs, setJobs] = useState<FineTuningJob[]>([]);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [selectedModel, setSelectedModel] = useState("");
  const [trainingFile, setTrainingFile] = useState("");
  const [validationFile, setValidationFile] = useState("");
  const [epochs, setEpochs] = useState(3);
  const [batchSize, setBatchSize] = useState(4);
  const [learningRate, setLearningRate] = useState(0.0001);

  const fetchJobs = async () => {
    try {
      setError(null);
      const response = await fetch('/api/fine-tuning');
      
      if (!response.ok) {
        throw new Error('Failed to fetch fine-tuning jobs');
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Jobs fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/chat');
      
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
        if (data.models && data.models.length > 0) {
          setSelectedModel(data.models[0].name);
        }
      }
    } catch (err) {
      console.error('Models fetch error:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchJobs(), fetchModels()]);
      setIsLoading(false);
    };

    loadData();
    
    // Refresh jobs every 10 seconds
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateJob = async () => {
    if (!selectedModel || !trainingFile) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/fine-tuning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          training_file: trainingFile,
          validation_file: validationFile || undefined,
          hyperparameters: {
            n_epochs: epochs,
            batch_size: batchSize,
            learning_rate: learningRate
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create fine-tuning job');
      }

      const newJob = await response.json();
      setJobs(prev => [newJob, ...prev]);
      setIsCreateDialogOpen(false);
      
      // Reset form
      setTrainingFile("");
      setValidationFile("");
      setEpochs(3);
      setBatchSize(4);
      setLearningRate(0.0001);
    } catch (err) {
      console.error('Job creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/fine-tuning?id=${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job');
      }

      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Job deletion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "running":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading fine-tuning jobs...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fine-tuning</h1>
            <p className="text-gray-600">Create custom models tailored to your specific use cases.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchJobs} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Fine-tuning Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Fine-tuning Job</DialogTitle>
                  <DialogDescription>
                    Configure your fine-tuning job with custom training data and hyperparameters.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Base Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Training File *</Label>
                    <Input
                      value={trainingFile}
                      onChange={(e) => setTrainingFile(e.target.value)}
                      placeholder="training_data.jsonl"
                    />
                    <p className="text-xs text-gray-500">
                      JSONL file with training examples
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Validation File (Optional)</Label>
                    <Input
                      value={validationFile}
                      onChange={(e) => setValidationFile(e.target.value)}
                      placeholder="validation_data.jsonl"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Epochs: {epochs}</Label>
                      <Input
                        type="range"
                        min="1"
                        max="10"
                        value={epochs}
                        onChange={(e) => setEpochs(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Batch Size: {batchSize}</Label>
                      <Input
                        type="range"
                        min="1"
                        max="16"
                        value={batchSize}
                        onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Learning Rate: {learningRate}</Label>
                      <Input
                        type="range"
                        min="0.00001"
                        max="0.001"
                        step="0.00001"
                        value={learningRate}
                        onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateJob}
                      disabled={!selectedModel || !trainingFile || isCreating}
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Fine-tuning
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

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Fine-tuning Jobs</h3>
            <p className="text-gray-600 mb-4">
              Create your first fine-tuning job to get started with custom models.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Fine-tuning Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <CardTitle className="text-lg">{job.id}</CardTitle>
                      <p className="text-sm text-gray-600">Base model: {job.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    {job.status !== "running" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Training Data</h4>
                    <p className="text-sm text-gray-600">{job.training_file}</p>
                    {job.validation_file && (
                      <p className="text-xs text-gray-500 mt-1">
                        Validation: {job.validation_file}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Hyperparameters</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Epochs: {job.hyperparameters.n_epochs}</p>
                      <p>Batch Size: {job.hyperparameters.batch_size}</p>
                      <p>Learning Rate: {job.hyperparameters.learning_rate}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Progress</h4>
                    <div className="text-sm text-gray-600">
                      {job.trained_tokens && (
                        <p>{job.trained_tokens.toLocaleString('en-US')} tokens trained</p>
                      )}
                      <p>Created: {new Date(job.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</p>
                      {job.finished_at && (
                        <p>Finished: {new Date(job.finished_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      {job.result_files && job.result_files.length > 0 && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Model
                        </Button>
                      )}
                      {job.status === "completed" && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Test Model
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {job.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2 text-red-700">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">{job.error}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Fine-tuning Guide</h3>
              <p className="text-gray-600 mb-4">
                Fine-tuning allows you to customize models for your specific use case. 
                Prepare your training data in JSONL format with input-output pairs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Data Format</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs">
{`{"input": "Question", "output": "Answer"}
{"input": "Another question", "output": "Another answer"}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Best Practices</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Use 100-1000 high-quality examples</li>
                    <li>• Keep examples consistent in format</li>
                    <li>• Start with lower learning rates</li>
                    <li>• Monitor validation loss</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 