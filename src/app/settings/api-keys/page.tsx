"use client";

import { useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Key, 
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  usage: number;
  permissions: string[];
  status: 'active' | 'inactive' | 'expired';
}

const mockApiKeys: ApiKey[] = [
  {
    id: "ak_1",
    name: "Production API Key",
    key: "sk-1234567890abcdef",
    created: "2024-01-15T10:30:00Z",
    lastUsed: "2024-01-20T14:22:00Z",
    usage: 15420,
    permissions: ["read", "write", "models"],
    status: "active"
  },
  {
    id: "ak_2", 
    name: "Development Testing",
    key: "sk-abcdef1234567890",
    created: "2024-01-10T08:15:00Z",
    lastUsed: "2024-01-19T09:45:00Z",
    usage: 3250,
    permissions: ["read", "models"],
    status: "active"
  },
  {
    id: "ak_3",
    name: "Staging Environment", 
    key: "sk-fedcba0987654321",
    created: "2024-01-05T16:00:00Z",
    lastUsed: "2024-01-10T12:30:00Z",
    usage: 890,
    permissions: ["read"],
    status: "inactive"
  }
];

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKeys, setCopiedKeys] = useState<{ [key: string]: boolean }>({});

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;

    // Use a more predictable ID generation to avoid hydration issues
    const timestamp = new Date().getTime();
    const newKey: ApiKey = {
      id: `ak_${timestamp}`,
      name: newKeyName,
      key: `sk-${timestamp.toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`,
      created: new Date().toISOString(),
      lastUsed: "Never",
      usage: 0,
      permissions: ["read", "write", "models"],
      status: "active"
    };

    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName("");
    setNewKeyDescription("");
    setShowCreateDialog(false);
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeys(prev => ({ ...prev, [keyId]: true }));
      setTimeout(() => {
        setCopiedKeys(prev => ({ ...prev, [keyId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  };

  const getStatusColor = (status: ApiKey['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: ApiKey['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys</h1>
          <p className="text-gray-600">Manage your API keys for accessing Kolosal AI services.</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to access Kolosal AI services. Keep your API keys secure and never share them publicly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyDescription">Description (Optional)</Label>
                <Textarea
                  id="keyDescription"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  placeholder="Describe what this key will be used for..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateApiKey} disabled={!newKeyName.trim()}>
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="mb-8 border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Security Best Practices</h3>
              <p className="text-sm text-amber-700 mt-1">
                Keep your API keys secure and never share them publicly. Use environment variables to store keys in your applications. 
                If you suspect a key has been compromised, delete it immediately and create a new one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
              <p className="text-gray-600 mb-4">
                You haven't created any API keys yet. Create your first key to start using the API.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                      <Badge variant="secondary" className={getStatusColor(apiKey.status)}>
                        {getStatusIcon(apiKey.status)}
                        <span className="ml-1 capitalize">{apiKey.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">API Key</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {visibleKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          >
                            <Copy className="h-4 w-4" />
                            {copiedKeys[apiKey.id] && <span className="ml-1">Copied!</span>}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Usage This Month</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Activity className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{apiKey.usage.toLocaleString('en-US')} requests</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Used</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {apiKey.lastUsed === "Never" 
                              ? "Never" 
                              : new Date(apiKey.lastUsed).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Created: {new Date(apiKey.created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                      <span>•</span>
                      <span>Permissions: {apiKey.permissions.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{apiKey.name}"? This action cannot be undone and will immediately revoke access for any applications using this key.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Key
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Usage Stats */}
      {apiKeys.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Usage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {apiKeys.reduce((sum, key) => sum + key.usage, 0).toLocaleString('en-US')}
                </div>
                <p className="text-sm text-gray-600">Total Requests This Month</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {apiKeys.filter(key => key.status === 'active').length}
                </div>
                <p className="text-sm text-gray-600">Active API Keys</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {apiKeys.filter(key => key.lastUsed !== "Never").length}
                </div>
                <p className="text-sm text-gray-600">Keys Used This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 