"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Globe,
  Moon,
  Sun
} from "lucide-react";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [bio, setBio] = useState("AI enthusiast and developer working on cutting-edge applications with large language models.");
  const [location, setLocation] = useState("San Francisco, CA");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });

  const handleSaveProfile = () => {
    // In a real app, this would save to backend
    console.log("Saving profile:", {
      firstName,
      lastName,
      email,
      phone,
      bio,
      location,
      timezone,
      theme,
      notifications
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                <p className="text-sm text-gray-500">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Verified
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us about yourself..."
              />
              <p className="text-sm text-gray-500">
                {bio.length}/160 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Timezone */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Timezone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex items-center space-x-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <Button
                variant={notifications.email ? "default" : "outline"}
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
              >
                {notifications.email ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive push notifications in browser</p>
              </div>
              <Button
                variant={notifications.push ? "default" : "outline"}
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
              >
                {notifications.push ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Marketing Emails</h4>
                <p className="text-sm text-gray-600">Receive updates about new features and offers</p>
              </div>
              <Button
                variant={notifications.marketing ? "default" : "outline"}
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, marketing: !prev.marketing }))}
              >
                {notifications.marketing ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-gray-600">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Active Sessions</h4>
                <p className="text-sm text-gray-600">Manage devices logged into your account</p>
              </div>
              <Button variant="outline" size="sm">
                Manage Sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-gray-600">January 2024</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge className="mb-2 bg-green-100 text-green-700">Pro Plan</Badge>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-gray-600">$29/month</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <User className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="font-medium">Account Type</p>
                <p className="text-sm text-gray-600">Individual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 