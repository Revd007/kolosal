"use client";

import { useState, useEffect } from "react";
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
  Search, 
  Filter,
  ExternalLink,
  Star,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Code,
  FileText,
  Music,
  Shield,
  AlertCircle,
  RefreshCw,
  Upload,
  Send,
  CheckCircle,
  X
} from "lucide-react";

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
}

interface ModelData {
  id: string;
  name: string;
  author: string;
  type: "chat" | "image" | "language" | "embedding" | "audio" | "moderation";
  pricing: string;
  description: string;
  huggingFaceUrl?: string;
  isFree: boolean;
  icon: any;
  color: string;
  isLocal?: boolean;
  size?: number;
  modified_at?: string;
}

const staticModels: ModelData[] = [
  {
    id: "meta-llama-2-70b-chat",
    name: "Llama-2-70b-chat-hf",
    author: "Meta",
    type: "chat",
    pricing: "$0.0007 / 1K tokens",
    description: "A 70 billion parameter language model fine-tuned for chat use cases.",
    huggingFaceUrl: "https://huggingface.co/meta-llama/Llama-2-70b-chat-hf",
    isFree: false,
    icon: MessageSquare,
    color: "green"
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    author: "Stability AI",
    type: "image",
    pricing: "$0.040 / image",
    description: "Advanced text-to-image generation with high-quality results.",
    huggingFaceUrl: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0",
    isFree: false,
    icon: ImageIcon,
    color: "pink"
  },
  {
    id: "wizardcoder-python-34b",
    name: "WizardCoder-Python-34B-V1.0",
    author: "WizardLM",
    type: "language",
    pricing: "$0.0008 / 1K tokens",
    description: "Specialized code generation model optimized for Python programming.",
    huggingFaceUrl: "https://huggingface.co/WizardLM/WizardCoder-Python-34B-V1.0",
    isFree: false,
    icon: Code,
    color: "purple"
  }
];

