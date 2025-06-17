"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Download,
  AlertTriangle,
  Check,
  Zap,
  Users,
  Infinity
} from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    features: [
      "1,000 requests/month",
      "Community support",
      "Basic models only",
      "Rate limited"
    ],
    current: false
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "month",
    features: [
      "50,000 requests/month",
      "Priority support", 
      "All models access",
      "Higher rate limits",
      "Usage analytics"
    ],
    current: true,
    popular: true
  },
  {
    id: "team",
    name: "Team",
    price: 99,
    period: "month",
    features: [
      "200,000 requests/month",
      "Team management",
      "Custom fine-tuning",
      "Dedicated support",
      "Advanced analytics",
      "API key management"
    ],
    current: false
  },
  {
    id: "enterprise",
    name: "Enterprise", 
    price: null,
    period: "month",
    features: [
      "Unlimited requests",
      "Custom deployment",
      "SLA guarantee",
      "On-premise options",
      "Custom integrations",
      "Dedicated account manager"
    ],
    current: false
  }
];

const invoices = [
  {
    id: "inv-001",
    date: "2024-01-01",
    amount: 29.00,
    status: "paid",
    plan: "Pro"
  },
  {
    id: "inv-002", 
    date: "2023-12-01",
    amount: 29.00,
    status: "paid",
    plan: "Pro"
  },
  {
    id: "inv-003",
    date: "2023-11-01", 
    amount: 29.00,
    status: "paid",
    plan: "Pro"
  }
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const currentUsage = {
    requests: 32450,
    limit: 50000,
    billing_cycle_start: "2024-01-01",
    billing_cycle_end: "2024-01-31",
    cost_this_month: 28.50,
    credits_remaining: 150.00
  };

  const usagePercentage = (currentUsage.requests / currentUsage.limit) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Usage</h1>
        <p className="text-gray-600">Manage your subscription, billing, and usage limits.</p>
      </div>

      {/* Current Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Zap className="mr-2 h-5 w-5 text-blue-600" />
              Current Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">API Requests</span>
                  <span className="text-sm text-gray-500">
                    {currentUsage.requests.toLocaleString('en-US')} / {currentUsage.limit.toLocaleString('en-US')}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {usagePercentage.toFixed(1)}% of monthly limit
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Billing cycle: {new Date(currentUsage.billing_cycle_start).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })} - {new Date(currentUsage.billing_cycle_end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              This Month's Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${currentUsage.cost_this_month}
            </div>
            <p className="text-sm text-gray-600">
              Based on current usage
            </p>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Plan: Pro</span>
                <span>$29.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Usage charges</span>
                <span>-$0.50</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="mr-2 h-5 w-5 text-purple-600" />
              Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${currentUsage.credits_remaining}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Available credits
            </p>
            <Button size="sm" variant="outline">
              Add Credits
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <p className="text-sm text-gray-600">Choose the plan that best fits your needs.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative rounded-lg border p-6 ${
                  plan.current 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                } ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-2 right-2 bg-green-500">
                    Current Plan
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    {plan.price === null ? (
                      <span className="text-2xl font-bold">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-gray-500">/{plan.period}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.current ? "secondary" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : plan.price === null ? "Contact Sales" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/2024</p>
              </div>
              <Badge variant="secondary">Default</Badge>
            </div>
            <div className="mt-4 space-y-2">
              <Button variant="outline" size="sm">
                Update Payment Method
              </Button>
              <Button variant="outline" size="sm">
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" defaultValue="San Francisco" />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" defaultValue="94102" />
                </div>
              </div>
              <Button>Update Billing Info</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Billing History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Invoice</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-3 px-4 font-mono text-sm">{invoice.id}</td>
                    <td className="py-3 px-4">
                      {new Date(invoice.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">{invoice.plan}</td>
                    <td className="py-3 px-4 font-medium">${invoice.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="secondary"
                        className={invoice.status === "paid" ? "bg-green-100 text-green-700" : ""}
                      >
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 