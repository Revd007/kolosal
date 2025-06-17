"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const faqItems = [
  {
    question: "How do I get started with Kolosal AI?",
    answer: "Simply sign up for an account, choose your plan, and start using our playground to interact with AI models. Check out our documentation for detailed guides."
  },
  {
    question: "What models are available?",
    answer: "We support various models including Llama 2, Mistral, CodeLlama, and more through our Ollama integration. You can see all available models in the Models page."
  },
  {
    question: "How is billing calculated?",
    answer: "Billing is based on your subscription plan and API usage. You can monitor your usage in real-time through the Analytics dashboard."
  },
  {
    question: "Can I fine-tune models?",
    answer: "Yes! We offer fine-tuning capabilities for supported models. Visit the Fine-tuning page to create and manage your custom models."
  }
];

const supportTickets = [
  {
    id: "TKT-001",
    subject: "API Rate Limiting Issue",
    status: "open",
    priority: "high",
    created: "2024-01-16T10:30:00Z",
    lastUpdate: "2024-01-16T14:22:00Z"
  },
  {
    id: "TKT-002",
    subject: "Model Performance Question",
    status: "resolved",
    priority: "medium",
    created: "2024-01-15T08:15:00Z",
    lastUpdate: "2024-01-15T16:45:00Z"
  }
];

export default function TicketsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-700";
      case "resolved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600">Get help, find answers, and contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Create Support Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Book className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Schedule Call
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-600">support@kolosal.ai</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-sm text-gray-600">Usually within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-600 text-sm">{item.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {supportTickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No support tickets yet</p>
                  <Button className="mt-4">Create Your First Ticket</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                            <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                              {ticket.status === "open" && <AlertCircle className="h-3 w-3 mr-1" />}
                              {ticket.status === "resolved" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {ticket.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Ticket ID: {ticket.id}</p>
                            <p>Created: {new Date(ticket.created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</p>
                            <p>Last Update: {new Date(ticket.lastUpdate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                />
              </div>
              <Button className="w-full">Submit Ticket</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 