export default function ModelsPage() {
  const [models, setModels] = useState<ModelData[]>(staticModels);
  const [filteredModels, setFilteredModels] = useState<ModelData[]>(staticModels);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState<"online" | "offline" | "loading">("loading");
  
  // Modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Request form state
  const [requestForm, setRequestForm] = useState({
    modelName: "",
    modelType: "",
    description: "",
    useCase: "",
    priority: "medium",
    contactEmail: ""
  });
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    modelName: "",
    modelType: "",
    description: "",
    modelFile: null as File | null,
    configFile: null as File | null,
    isPublic: false
  });

  // Fetch Ollama models
  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/chat');
        const data = await response.json();
        
        if (response.ok && data.models && data.models.length > 0) {
          setOllamaStatus("online");
          
          // Convert Ollama models to our format
          const ollamaModels: ModelData[] = data.models.map((model: OllamaModel) => ({
            id: `ollama-${model.name}`,
            name: model.name,
            author: "Local (Ollama)",
            type: "chat" as const,
            pricing: "Free (Local)",
            description: `Local Ollama model - ${formatModelSize(model.size)}`,
            isFree: true,
            icon: MessageSquare,
            color: "blue",
            isLocal: true,
            size: model.size,
            modified_at: model.modified_at
          }));
          
          // Combine static and Ollama models
          const allModels = [...staticModels, ...ollamaModels];
          setModels(allModels);
          setFilteredModels(allModels);
        } else {
          setOllamaStatus("offline");
        }
      } catch (error) {
        console.error("Failed to fetch Ollama models:", error);
        setOllamaStatus("offline");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOllamaModels();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = models;

    // Apply type filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(model => model.type === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(query) ||
        model.author.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
      );
    }

    setFilteredModels(filtered);
  }, [models, selectedFilter, searchQuery]);

  const formatModelSize = (size: number) => {
    const gb = size / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

const typeFilters = [
  { type: "all", label: "All Models", count: models.length },
  { type: "chat", label: "Chat", count: models.filter(m => m.type === "chat").length },
  { type: "image", label: "Image", count: models.filter(m => m.type === "image").length },
  { type: "language", label: "Language", count: models.filter(m => m.type === "language").length },
];

  const handleFilterClick = (filterType: string) => {
    setSelectedFilter(filterType);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTryModel = (model: ModelData) => {
    if (model.isLocal) {
      // Redirect to chat playground with the model pre-selected
      window.location.href = `/playground/chat?model=${encodeURIComponent(model.name)}`;
    } else {
      // For non-local models, show a message or redirect to signup
      alert("This model requires a subscription. Please upgrade your plan to access it.");
    }
  };

  const handleRequestSubmit = async () => {
    if (!requestForm.modelName || !requestForm.description || !requestForm.contactEmail) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Model request submitted:", requestForm);
    setSubmitSuccess(true);
    
    setTimeout(() => {
      setIsRequestModalOpen(false);
      setSubmitSuccess(false);
      setRequestForm({
        modelName: "",
        modelType: "",
        description: "",
        useCase: "",
        priority: "medium",
        contactEmail: ""
      });
    }, 2000);
    
    setIsSubmitting(false);
  };
  
  const handleUploadSubmit = async () => {
    if (!uploadForm.modelName || !uploadForm.modelFile) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("Model upload submitted:", {
      ...uploadForm,
      modelFile: uploadForm.modelFile?.name,
      configFile: uploadForm.configFile?.name
    });
    setSubmitSuccess(true);
    
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setSubmitSuccess(false);
      setUploadForm({
        modelName: "",
        modelType: "",
        description: "",
        modelFile: null,
        configFile: null,
        isPublic: false
      });
    }, 2000);
    
    setIsSubmitting(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'model' | 'config') => {
    const file = event.target.files?.[0];
    if (file) {
      if (fileType === 'model') {
        setUploadForm(prev => ({ ...prev, modelFile: file }));
      } else {
        setUploadForm(prev => ({ ...prev, configFile: file }));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Models</h1>
        <p className="text-gray-600">Discover and use the latest AI models for your projects.</p>
          </div>
          <div className="flex items-center space-x-2">
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
              Ollama {ollamaStatus === "loading" ? "Connecting..." : ollamaStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search models..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {isLoading && (
            <Button variant="outline" disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
          </Button>
          )}
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {typeFilters.map((filter) => (
            <Button
              key={filter.type}
              variant={filter.type === selectedFilter ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => handleFilterClick(filter.type)}
            >
              {filter.label}
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
            <p className="text-gray-600">
              {searchQuery ? "Try adjusting your search terms" : "No models match the selected filter"}
            </p>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => {
          const IconComponent = model.icon;
          return (
            <Card key={model.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${model.color}-100 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`h-5 w-5 text-${model.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <p className="text-sm text-gray-500">{model.author}</p>
                    </div>
                  </div>
                    <div className="flex flex-col items-end space-y-1">
                  {model.isFree && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Free
                    </Badge>
                  )}
                      {model.isLocal && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Local
                        </Badge>
                      )}
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Pricing</p>
                    <p className="text-sm font-medium">{model.pricing}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {model.type}
                  </Badge>
                </div>

                  {model.size && model.modified_at && (
                    <div className="text-xs text-gray-500 mb-4">
                      Size: {formatModelSize(model.size)} • Modified: {new Date(model.modified_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}

                <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleTryModel(model)}
                      disabled={!model.isLocal && !model.isFree}
                    >
                    <Zap className="mr-2 h-4 w-4" />
                      {model.isLocal ? "Try Now" : "Try Now"}
                  </Button>
                    {model.huggingFaceUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={model.huggingFaceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Upload Model Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Don&apos;t see the model you need?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start justify-between">
            <div className="mb-4 sm:mb-0">
              <p className="text-gray-600 mb-2">
                Upload your own model or request a new one from our community.
              </p>
              <p className="text-sm text-gray-500">
                We support most popular model formats and architectures.
              </p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                <DialogTrigger asChild>
              <Button variant="outline">Request Model</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Request New Model</DialogTitle>
                    <DialogDescription>
                      Tell us about the model you'd like to see added to our platform.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
                      <p className="text-gray-600">We'll review your request and get back to you soon.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Model Name *</Label>
                          <Input
                            value={requestForm.modelName}
                            onChange={(e) => setRequestForm(prev => ({ ...prev, modelName: e.target.value }))}
                            placeholder="e.g. GPT-4, Claude-3, Llama-3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Model Type</Label>
                          <Select 
                            value={requestForm.modelType} 
                            onValueChange={(value) => setRequestForm(prev => ({ ...prev, modelType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chat">Chat</SelectItem>
                              <SelectItem value="image">Image Generation</SelectItem>
                              <SelectItem value="language">Language Model</SelectItem>
                              <SelectItem value="embedding">Embedding</SelectItem>
                              <SelectItem value="audio">Audio</SelectItem>
                              <SelectItem value="multimodal">Multimodal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={requestForm.description}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the model and its capabilities..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Use Case</Label>
                        <Textarea
                          value={requestForm.useCase}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, useCase: e.target.value }))}
                          placeholder="How do you plan to use this model?"
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select 
                            value={requestForm.priority} 
                            onValueChange={(value) => setRequestForm(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Email *</Label>
                          <Input
                            type="email"
                            value={requestForm.contactEmail}
                            onChange={(e) => setRequestForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsRequestModalOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleRequestSubmit}
                          disabled={!requestForm.modelName || !requestForm.description || !requestForm.contactEmail || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Request
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogTrigger asChild>
              <Button>Upload Model</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Custom Model</DialogTitle>
                    <DialogDescription>
                      Upload your own trained model to use on our platform.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
                      <p className="text-gray-600">Your model is being processed and will be available soon.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Model Name *</Label>
                          <Input
                            value={uploadForm.modelName}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, modelName: e.target.value }))}
                            placeholder="my-custom-model"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Model Type</Label>
                          <Select 
                            value={uploadForm.modelType} 
                            onValueChange={(value) => setUploadForm(prev => ({ ...prev, modelType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chat">Chat</SelectItem>
                              <SelectItem value="image">Image Generation</SelectItem>
                              <SelectItem value="language">Language Model</SelectItem>
                              <SelectItem value="embedding">Embedding</SelectItem>
                              <SelectItem value="audio">Audio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your model and its capabilities..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Model File * (.bin, .safetensors, .gguf)</Label>
                        <Input
                          type="file"
                          accept=".bin,.safetensors,.gguf,.pt,.pth"
                          onChange={(e) => handleFileChange(e, 'model')}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {uploadForm.modelFile && (
                          <p className="text-sm text-gray-600">
                            Selected: {uploadForm.modelFile.name} ({(uploadForm.modelFile.size / 1024 / 1024).toFixed(1)} MB)
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Config File (Optional) (.json, .yaml)</Label>
                        <Input
                          type="file"
                          accept=".json,.yaml,.yml"
                          onChange={(e) => handleFileChange(e, 'config')}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {uploadForm.configFile && (
                          <p className="text-sm text-gray-600">
                            Selected: {uploadForm.configFile.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={uploadForm.isPublic}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="isPublic">Make this model publicly available</Label>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Upload Guidelines:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• Maximum file size: 10GB</li>
                              <li>• Supported formats: .bin, .safetensors, .gguf, .pt, .pth</li>
                              <li>• Models will be scanned for security before deployment</li>
                              <li>• Processing time: 5-30 minutes depending on size</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsUploadModalOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUploadSubmit}
                          disabled={!uploadForm.modelName || !uploadForm.modelFile || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Model
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 