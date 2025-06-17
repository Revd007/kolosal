"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  Target,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface AnalyticsData {
  totalRequests: number;
  totalCost: number;
  avgSuccessRate: number;
  avgResponseTime: number;
  usageData: Array<{
    model: string;
    requests: number;
    cost: number;
    success: string;
    avgResponseTime: string;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    cost: number;
  }>;
  lastUpdated: string;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData || analyticsData.usageData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Monitor your API usage, costs, and performance metrics.</p>
            </div>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">
              Start using the chat playground to generate analytics data.
            </p>
            <Button asChild>
              <a href="/playground/chat">Go to Chat Playground</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Monitor your API usage, costs, and performance metrics.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Last updated: {new Date(analyticsData.lastUpdated).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalRequests.toLocaleString('en-US')}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated cost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgResponseTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Daily Usage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.dailyUsage.map((item, index) => (
                <div key={item.date} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.requests.toLocaleString('en-US')}</div>
                      <div className="text-xs text-gray-500">requests</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${item.cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">cost</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Model Usage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.usageData.map((model, index) => {
                const percentage = analyticsData.totalRequests > 0 
                  ? (model.requests / analyticsData.totalRequests * 100).toFixed(1)
                  : "0";
                const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500"];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={model.model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                        <span className="text-sm font-medium">{model.model}</span>
                      </div>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colorClass}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <p className="text-xs text-gray-500">{model.requests.toLocaleString('en-US')} requests</p>
                      <span>${model.cost.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Model</th>
                    <th className="text-left py-3 px-4 font-medium">Requests</th>
                    <th className="text-left py-3 px-4 font-medium">Success Rate</th>
                    <th className="text-left py-3 px-4 font-medium">Avg Response Time</th>
                    <th className="text-left py-3 px-4 font-medium">Cost</th>
                    <th className="text-left py-3 px-4 font-medium">Cost per Request</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.usageData.map((model, index) => (
                    <tr key={model.model} className="border-b">
                      <td className="py-3 px-4">
                        <div className="font-medium">{model.model}</div>
                      </td>
                      <td className="py-3 px-4">{model.requests.toLocaleString('en-US')}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={parseFloat(model.success) >= 98 ? "default" : "secondary"}
                          className={parseFloat(model.success) >= 98 ? "bg-green-100 text-green-700" : ""}
                        >
                          {model.success}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {model.avgResponseTime}s
                      </td>
                      <td className="py-3 px-4 font-medium">${model.cost.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        ${(model.cost / model.requests).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis */}
      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Rate by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.usageData.map((model, index) => {
                  const errorRate = (100 - parseFloat(model.success)).toFixed(1);
                  return (
                    <div key={model.model} className="flex items-center justify-between">
                      <span className="text-sm">{model.model}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{errorRate}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${Math.min(parseFloat(errorRate), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.usageData.map((model, index) => {
                  const costPerRequest = model.cost / model.requests;
                  const efficiency = costPerRequest < 0.001 ? "high" : costPerRequest < 0.01 ? "medium" : "low";
                  const colors = {
                    high: "bg-green-100 text-green-700",
                    medium: "bg-yellow-100 text-yellow-700", 
                    low: "bg-red-100 text-red-700"
                  };
                  return (
                    <div key={model.model} className="flex items-center justify-between">
                      <span className="text-sm">{model.model}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          ${costPerRequest.toFixed(4)}
                        </span>
                        <Badge variant="secondary" className={colors[efficiency]}>
                          {efficiency}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 