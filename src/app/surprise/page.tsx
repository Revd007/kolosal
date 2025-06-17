"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Lightbulb, 
  Palette, 
  Star,
  Heart,
  Shuffle,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Clock,
  RefreshCw,
  Copy,
  Download,
  Wand2,
  Music,
  BookOpen,
  Code,
  Moon,
  User,
  Zap,
  Camera,
  Coffee,
  Gift
} from "lucide-react";

interface SurpriseFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  action: () => Promise<any>;
}

interface SurpriseResult {
  feature: string;
  result: any;
  timestamp: string;
}

export default function SurprisePage() {
  const [results, setResults] = useState<SurpriseResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const surpriseFeatures: SurpriseFeature[] = [
    {
      id: "idea_generator",
      name: "Random Idea Generator",
      description: "Generate creative business and project ideas",
      icon: Lightbulb,
      color: "yellow",
      action: async () => {
        const categories = ["Tech Startup", "Mobile App", "Web Service", "Physical Product", "Social Platform"];
        const adjectives = ["Revolutionary", "Innovative", "Disruptive", "Smart", "Eco-friendly", "AI-powered"];
        const nouns = ["marketplace", "platform", "solution", "network", "system", "tool"];
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return {
          category,
          idea: `${adjective} ${noun} for ${category.toLowerCase()}`,
          description: `A ${adjective.toLowerCase()} ${noun} that revolutionizes the ${category.toLowerCase()} industry`,
          market_size: `$${Math.floor(Math.random() * 100) + 10}B`,
          difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
          time_to_market: `${Math.floor(Math.random() * 12) + 3} months`
        };
      }
    },
    {
      id: "color_palette",
      name: "Random Color Palette",
      description: "Generate beautiful color combinations",
      icon: Palette,
      color: "pink",
      action: async () => {
        const generateColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        const colors = Array.from({ length: 5 }, generateColor);
        const themes = ["Sunset", "Ocean", "Forest", "Desert", "Aurora", "Vintage", "Modern", "Pastel"];
        
        return {
          colors,
          theme: themes[Math.floor(Math.random() * themes.length)],
          hex_codes: colors,
          rgb_codes: colors.map(color => {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgb(${r}, ${g}, ${b})`;
          })
        };
      }
    },
    {
      id: "fortune_teller",
      name: "AI Fortune Teller",
      description: "Get mystical predictions and insights",
      icon: Star,
      color: "purple",
      action: async () => {
        const fortunes = [
          "A great opportunity awaits you in the digital realm",
          "Your creativity will unlock new possibilities this week",
          "An unexpected collaboration will bring success",
          "Trust your intuition in upcoming decisions",
          "A technological breakthrough will change your perspective"
        ];
        const luckyNumbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1);
        const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];
        const moods = ["Optimistic", "Creative", "Focused", "Adventurous", "Peaceful"];
        
        return {
          fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
          lucky_numbers: luckyNumbers,
          lucky_color: colors[Math.floor(Math.random() * colors.length)],
          mood: moods[Math.floor(Math.random() * moods.length)],
          advice: "Embrace change and stay open to new experiences"
        };
      }
    },
    {
      id: "weird_facts",
      name: "Weird Facts Generator",
      description: "Discover bizarre and fascinating facts",
      icon: Wand2,
      color: "green",
      action: async () => {
        const facts = [
          "Octopuses have three hearts and blue blood",
          "Bananas are berries, but strawberries aren't",
          "A group of flamingos is called a 'flamboyance'",
          "Honey never spoils - archaeologists found edible honey in Egyptian tombs",
          "The shortest war in history lasted only 38-45 minutes",
          "A single cloud can weigh more than a million pounds",
          "There are more possible games of chess than atoms in the observable universe"
        ];
        const categories = ["Nature", "History", "Science", "Animals", "Space", "Food", "Technology"];
        
        return {
          fact: facts[Math.floor(Math.random() * facts.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          weirdness_level: Math.floor(Math.random() * 10) + 1,
          source: "AI Knowledge Base",
          related_topics: ["Biology", "Physics", "History"].slice(0, Math.floor(Math.random() * 3) + 1)
        };
      }
    },
    {
      id: "mood_booster",
      name: "Instant Mood Booster",
      description: "Get compliments and positive vibes",
      icon: Heart,
      color: "red",
      action: async () => {
        const compliments = [
          "You have an amazing ability to solve complex problems",
          "Your creativity knows no bounds",
          "You bring positive energy wherever you go",
          "Your curiosity about technology is inspiring",
          "You have a unique perspective that adds value"
        ];
        const activities = [
          "Take a 5-minute walk outside",
          "Listen to your favorite song",
          "Do some deep breathing exercises",
          "Write down three things you're grateful for",
          "Stretch your arms and shoulders"
        ];
        
        return {
          compliment: compliments[Math.floor(Math.random() * compliments.length)],
          suggested_activity: activities[Math.floor(Math.random() * activities.length)],
          mood_score: Math.floor(Math.random() * 3) + 8, // 8-10
          positive_affirmation: "You are capable of achieving great things",
          energy_level: ["High", "Energized", "Motivated"][Math.floor(Math.random() * 3)]
        };
      }
    },
    {
      id: "fantasy_names",
      name: "Fantasy Name Generator",
      description: "Generate mystical character names",
      icon: Sparkles,
      color: "indigo",
      action: async () => {
        const prefixes = ["Aer", "Cel", "Dra", "Eld", "Fae", "Gal", "Lyr", "Mor", "Nyx", "Zar"];
        const suffixes = ["ion", "wyn", "eth", "ara", "iel", "oth", "ris", "vel", "dor", "lyn"];
        const titles = ["the Wise", "Stormcaller", "Shadowweaver", "Lightbringer", "Moonwhisperer"];
        
        const firstName = prefixes[Math.floor(Math.random() * prefixes.length)] + 
                         suffixes[Math.floor(Math.random() * suffixes.length)];
        const lastName = prefixes[Math.floor(Math.random() * prefixes.length)] + 
                        suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return {
          full_name: `${firstName} ${lastName}`,
          title: titles[Math.floor(Math.random() * titles.length)],
          origin: ["Elven", "Dwarven", "Human", "Draconic", "Celestial"][Math.floor(Math.random() * 5)],
          meaning: "Bearer of ancient wisdom",
          pronunciation: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
        };
      }
    },
    {
      id: "dice_oracle",
      name: "Digital Dice Oracle",
      description: "Roll dice with mystical interpretations",
      icon: Dice1,
      color: "blue",
      action: async () => {
        const rollDice = () => Math.floor(Math.random() * 6) + 1;
        const dice = [rollDice(), rollDice()];
        const total = dice.reduce((a, b) => a + b, 0);
        
        const interpretations = {
          2: "New beginnings await",
          3: "Creative energy flows",
          4: "Stability and foundation",
          5: "Change is coming",
          6: "Balance and harmony",
          7: "Lucky number - good fortune",
          8: "Material success ahead",
          9: "Completion of a cycle",
          10: "Perfect timing",
          11: "Intuition guides you",
          12: "Maximum potential achieved"
        };
        
        return {
          dice_rolls: dice,
          total,
          interpretation: interpretations[total as keyof typeof interpretations],
          luck_factor: total >= 7 ? "High" : total >= 4 ? "Medium" : "Low",
          mystical_meaning: "The dice reveal the path forward"
        };
      }
    },
    {
      id: "time_capsule",
      name: "Digital Time Capsule",
      description: "Create messages for your future self",
      icon: Clock,
      color: "orange",
      action: async () => {
        const timeFrames = ["1 week", "1 month", "3 months", "6 months", "1 year"];
        const prompts = [
          "What are you most excited about right now?",
          "What challenge are you currently facing?",
          "What goal do you want to achieve?",
          "What makes you happy today?",
          "What advice would you give your past self?"
        ];
        
        return {
          time_frame: timeFrames[Math.floor(Math.random() * timeFrames.length)],
          prompt: prompts[Math.floor(Math.random() * prompts.length)],
          delivery_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
          capsule_id: `tc_${Date.now()}`,
          reminder: "Your future self will thank you for this reflection"
        };
      }
    },
    // NEW ADVANCED FEATURES
    {
      id: "ai_art_generator",
      name: "AI Art Generator",
      description: "Create unique digital artwork from descriptions",
      icon: Camera,
      color: "teal",
      action: async () => {
        const styles = ["Abstract", "Surreal", "Minimalist", "Cyberpunk", "Watercolor", "Oil Painting"];
        const subjects = ["Cosmic landscape", "Futuristic city", "Mystical forest", "Ocean depths", "Mountain peaks"];
        const colors = ["Vibrant", "Monochrome", "Pastel", "Neon", "Earth tones"];
        
        const style = styles[Math.floor(Math.random() * styles.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const colorScheme = colors[Math.floor(Math.random() * colors.length)];
        
        return {
          artwork_title: `${style} ${subject}`,
          style,
          subject,
          color_scheme: colorScheme,
          prompt: `${style} ${subject} with ${colorScheme.toLowerCase()} colors`,
          resolution: "1024x1024",
          generation_time: `${Math.floor(Math.random() * 5) + 2}s`,
          art_style_confidence: Math.floor(Math.random() * 20) + 80,
          preview_url: `data:image/svg+xml;base64,${btoa(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="artGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#4ECDC4;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#45B7D1;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="200" height="200" fill="url(#artGrad)" />
              <circle cx="100" cy="100" r="50" fill="white" opacity="0.8" />
              <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">
                ${style}
              </text>
            </svg>
          `)}`
        };
      }
    },
    {
      id: "music_composer",
      name: "AI Music Composer",
      description: "Generate melodies and musical compositions",
      icon: Music,
      color: "violet",
      action: async () => {
        const genres = ["Ambient", "Classical", "Electronic", "Jazz", "Lo-fi", "Cinematic"];
        const moods = ["Peaceful", "Energetic", "Mysterious", "Uplifting", "Melancholic", "Adventurous"];
        const instruments = ["Piano", "Strings", "Synthesizer", "Guitar", "Flute", "Drums"];
        const keys = ["C Major", "G Major", "D Minor", "A Minor", "F Major", "E Minor"];
        
        const genre = genres[Math.floor(Math.random() * genres.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const instrument = instruments[Math.floor(Math.random() * instruments.length)];
        const key = keys[Math.floor(Math.random() * keys.length)];
        
        return {
          composition_title: `${mood} ${genre} in ${key}`,
          genre,
          mood,
          primary_instrument: instrument,
          key_signature: key,
          tempo: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
          duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          complexity: ["Simple", "Moderate", "Complex"][Math.floor(Math.random() * 3)],
          inspiration: `A ${mood.toLowerCase()} journey through ${genre.toLowerCase()} soundscapes`
        };
      }
    },
    {
      id: "story_writer",
      name: "AI Story Writer",
      description: "Generate creative short stories and narratives",
      icon: BookOpen,
      color: "amber",
      action: async () => {
        const genres = ["Sci-Fi", "Fantasy", "Mystery", "Romance", "Adventure", "Horror"];
        const settings = ["Space station", "Medieval castle", "Modern city", "Enchanted forest", "Desert island"];
        const characters = ["Brave explorer", "Wise wizard", "Clever detective", "Kind-hearted robot", "Mysterious stranger"];
        const conflicts = ["Ancient curse", "Time paradox", "Hidden treasure", "Lost memory", "Forbidden love"];
        
        const genre = genres[Math.floor(Math.random() * genres.length)];
        const setting = settings[Math.floor(Math.random() * settings.length)];
        const character = characters[Math.floor(Math.random() * characters.length)];
        const conflict = conflicts[Math.floor(Math.random() * conflicts.length)];
        
        return {
          story_title: `The ${character} and the ${conflict}`,
          genre,
          setting,
          main_character: character,
          central_conflict: conflict,
          plot_summary: `In a ${setting.toLowerCase()}, a ${character.toLowerCase()} must overcome a ${conflict.toLowerCase()} to save the day.`,
          word_count: Math.floor(Math.random() * 2000) + 500,
          reading_time: `${Math.floor(Math.random() * 8) + 2} minutes`,
          themes: ["Courage", "Friendship", "Discovery"].slice(0, Math.floor(Math.random() * 3) + 1)
        };
      }
    },
    {
      id: "code_poet",
      name: "Code Poet",
      description: "Generate poetic code comments and programming haikus",
      icon: Code,
      color: "slate",
      action: async () => {
        const languages = ["JavaScript", "Python", "TypeScript", "Rust", "Go", "Swift"];
        const concepts = ["Functions", "Variables", "Loops", "Arrays", "Objects", "Classes"];
        const haikus = [
          "Code flows like water\nThrough functions and variables\nLogic finds its way",
          "Bugs hide in shadows\nDebugging brings clarity\nClean code emerges",
          "Arrays hold data\nLoops iterate through each one\nPatterns come to life",
          "Functions call others\nRecursion creates beauty\nStack overflow waits"
        ];
        
        const language = languages[Math.floor(Math.random() * languages.length)];
        const concept = concepts[Math.floor(Math.random() * concepts.length)];
        const haiku = haikus[Math.floor(Math.random() * haikus.length)];
        
        return {
          programming_haiku: haiku,
          language,
          concept,
          poetic_comment: `// ${haiku.split('\n')[0]}`,
          code_wisdom: "Beautiful code is poetry in motion",
          syllable_count: "5-7-5",
          inspiration: `The zen of ${language} programming`
        };
      }
    },
    {
      id: "dream_interpreter",
      name: "Dream Interpreter",
      description: "Analyze and interpret dream symbols and meanings",
      icon: Moon,
      color: "indigo",
      action: async () => {
        const symbols = ["Flying", "Water", "Animals", "Colors", "People", "Objects"];
        const meanings = {
          "Flying": "Freedom and liberation from constraints",
          "Water": "Emotions and subconscious feelings",
          "Animals": "Instincts and natural behaviors",
          "Colors": "Emotional states and energy",
          "People": "Relationships and social connections",
          "Objects": "Goals and material desires"
        };
        const emotions = ["Peaceful", "Anxious", "Excited", "Confused", "Happy", "Mysterious"];
        
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        
        return {
          dream_symbol: symbol,
          interpretation: meanings[symbol as keyof typeof meanings],
          emotional_tone: emotion,
          significance: "High",
          advice: "Pay attention to recurring themes in your dreams",
          related_symbols: symbols.filter(s => s !== symbol).slice(0, 2),
          dream_category: ["Prophetic", "Processing", "Symbolic"][Math.floor(Math.random() * 3)]
        };
      }
    },
    {
      id: "personality_analyzer",
      name: "Personality Analyzer",
      description: "Generate personality insights and traits",
      icon: User,
      color: "emerald",
      action: async () => {
        const traits = ["Creative", "Analytical", "Empathetic", "Adventurous", "Organized", "Intuitive"];
        const strengths = ["Problem-solving", "Communication", "Leadership", "Innovation", "Patience", "Adaptability"];
        const types = ["Innovator", "Harmonizer", "Explorer", "Organizer", "Visionary", "Connector"];
        const elements = ["Fire", "Water", "Earth", "Air"];
        
        const primaryTrait = traits[Math.floor(Math.random() * traits.length)];
        const strength = strengths[Math.floor(Math.random() * strengths.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const element = elements[Math.floor(Math.random() * elements.length)];
        
        return {
          personality_type: type,
          primary_trait: primaryTrait,
          core_strength: strength,
          element_affinity: element,
          compatibility: traits.filter(t => t !== primaryTrait).slice(0, 2),
          growth_area: "Embracing new perspectives",
          life_motto: "Innovation through collaboration",
          energy_level: Math.floor(Math.random() * 30) + 70 // 70-100%
        };
      }
    },
    {
      id: "coffee_oracle",
      name: "Coffee Oracle",
      description: "Get coffee-inspired wisdom and brewing advice",
      icon: Coffee,
      color: "amber",
      action: async () => {
        const coffeeTypes = ["Espresso", "Americano", "Latte", "Cappuccino", "Cold Brew", "French Press"];
        const origins = ["Ethiopian", "Colombian", "Brazilian", "Jamaican", "Hawaiian", "Guatemalan"];
        const flavors = ["Nutty", "Fruity", "Chocolatey", "Floral", "Spicy", "Caramel"];
        const wisdom = [
          "Like coffee, life is better when shared with others",
          "The perfect brew requires patience and attention",
          "Every bean has a story to tell",
          "Strong coffee, strong code, strong day",
          "The best ideas often come with the first sip"
        ];
        
        const coffeeType = coffeeTypes[Math.floor(Math.random() * coffeeTypes.length)];
        const origin = origins[Math.floor(Math.random() * origins.length)];
        const flavor = flavors[Math.floor(Math.random() * flavors.length)];
        const quote = wisdom[Math.floor(Math.random() * wisdom.length)];
        
        return {
          recommended_coffee: `${origin} ${coffeeType}`,
          flavor_profile: flavor,
          brewing_method: coffeeType,
          coffee_wisdom: quote,
          caffeine_level: Math.floor(Math.random() * 100) + 50, // 50-150mg
          perfect_time: ["Morning", "Afternoon", "Evening"][Math.floor(Math.random() * 3)],
          pairing: ["Dark chocolate", "Pastry", "Quiet music"][Math.floor(Math.random() * 3)]
        };
      }
    },
    {
      id: "gift_suggester",
      name: "Gift Suggester",
      description: "Generate thoughtful gift ideas for any occasion",
      icon: Gift,
      color: "rose",
      action: async () => {
        const occasions = ["Birthday", "Anniversary", "Holiday", "Graduation", "Promotion", "Just Because"];
        const categories = ["Tech", "Books", "Art", "Experience", "Handmade", "Subscription"];
        const budgets = ["Under $25", "$25-50", "$50-100", "$100-200", "Luxury"];
        const personalities = ["Creative", "Practical", "Adventurous", "Intellectual", "Homebody", "Trendsetter"];
        
        const occasion = occasions[Math.floor(Math.random() * occasions.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const budget = budgets[Math.floor(Math.random() * budgets.length)];
        const personality = personalities[Math.floor(Math.random() * personalities.length)];
        
        const giftIdeas = {
          "Tech": ["Smart home device", "Wireless earbuds", "Portable charger", "Fitness tracker"],
          "Books": ["Bestselling novel", "Coffee table book", "Personal development", "Cookbook"],
          "Art": ["Custom portrait", "Art supplies", "Gallery print", "Handmade pottery"],
          "Experience": ["Concert tickets", "Cooking class", "Spa day", "Adventure tour"],
          "Handmade": ["Knitted scarf", "Custom jewelry", "Artisan soap", "Handwritten letter"],
          "Subscription": ["Streaming service", "Book club", "Coffee delivery", "Meal kit"]
        };
        
        const ideas = giftIdeas[category as keyof typeof giftIdeas];
        const suggestion = ideas[Math.floor(Math.random() * ideas.length)];
        
        return {
          occasion,
          gift_suggestion: suggestion,
          category,
          budget_range: budget,
          personality_match: personality,
          thoughtfulness_score: Math.floor(Math.random() * 30) + 70, // 70-100%
          alternative_ideas: ideas.filter(idea => idea !== suggestion).slice(0, 2),
          wrapping_suggestion: ["Elegant box", "Brown paper", "Gift bag", "Fabric wrap"][Math.floor(Math.random() * 4)]
        };
      }
    }
  ];

  const handleSurpriseMe = async () => {
    setIsLoading(true);
    setSelectedFeature(null);
    
    try {
      // Pick a random feature
      const randomFeature = surpriseFeatures[Math.floor(Math.random() * surpriseFeatures.length)];
      setSelectedFeature(randomFeature.id);
      
      // Execute the feature
      const result = await randomFeature.action();
      
      const newResult: SurpriseResult = {
        feature: randomFeature.name,
        result,
        timestamp: new Date().toISOString()
      };
      
      setResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      console.error('Surprise feature error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecificFeature = async (feature: SurpriseFeature) => {
    setIsLoading(true);
    setSelectedFeature(feature.id);
    
    try {
      const result = await feature.action();
      
      const newResult: SurpriseResult = {
        feature: feature.name,
        result,
        timestamp: new Date().toISOString()
      };
      
      setResults(prev => [newResult, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Feature execution error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDiceIcon = (number: number) => {
    const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    return diceIcons[number - 1] || Dice1;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ✨ Surprise Me! ✨
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Discover unexpected AI-powered features and creative tools
        </p>
        <Button 
          onClick={handleSurpriseMe}
          disabled={isLoading}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Surprising you...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Surprise Me!
            </>
          )}
        </Button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {surpriseFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const isSelected = selectedFeature === feature.id;
          
          return (
            <Card 
              key={feature.id} 
              className={`hover:shadow-lg transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
              }`}
              onClick={() => handleSpecificFeature(feature)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
                {isSelected && isLoading && (
                  <div className="mt-3">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto text-purple-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Surprises</h2>
          
          {results.map((result, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-purple-600" />
                    {result.feature}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {new Date(result.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(JSON.stringify(result.result, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Special rendering for different result types */}
                {result.feature === "Random Color Palette" && (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      {result.result.colors.map((color: string, i: number) => (
                        <div
                          key={i}
                          className="w-16 h-16 rounded-lg border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Theme:</strong> {result.result.theme}
                      </div>
                      <div>
                        <strong>Hex Codes:</strong> {result.result.hex_codes.join(', ')}
                      </div>
                    </div>
                  </div>
                )}
                
                {result.feature === "Digital Dice Oracle" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      {result.result.dice_rolls.map((roll: number, i: number) => {
                        const DiceIcon = getDiceIcon(roll);
                        return (
                          <div key={i} className="text-center">
                            <DiceIcon className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                            <span className="text-lg font-bold">{roll}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        Total: {result.result.total}
                      </div>
                      <p className="text-gray-700">{result.result.interpretation}</p>
                    </div>
                  </div>
                )}

                {result.feature === "AI Art Generator" && result.result.preview_url && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={result.result.preview_url} 
                        alt={result.result.artwork_title}
                        className="w-48 h-48 rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Title:</strong> {result.result.artwork_title}</div>
                      <div><strong>Style:</strong> {result.result.style}</div>
                      <div><strong>Colors:</strong> {result.result.color_scheme}</div>
                      <div><strong>Resolution:</strong> {result.result.resolution}</div>
                    </div>
                  </div>
                )}
                
                {/* Default JSON display for other results */}
                {!["Random Color Palette", "Digital Dice Oracle", "AI Art Generator"].includes(result.feature) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">About Surprise Features</h3>
              <p className="text-gray-600 mb-4">
                These AI-powered surprise features are designed to spark creativity, provide entertainment, 
                and offer unexpected insights. Each feature uses advanced algorithms to generate unique, 
                personalized results every time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Creative Tools</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• AI Art & Music Generation</li>
                    <li>• Story & Poetry Creation</li>
                    <li>• Color & Design Inspiration</li>
                    <li>• Character & Name Generation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Fun & Insights</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Personality Analysis</li>
                    <li>• Dream Interpretation</li>
                    <li>• Fortune Telling & Oracles</li>
                    <li>• Mood Boosters & Wisdom</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 