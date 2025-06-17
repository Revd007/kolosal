"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  RefreshCw
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
              <Button variant="outline">Request Model</Button>
              <Button>Upload Model</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 