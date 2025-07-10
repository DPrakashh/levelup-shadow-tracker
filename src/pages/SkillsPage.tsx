
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Heart, Sword, Target, Eye, LogOut, Home, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Profile {
  full_name: string;
  current_xp: number;
  current_level: number;
  streak_count: number;
}

interface Habit {
  id: string;
  name: string;
  attribute: string;
  difficulty: string;
  xp_value: number;
}

interface DailyHabitLog {
  habit_id: string;
  completed_date: string;
  xp_earned: number;
}

const SkillsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    }
  }, [user, navigate]);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id
  });

  // Fetch user habits
  const { data: habits = [] } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user?.id
  });

  // Fetch all habit completions for XP calculation from daily_habit_logs
  const { data: allCompletions = [] } = useQuery({
    queryKey: ['all-daily-completions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('daily_habit_logs')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as DailyHabitLog[];
    },
    enabled: !!user?.id
  });

  const getAttributeIcon = (attribute: string) => {
    switch (attribute) {
      case 'brain': return <Brain className="w-8 h-8 text-blue-400" />;
      case 'health': return <Heart className="w-8 h-8 text-green-400" />;
      case 'skill': return <Sword className="w-8 h-8 text-purple-400" />;
      case 'discipline': return <Target className="w-8 h-8 text-orange-400" />;
      case 'focus': return <Eye className="w-8 h-8 text-yellow-400" />;
      default: return <Target className="w-8 h-8 text-gray-400" />;
    }
  };

  const getAttributeColor = (attribute: string) => {
    switch (attribute) {
      case 'brain': return 'from-blue-500 to-blue-700';
      case 'health': return 'from-green-500 to-green-700';
      case 'skill': return 'from-purple-500 to-purple-700';
      case 'discipline': return 'from-orange-500 to-orange-700';
      case 'focus': return 'from-yellow-500 to-yellow-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getAttributeName = (attribute: string) => {
    switch (attribute) {
      case 'brain': return 'Brain 🧠';
      case 'health': return 'Health 💪';
      case 'skill': return 'Skill ⚔️';
      case 'discipline': return 'Discipline 🧘';
      case 'focus': return 'Focus 🎯';
      default: return 'Unknown';
    }
  };

  const calculateAttributeXP = (attribute: string) => {
    return allCompletions
      .filter(completion => {
        const habit = habits.find(h => h.id === completion.habit_id);
        return habit?.attribute === attribute;
      })
      .reduce((total, completion) => total + completion.xp_earned, 0);
  };

  const calculateAttributeLevel = (xp: number) => {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
  };

  const getNextAttributeLevelXP = (level: number) => {
    return Math.pow(level * 50, 2);
  };

  const getRank = (level: number) => {
    if (level >= 50) return 'Universal Hunter';
    if (level >= 40) return 'Monarch';
    if (level >= 30) return 'Shadow';
    if (level >= 25) return 'S-Rank';
    if (level >= 20) return 'A-Rank';
    if (level >= 15) return 'B-Rank';
    if (level >= 10) return 'C-Rank';
    if (level >= 5) return 'D-Rank';
    return 'E-Rank';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your skills...</div>
      </div>
    );
  }

  const attributes = ['brain', 'health', 'skill', 'discipline', 'focus'];
  const skillData = attributes.map(attribute => {
    const xp = calculateAttributeXP(attribute);
    const level = calculateAttributeLevel(xp);
    const nextLevelXP = getNextAttributeLevelXP(level);
    const progress = (xp / nextLevelXP) * 100;
    const habitsInAttribute = habits.filter(h => h.attribute === attribute);
    
    return {
      attribute,
      xp,
      level,
      progress,
      habitsCount: habitsInAttribute.length
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Skills & Attributes ⚔️
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Master your skills, {profile.full_name}!
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                className="text-white hover:text-blue-400"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="ghost" 
                className="text-white hover:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Total XP</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {profile.current_xp}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Overall Level</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-300">
                {profile.current_level}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-yellow-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Hunter Rank</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-3 py-1 text-sm">
                {getRank(profile.current_level)}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillData.map(({ attribute, xp, level, progress, habitsCount }) => (
            <Card key={attribute} className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  {getAttributeIcon(attribute)}
                  <span>{getAttributeName(attribute)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className={`text-2xl font-bold bg-gradient-to-r ${getAttributeColor(attribute)} bg-clip-text text-transparent`}>
                    Level {level}
                  </div>
                  <div className="text-sm text-gray-400">
                    {xp} XP earned from daily completions
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress to Level {level + 1}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2 bg-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600">
                  <span className="text-gray-300 text-sm">Active Habits</span>
                  <Badge variant="secondary" className="bg-slate-700 text-white">
                    {habitsCount}
                  </Badge>
                </div>

                {habitsCount > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold">Your {getAttributeName(attribute)} Habits:</p>
                    {habits
                      .filter(h => h.attribute === attribute)
                      .map(habit => (
                        <div key={habit.id} className="text-xs text-gray-400 flex justify-between">
                          <span>{habit.name}</span>
                          <span>+{habit.xp_value} XP per completion</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Motivational Section */}
        <Card className="mt-8 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="text-center py-8">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Keep Growing, Hunter!</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Every completed habit strengthens your skills. Master all five attributes to become the ultimate Shadow Hunter! 
              Your current streak: <span className="text-orange-400 font-bold">{profile.streak_count} days</span> 🔥
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Daily habits reset at 6 AM, but your progress and XP are preserved forever!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillsPage;
