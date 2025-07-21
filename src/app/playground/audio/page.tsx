"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Play, 
  Pause,
  Download, 
  RefreshCw,
  Settings,
  Volume2,
  Clock,
  FileAudio,
  User,
  AlertCircle,
  CheckCircle,
  Mic,
  Zap,
  BookOpen,
  History,
  Save,
  Music,
  Headphones,
  Radio,
  FileText,
  Hash,
  BarChart3
} from "lucide-react";

interface Voice {
  id: string;
  name: string;
  gender: string;
  language: string;
  description: string;
}

interface AudioResult {
  audio_url: string;
  duration: number;
  format: string;
  voice: string;
  text: string;
  created_at: string;
  file_size: number;
}

export default function AudioPlayground() {
  const [text, setText] = useState("Hello! This is a sample text that will be converted to speech. You can replace this with any text you'd like to hear spoken aloud.");
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [format, setFormat] = useState("mp3");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [result, setResult] = useState<AudioResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState("custom");

  // New useful features
  const [showTextLibrary, setShowTextLibrary] = useState(false);
  const [showAudioHistory, setShowAudioHistory] = useState(false);
  const [showTextStats, setShowTextStats] = useState(false);
  const [savedTexts, setSavedTexts] = useState<string[]>([]);
  const [audioHistory, setAudioHistory] = useState<AudioResult[]>([]);

  const textLibrary = [
    { id: "welcome", name: "👋 Welcome Message", text: "Welcome to our AI-powered text-to-speech service! We're excited to help you create natural-sounding audio content.", category: "Business" },
    { id: "story", name: "📚 Story Opening", text: "Once upon a time, in a land far away, there lived a curious young inventor who dreamed of creating machines that could think and feel like humans.", category: "Creative" },
    { id: "news", name: "📰 News Report", text: "Breaking news: Scientists have made a groundbreaking discovery in artificial intelligence that could revolutionize how we interact with technology in our daily lives.", category: "News" },
    { id: "meditation", name: "🧘 Meditation Guide", text: "Take a deep breath in through your nose, hold it for a moment, and slowly exhale through your mouth. Feel your body relax as you release any tension.", category: "Wellness" },
    { id: "presentation", name: "🎤 Presentation", text: "Good morning everyone, and thank you for joining us today. I'm excited to share some innovative ideas that will transform how we approach this challenge.", category: "Business" },
    { id: "tutorial", name: "🎓 Tutorial", text: "In this step-by-step guide, we'll walk through the process of creating professional-quality audio content using advanced text-to-speech technology.", category: "Education" }
  ];

  const presets = [
    { id: "custom", name: "🎛️ Custom", description: "Manual settings" },
    { id: "natural", name: "🗣️ Natural", description: "Conversational speech", speed: 1.0, pitch: 1.0, voice: "alloy" },
    { id: "presentation", name: "🎤 Presentation", description: "Clear and professional", speed: 0.9, pitch: 1.1, voice: "nova" },
    { id: "storytelling", name: "📚 Storytelling", description: "Engaging narration", speed: 0.8, pitch: 0.9, voice: "shimmer" },
    { id: "fast-reading", name: "⚡ Fast Reading", description: "Quick information", speed: 1.3, pitch: 1.0, voice: "echo" },
    { id: "meditation", name: "🧘 Meditation", description: "Calm and soothing", speed: 0.7, pitch: 0.8, voice: "alloy" }
  ];

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset && preset.id !== "custom") {
      setSpeed(preset.speed || 1.0);
      setPitch(preset.pitch || 1.0);
      setSelectedVoice(preset.voice || "alloy");
    }
  };

  // Fetch available voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/audio');
        if (response.ok) {
          const data = await response.json();
          setVoices(data.voices || []);
        }
      } catch (error) {
        console.error('Failed to fetch voices:', error);
      }
    };

    fetchVoices();
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }

    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: selectedVoice,
          speed: speed,
          pitch: pitch,
          format: format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate audio');
      }

      const data = await response.json();
      setResult(data);
      
      // Save to audio history
      setAudioHistory(prev => [data, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Audio generation error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!result) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      // Create actual audio element with generated audio data
      const audio = new Audio(result.audio_url);
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        console.error('Audio playback error');
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      audio.onloadstart = () => {
        setIsPlaying(true);
      };

      setCurrentAudio(audio);
      audio.play().catch(error => {
        console.error('Audio play error:', error);
        setIsPlaying(false);
        setCurrentAudio(null);
      });
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const timestamp = new Date().getTime();
    // In a real implementation, this would download the actual audio file
    // For now, we'll create a text file with the audio metadata
    const content = `Audio Generation Result
    
Text: ${result.text}
Voice: ${result.voice}
Duration: ${result.duration} seconds
Format: ${result.format}
File Size: ${(result.file_size / 1024).toFixed(1)} KB
Generated: ${new Date(result.created_at).toLocaleString('en-US')}

Note: This is a simulated audio generation. In a real implementation, 
this would be an actual audio file.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-generation-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getVoiceIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'female':
        return <User className="h-4 w-4 text-pink-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  // New utility functions
  const handleTextSelect = (template: any) => {
    setText(template.text);
    setShowTextLibrary(false);
  };

  const saveCurrentText = () => {
    const textName = `Text ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    setSavedTexts(prev => [...prev, textName]);
  };

  const getTextStats = () => {
    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const estimatedDuration = Math.ceil(words / 150 * 60); // 150 words per minute
    return { words, characters, estimatedDuration };
  };

  const textStats = getTextStats();

  return (
    <div className="responsive-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Audio Playground</h1>
            <p className="text-gray-600 text-sm sm:text-base">Convert text to natural-sounding speech with advanced AI voices.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTextLibrary(!showTextLibrary)}
              className="w-full sm:w-auto"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Text Library
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAudioHistory(!showAudioHistory)}
              className="w-full sm:w-auto"
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTextStats(!showTextStats)}
              className="w-full sm:w-auto"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Stats
            </Button>
          </div>
        </div>

        {/* Text Statistics */}
        {showTextStats && (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Hash className="h-4 w-4" />
              <span>{textStats.words} words</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{textStats.characters} characters</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>~{textStats.estimatedDuration}s duration</span>
            </div>
          </div>
        )}
      </div>

      {/* Text Library */}
      {showTextLibrary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Text Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {textLibrary.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2 card-content-safe"
                  onClick={() => handleTextSelect(template)}
                >
                  <div className="font-medium text-wrap-anywhere">{template.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-3 text-wrap-anywhere">{template.text}</div>
                  <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio History */}
      {showAudioHistory && audioHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Recent Audio Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audioHistory.map((audio, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <Music className="h-4 w-4 text-blue-500" />
                      <Badge variant="outline" className="text-xs">{audio.voice}</Badge>
                      <Badge variant="outline" className="text-xs">{audio.format.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(audio.duration)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 cursor-pointer hover:text-blue-600 text-wrap-anywhere"
                     onClick={() => setText(audio.text)}>
                    {audio.text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Settings Panel */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Selection */}
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span>Voice</span>
                </Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center space-x-2">
                          {getVoiceIcon(voice.gender)}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-wrap-anywhere">{voice.name}</div>
                            <div className="text-xs text-gray-500 capitalize text-wrap-anywhere">
                              {voice.gender} • {voice.language}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVoiceData && (
                  <p className="text-xs text-gray-500 text-wrap-anywhere">{selectedVoiceData.description}</p>
                )}
              </div>

              {/* Quick Presets */}
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Quick Presets</span>
                </Label>
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div className="flex flex-col min-w-0">
                          <div className="font-medium text-wrap-anywhere">{preset.name}</div>
                          <div className="text-xs text-gray-500 text-wrap-anywhere">{preset.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label>Audio Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="ogg">OGG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speed Control */}
              <div className="space-y-2">
                <Label>Speed: {speed}x</Label>
                <Input
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.25"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.25x</span>
                  <span>4.0x</span>
                </div>
              </div>

              {/* Pitch Control */}
              <div className="space-y-2">
                <Label>Pitch: {pitch}x</Label>
                <Input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.5x</span>
                  <span>2.0x</span>
                </div>
              </div>

              {/* Voice Preview */}
              {selectedVoiceData && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {getVoiceIcon(selectedVoiceData.gender)}
                    <span className="font-medium text-wrap-anywhere">{selectedVoiceData.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Language: {selectedVoiceData.language}</p>
                    <p>Gender: {selectedVoiceData.gender}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <div className="xl:col-span-3">
          <div className="space-y-6">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileAudio className="mr-2 h-5 w-5" />
                  Text to Speech
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Text Quick Actions */}
                <div className="button-group-responsive mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setText("Welcome to our AI-powered text-to-speech playground! This is a great way to test how different voices sound.")}
                    className="responsive-text-sm"
                  >
                    📢 Welcome
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setText("In a world where technology meets creativity, artificial intelligence is transforming how we communicate and express ideas.")}
                    className="responsive-text-sm"
                  >
                    🎬 Dramatic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setText("Please take a moment to breathe deeply. Inhale slowly for four counts, hold for four, then exhale for four counts.")}
                    className="responsive-text-sm"
                  >
                    🧘 Meditation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setText("Breaking news: Scientists have made a groundbreaking discovery in artificial intelligence that could revolutionize the tech industry.")}
                    className="responsive-text-sm"
                  >
                    📰 News
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Text to Convert</Label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    rows={8}
                    className="resize-none card-content-safe"
                    maxLength={4000}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500">
                    <span>{text.length}/4000 characters</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span>~{Math.ceil(text.split(/\s+/).length / 150)} min duration</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setText("")}
                        className="h-6 px-2 text-xs w-fit"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !text.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating Audio...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Generate Speech
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2 text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-wrap-anywhere">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Player */}
            {result && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Generated Audio
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{result.voice}</Badge>
                      <Badge variant="secondary">{result.format.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Audio Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg">
                    <Button
                      onClick={handlePlayPause}
                      size="lg"
                      className="rounded-full w-16 h-16"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                    <div className="flex-1 text-center min-w-0">
                      <div className="text-sm text-gray-600 mb-1">
                        {isPlaying ? "Playing..." : "Ready to play"}
                      </div>
                      <div className="text-lg font-medium">
                        {formatDuration(result.duration)}
                      </div>
                    </div>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="lg"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Audio Info */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-xs text-gray-500">Voice</Label>
                      <p className="text-sm font-medium text-wrap-anywhere">{result.voice}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Duration</Label>
                      <p className="text-sm font-medium">{formatDuration(result.duration)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">File Size</Label>
                      <p className="text-sm font-medium">{formatFileSize(result.file_size)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Generated</Label>
                      <p className="text-sm font-medium">
                        {new Date(result.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Text Preview */}
                  <div className="space-y-2">
                    <Label>Generated from text:</Label>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-sm text-gray-700 line-clamp-3 text-wrap-anywhere">
                        {result.text}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0 self-start">
                    <Volume2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">Text-to-Speech Guide</h3>
                    <p className="text-gray-600 mb-4 text-wrap-anywhere">
                      Convert any text into natural-sounding speech with our advanced AI voices.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Voice Options</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li className="text-wrap-anywhere">• <strong>Alloy:</strong> Balanced, versatile voice</li>
                          <li className="text-wrap-anywhere">• <strong>Echo:</strong> Clear, professional male</li>
                          <li className="text-wrap-anywhere">• <strong>Fable:</strong> Warm storytelling voice</li>
                          <li className="text-wrap-anywhere">• <strong>Nova:</strong> Bright, energetic female</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Best Practices</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li className="text-wrap-anywhere">• Use punctuation for natural pauses</li>
                          <li className="text-wrap-anywhere">• Keep sentences under 200 characters</li>
                          <li className="text-wrap-anywhere">• Adjust speed for different content types</li>
                          <li className="text-wrap-anywhere">• Test different voices for your use case</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 