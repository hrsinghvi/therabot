import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MessageCircle, 
  Heart, 
  Shield, 
  AlertTriangle, 
  ExternalLink, 
  Search,
  BookOpen,
  Users,
  Globe,
  Clock,
  MapPin,
  LifeBuoy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Resource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  text?: string;
  category: 'crisis' | 'support' | 'education' | 'therapy';
  available: '24/7' | 'business-hours' | 'limited';
  country: string;
  icon: React.ComponentType<any>;
  color: string;
  urgent?: boolean;
}

const resources: Resource[] = [
  // Crisis Resources (24/7)
  {
    id: '988',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support for people in suicidal crisis or emotional distress',
    phone: '988',
    text: '988',
    website: 'https://988lifeline.org',
    category: 'crisis',
    available: '24/7',
    country: 'United States',
    icon: Phone,
    color: 'text-red-600 bg-red-100',
    urgent: true
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Text-based crisis intervention and emotional support',
    text: 'HOME to 741741',
    website: 'https://www.crisistextline.org',
    category: 'crisis',
    available: '24/7',
    country: 'United States',
    icon: MessageCircle,
    color: 'text-blue-600 bg-blue-100',
    urgent: true
  },
  {
    id: 'trevor-project',
    name: 'The Trevor Project',
    description: 'Crisis intervention and suicide prevention for LGBTQ+ youth',
    phone: '1-866-488-7386',
    text: 'START to 678678',
    website: 'https://www.thetrevorproject.org',
    category: 'crisis',
    available: '24/7',
    country: 'United States',
    icon: Heart,
    color: 'text-purple-600 bg-purple-100',
    urgent: true
  },
  {
    id: 'veterans-crisis',
    name: 'Veterans Crisis Line',
    description: 'Confidential support for veterans and their families',
    phone: '1-800-273-8255',
    text: '838255',
    website: 'https://www.veteranscrisisline.net',
    category: 'crisis',
    available: '24/7',
    country: 'United States',
    icon: Shield,
    color: 'text-green-600 bg-green-100',
    urgent: true
  },
  
  // Support Resources
  {
    id: 'nami',
    name: 'NAMI HelpLine',
    description: 'Information, referrals, and support for mental health conditions',
    phone: '1-800-950-NAMI (6264)',
    website: 'https://www.nami.org/help',
    category: 'support',
    available: 'business-hours',
    country: 'United States',
    icon: Users,
    color: 'text-indigo-600 bg-indigo-100'
  },
  {
    id: 'mental-health-america',
    name: 'Mental Health America',
    description: 'Resources, screening tools, and educational materials',
    website: 'https://www.mhanational.org',
    category: 'education',
    available: 'business-hours',
    country: 'United States',
    icon: BookOpen,
    color: 'text-teal-600 bg-teal-100'
  },
  {
    id: 'psychology-today',
    name: 'Psychology Today Therapist Finder',
    description: 'Find licensed therapists, psychiatrists, and treatment centers',
    website: 'https://www.psychologytoday.com/us/therapists',
    category: 'therapy',
    available: 'business-hours',
    country: 'United States',
    icon: Globe,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    id: 'betterhelp',
    name: 'BetterHelp',
    description: 'Online therapy platform with licensed counselors',
    website: 'https://www.betterhelp.com',
    category: 'therapy',
    available: '24/7',
    country: 'United States',
    icon: MessageCircle,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: 'talkspace',
    name: 'Talkspace',
    description: 'Online therapy and psychiatry services',
    website: 'https://www.talkspace.com',
    category: 'therapy',
    available: '24/7',
    country: 'United States',
    icon: MessageCircle,
    color: 'text-purple-600 bg-purple-100'
  }
];

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Resources', icon: Globe },
    { id: 'crisis', label: 'Crisis Support', icon: AlertTriangle },
    { id: 'support', label: 'General Support', icon: Heart },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'therapy', label: 'Therapy', icon: Users }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleText = (text: string) => {
    // For text services, show instructions
    alert(`To use this service, text "${text}" to the provided number.`);
  };

  const handleWebsite = (url: string) => {
    window.open(url, '_blank');
  };

  const getAvailabilityIcon = (available: string) => {
    switch (available) {
      case '24/7':
        return <Clock className="w-4 h-4 text-green-600" />;
      case 'business-hours':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'limited':
        return <Clock className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col space-y-6 pt-6"
    >
      {/* Header Section */}
      <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <LifeBuoy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Mental Health Resources</h2>
        </div>
        <p className="text-muted-foreground">
          Find immediate help, support, and resources for mental health challenges. 
          You're not alone, and help is available 24/7.
        </p>
      </div>

      <Separator />

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${resource.color}`}>
                      <resource.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {resource.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getAvailabilityIcon(resource.available)}
                        <span className="text-sm text-muted-foreground">
                          {resource.available}
                        </span>
                      </div>
                    </div>
                  </div>
                  {resource.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {resource.description}
                </p>
                
                <div className="space-y-3">
                  {resource.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Call:</span>
                      <span className="font-medium">{resource.phone}</span>
                    </div>
                  )}
                  
                  {resource.text && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Text:</span>
                      <span className="font-medium">{resource.text}</span>
                    </div>
                  )}
                  
                  {resource.website && (
                    <Button
                      onClick={() => handleWebsite(resource.website!)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {resource.country}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {resource.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="p-6 bg-secondary/50 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Important Information</h3>
        </div>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">What to Expect</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Confidential and free support</li>
                <li>• Trained counselors available 24/7</li>
                <li>• No judgment, just help</li>
                <li>• You can remain anonymous</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">When to Reach Out</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Having thoughts of suicide</li>
                <li>• Feeling overwhelmed or hopeless</li>
                <li>• Need someone to talk to</li>
                <li>• Looking for mental health resources</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Remember: You are not alone, and it's okay to ask for help.
            </p>
            <p className="text-xs text-muted-foreground">
              This information is provided for educational purposes only and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Resources; 