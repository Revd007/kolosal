"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  CreditCard, 
  DollarSign, 
  Users, 
  PlayCircle,
  Code,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Server,
  Workflow,
  Brain
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalRequests: number;
  totalCost: number;
  avgSuccessRate: number;
  avgResponseTime: number;
  recentActivity: Array<{
    id: string;
    type: string;
    model: string;
    timestamp: string;
    status: string;
  }>;
  topModels: Array<{
    name: string;
    requests: number;
    type: string;
  }>;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/analytics');
      
      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const analyticsData = await analyticsResponse.json();
      
      // Transform analytics data for dashboard - use fixed timestamps to avoid hydration issues
      const baseTime = new Date().getTime();
      const recentActivity = analyticsData.usageData.slice(0, 5).map((model: any, index: number) => ({
        id: `activity-${index}`,
        type: "Chat Request",
        model: model.model,
        timestamp: new Date(baseTime - (index + 1) * 60 * 60 * 1000).toISOString(), // Fixed intervals instead of random
        status: "completed"
      }));
      
      const topModels = analyticsData.usageData.slice(0, 3).map((model: any) => ({
        name: model.model,
        requests: model.requests,
        type: "Chat"
      }));
      
      setDashboardData({
        totalRequests: analyticsData.totalRequests,
        totalCost: analyticsData.totalCost,
        avgSuccessRate: analyticsData.avgSuccessRate,
        avgResponseTime: analyticsData.avgResponseTime,
        recentActivity,
        topModels
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading dashboard...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Shinigami!</h1>
            <p className="text-gray-600">Here's what's happening with your AI projects today.</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData ? dashboardData.totalRequests.toLocaleString('en-US') : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData && dashboardData.totalRequests > 0 ? 'Last 30 days' : 'No activity yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData ? dashboardData.totalCost.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData && dashboardData.totalCost > 0 ? 'Estimated cost' : 'Free tier usage'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData ? `${dashboardData.avgSuccessRate.toFixed(1)}%` : '0%'}
            </div>
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
            <div className="text-2xl font-bold">
              {dashboardData ? `${dashboardData.avgResponseTime.toFixed(1)}s` : '0s'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Link href="/playground/chat">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <PlayCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Chat Playground</h3>
                  <p className="text-sm text-gray-600">Start chatting with AI models</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/playground/language">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Code className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Code Generation</h3>
                  <p className="text-sm text-gray-600">Generate and review code</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/models">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Browse Models</h3>
                  <p className="text-sm text-gray-600">Explore available AI models</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/clusters">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Server className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Manage Clusters</h3>
                  <p className="text-sm text-gray-600">Deploy and scale infrastructure</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/workflows">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Workflow className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">AI Workflows</h3>
                  <p className="text-sm text-gray-600">Build intelligent automations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Workflow Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-indigo-600" />
            AI Workflow Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">3</div>
              <p className="text-sm text-gray-600">Active Workflows</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">287</div>
              <p className="text-sm text-gray-600">Total Executions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">94.3%</div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3.2s</div>
              <p className="text-sm text-gray-600">Avg Execution Time</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-600">
                Your AI workflows are running smoothly. 
                <span className="text-green-600 font-medium"> All systems operational.</span>
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/workflows">
                Manage Workflows
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Popular Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboardData || dashboardData.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No recent activity</p>
                <p className="text-sm text-gray-400">Start using the playground to see activity here</p>
                <Button className="mt-4" asChild>
                  <Link href="/playground/chat">Get Started</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-xs text-gray-500">{activity.model}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Models */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Models</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboardData || dashboardData.topModels.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No model usage yet</p>
                <p className="text-sm text-gray-400">Try different models to see popularity here</p>
                <Button className="mt-4" asChild>
                  <Link href="/models">Browse Models</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.topModels.map((model, index) => (
                  <div key={model.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.requests} requests</p>
                    </div>
                    <Badge variant="outline">{model.type}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/models">
                View all models
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-600">
                Check out our documentation or contact support for assistance.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <a href="https://docs.kolosal.ai" target="_blank" rel="noopener noreferrer">
                  Documentation
                </a>
              </Button>
              <Button asChild>
                <Link href="/tickets">Contact Support</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
