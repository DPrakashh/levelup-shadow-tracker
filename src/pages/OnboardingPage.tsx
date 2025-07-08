
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Heart, Sword, Target, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AttributeType = Database['public']['Enums']['attribute_type'];
type DifficultyLevel = Database['public']['Enums']['difficulty_level'];

interface Habit {
  name: string;
  attribute: AttributeType | '';
  difficulty: DifficultyLevel | '';
}

const OnboardingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [habits, setHabits] = useState<Habit[]>([
    { name: '', attribute: '', difficulty: '' },
    { name: '', attribute: '', difficulty: '' },
    { name: '', attribute: '', difficulty: '' },
    { name: '', attribute: '', difficulty: '' },
    { name: '', attribute: '', difficulty: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const attributeOptions = [
    { value: 'brain' as const, label: 'Brain 🧠', icon: Brain },
    { value: 'health' as const, label: 'Health 💪', icon: Heart },
    { value: 'skill' as const, label: 'Skill ⚔️', icon: Sword },
    { value: 'discipline' as const, label: 'Discipline 🧘', icon: Target },
    { value: 'focus' as const, label: 'Focus 🎯', icon: Eye },
  ];

  const difficultyOptions = [
    { value: 'easy' as const, label: 'Easy (5 XP)', xp: 5 },
    { value: 'medium' as const, label: 'Medium (10 XP)', xp: 10 },
    { value: 'hard' as const, label: 'Hard (20 XP)', xp: 20 },
  ];

  const updateHabit = (index: number, field: keyof Habit, value: string) => {
    const newHabits = [...habits];
    newHabits[index][field] = value as any;
    setHabits(newHabits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate all habits are filled
    const isValid = habits.every(habit => habit.name && habit.attribute && habit.difficulty) && fullName;
    
    if (!isValid) {
      toast({
        title: "Please fill in all fields",
        description: "Make sure to complete all habit details and your full name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: fullName,
          email: user.emailAddresses[0]?.emailAddress || '',
          current_xp: 0,
          current_level: 1,
          streak_count: 0
        });

      if (profileError) throw profileError;

      // Create habits with proper typing
      const habitsToInsert = habits.map(habit => ({
        user_id: user.id,
        name: habit.name,
        attribute: habit.attribute as AttributeType,
        difficulty: habit.difficulty as DifficultyLevel,
        xp_value: difficultyOptions.find(d => d.value === habit.difficulty)?.xp || 5
      }));

      const { error: habitsError } = await supabase
        .from('habits')
        .insert(habitsToInsert);

      if (habitsError) throw habitsError;

      toast({
        title: "Welcome to LevelUp!",
        description: "Your profile and habits have been set up successfully.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Setup failed",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome to LevelUp! ⚔️
          </h1>
          <p className="text-gray-300 text-lg">Let's set up your character and define your daily quests</p>
        </div>

        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">Character Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white text-lg">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Habits */}
              <div className="space-y-6">
                <h3 className="text-white text-xl font-semibold">Define Your 5 Daily Quests</h3>
                {habits.map((habit, index) => (
                  <Card key={index} className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Quest #{index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Habit Name</Label>
                        <Input
                          value={habit.name}
                          onChange={(e) => updateHabit(index, 'name', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="e.g., Exercise for 30 minutes"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Attribute Focus</Label>
                          <Select value={habit.attribute} onValueChange={(value) => updateHabit(index, 'attribute', value)}>
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                              <SelectValue placeholder="Choose attribute" />
                            </SelectTrigger>
                            <SelectContent>
                              {attributeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300">Difficulty</Label>
                          <Select value={habit.difficulty} onValueChange={(value) => updateHabit(index, 'difficulty', value)}>
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                              <SelectValue placeholder="Choose difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              {difficultyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? 'Setting up your adventure...' : 'Start My Journey! 🚀'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
