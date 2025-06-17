import { NextRequest, NextResponse } from "next/server";

interface ChatLog {
  timestamp: string;
  model: string;
  tokens: number;
  responseTime: number;
  success: boolean;
  cost: number;
}

// In a real app, this would come from a database
let chatLogs: ChatLog[] = [];

export async function GET() {
  try {
    // Calculate real-time analytics from chat logs
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter logs from last 30 days
    const recentLogs = chatLogs.filter(log => 
      new Date(log.timestamp) >= thirtyDaysAgo
    );

    // Calculate model usage
    const modelUsage = recentLogs.reduce((acc, log) => {
      if (!acc[log.model]) {
        acc[log.model] = {
          requests: 0,
          tokens: 0,
          cost: 0,
          responseTime: [],
          successCount: 0
        };
      }
      
      acc[log.model].requests++;
      acc[log.model].tokens += log.tokens;
      acc[log.model].cost += log.cost;
      acc[log.model].responseTime.push(log.responseTime);
      if (log.success) acc[log.model].successCount++;
      
      return acc;
    }, {} as Record<string, any>);

    // Format model usage data
    const usageData = Object.entries(modelUsage).map(([model, data]) => ({
      model,
      requests: data.requests,
      cost: data.cost,
      success: ((data.successCount / data.requests) * 100).toFixed(1),
      avgResponseTime: (data.responseTime.reduce((a: number, b: number) => a + b, 0) / data.responseTime.length).toFixed(2)
    }));

    // Calculate daily usage for the last 7 days
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayLogs = recentLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= dayStart && logDate <= dayEnd;
      });
      
      dailyUsage.push({
        date: dayStart.toISOString().split('T')[0],
        requests: dayLogs.length,
        cost: dayLogs.reduce((sum, log) => sum + log.cost, 0)
      });
    }

    // Calculate totals
    const totalRequests = recentLogs.length;
    const totalCost = recentLogs.reduce((sum, log) => sum + log.cost, 0);
    const avgSuccessRate = recentLogs.length > 0 
      ? ((recentLogs.filter(log => log.success).length / recentLogs.length) * 100).toFixed(1)
      : "0";
    const avgResponseTime = recentLogs.length > 0
      ? (recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length).toFixed(2)
      : "0";

    return NextResponse.json({
      totalRequests,
      totalCost,
      avgSuccessRate: parseFloat(avgSuccessRate),
      avgResponseTime: parseFloat(avgResponseTime),
      usageData,
      dailyUsage,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const logEntry: ChatLog = await request.json();
    
    // Add timestamp if not provided
    if (!logEntry.timestamp) {
      logEntry.timestamp = new Date().toISOString();
    }
    
    // Add to logs
    chatLogs.push(logEntry);
    
    // Keep only last 1000 logs to prevent memory issues
    if (chatLogs.length > 1000) {
      chatLogs = chatLogs.slice(-1000);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics logging error:", error);
    return NextResponse.json(
      { error: "Failed to log analytics data" },
      { status: 500 }
    );
  }
} 