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
  Mic
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audio Playground</h1>
        <p className="text-gray-600">Convert text to natural-sounding speech with advanced AI voices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Selection */}
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center space-x-2">
                          {getVoiceIcon(voice.gender)}
                          <div>
                            <div className="font-medium">{voice.name}</div>
                            <div className="text-xs text-gray-500 capitalize">
                              {voice.gender} • {voice.language}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVoiceData && (
                  <p className="text-xs text-gray-500">{selectedVoiceData.description}</p>
                )}
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
                    <span className="font-medium">{selectedVoiceData.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>Language: {selectedVoiceData.language}</p>
                    <p>Gender: {selectedVoiceData.gender}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3">
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
                <div className="space-y-2">
                  <Label>Text to Convert</Label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    rows={8}
                    className="resize-none"
                    maxLength={4000}
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{text.length}/4000 characters</span>
                    <span>~{Math.ceil(text.split(/\s+/).length / 150)} min duration</span>
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
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Player */}
            {result && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Generated Audio
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{result.voice}</Badge>
                      <Badge variant="secondary">{result.format.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Audio Controls */}
                  <div className="flex items-center justify-center space-x-4 p-6 bg-gray-50 rounded-lg">
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
                    <div className="flex-1 text-center">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-xs text-gray-500">Voice</Label>
                      <p className="text-sm font-medium">{result.voice}</p>
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
                      <p className="text-sm text-gray-700 line-clamp-3">
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
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Volume2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Text-to-Speech Guide</h3>
                    <p className="text-gray-600 mb-4">
                      Convert any text into natural-sounding speech with our advanced AI voices.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Voice Options</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• <strong>Alloy:</strong> Balanced, versatile voice</li>
                          <li>• <strong>Echo:</strong> Clear, professional male</li>
                          <li>• <strong>Fable:</strong> Warm storytelling voice</li>
                          <li>• <strong>Nova:</strong> Bright, energetic female</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Best Practices</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Use punctuation for natural pauses</li>
                          <li>• Keep sentences under 200 characters</li>
                          <li>• Adjust speed for different content types</li>
                          <li>• Test different voices for your use case</li>
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