"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Settings, HelpCircle, LogOut, Zap } from "lucide-react";

export const Header = () => {
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">kolosal.ai</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-md"
            >
              Dashboard
            </Link>

            {/* Playgrounds Dropdown */}
            <DropdownMenu open={playgroundOpen} onOpenChange={setPlaygroundOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Playgrounds
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/playground/chat" className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    Chat
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/playground/language" className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                    Language
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/playground/image" className="flex items-center">
                    <div className="w-4 h-4 bg-pink-500 rounded mr-2"></div>
                    Image
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/playground/audio" className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    Audio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/playground/mcp" className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                    MCP Tools
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/models"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Models
            </Link>
            
            <Link
              href="/surprise"
              className="text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-2 rounded-md"
            >
              ✨ Surprise Me!
            </Link>
          </nav>

          {/* User Menu */}
          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.svg" alt="User" />
                  <AvatarFallback className="bg-blue-600 text-white">SR</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <div className="flex items-center justify-between space-y-1 p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.svg" alt="User" />
                    <AvatarFallback className="bg-blue-600 text-white">SR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shinigami Ryuken</p>
                    <p className="text-xs text-gray-500">shinigamiryuken007@gmail.com</p>
                  </div>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <div className="text-xs text-gray-500 mb-2">
                  Get more from the Kolosal API by upgrading from your plan
                </div>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  asChild
                >
                  <Link href="/settings/billing">
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Link>
                </Button>
              </div>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/fine-tuning">Fine-tuning</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics">Analytics</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a
                  href="https://docs.kolosal.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full"
                >
                  Docs
                </a>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tickets">Help Center</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}; 