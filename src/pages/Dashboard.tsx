
import React, { useEffect, useState } from 'react';
import { useUser, SignOutButton, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Heart, Sword, Target, Eye, Calendar, Flame, ArrowUp, LogOut, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up supabase auth when component mounts
  useEffect(() => {
    const setupSupabaseAuth = async () => {
      if (user) {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: 'dummy-refresh-token',
          });
        }
      }
    };
    
    setupSupabaseAuth();
  }, [user, getToken]);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      return data as Profile;
    },
    enabled: !!user?.id
  });

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (user && !profileLoading && profile === null) {
      console.log('No profile found, redirecting to onboarding');
      navigate('/onboarding');
    }
  }, [user, profile, profileLoading, navigate]);

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
    enabled: !!user?.id && !!profile
  });

  // Fetch today's completions from daily_habit_logs
  const { data: todayCompletions = [] } = useQuery({
    queryKey: ['daily-completions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', today);
      
      if (error) throw error;
      return data as DailyHabitLog[];
    },
    enabled: !!user?.id && !!profile
  });

  const getAttributeIcon = (attribute: string) => {
    switch (attribute) {
      case 'brain': return <Brain className="w-5 h-5 text-blue-400" />;
      case 'health': return <Heart className="w-5 h-5 text-green-400" />;
      case 'skill': return <Sword className="w-5 h-5 text-purple-400" />;
      case 'discipline': return <Target className="w-5 h-5 text-orange-400" />;
      case 'focus': return <Eye className="w-5 h-5 text-yellow-400" />;
      default: return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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

  const getNextLevelXP = (level: number) => {
    return Math.pow(level * 100, 1.5);
  };

  const isHabitCompleted = (habitId: string) => {
    return todayCompletions.some(completion => completion.habit_id === habitId);
  };

  const toggleHabit = async (habit: Habit) => {
    if (!user?.id) return;

    const isCompleted = isHabitCompleted(habit.id);
    const today = new Date().toISOString().split('T')[0];

    try {
      if (isCompleted) {
        // Remove from daily_habit_logs
        const { error } = await supabase
          .from('daily_habit_logs')
          .delete()
          .eq('habit_id', habit.id)
          .eq('user_id', user.id)
          .eq('completed_date', today);

        if (error) throw error;

        // Update user XP (subtract)
        await supabase.rpc('update_user_xp', {
          p_user_id: user.id,
          xp_to_add: -habit.xp_value
        });

        toast({
          title: "Habit unchecked",
          description: `Removed ${habit.xp_value} XP for ${habit.name}`,
        });
      } else {
        // Add to daily_habit_logs
        const { error } = await supabase
          .from('daily_habit_logs')
          .insert({
            user_id: user.id,
            habit_id: habit.id,
            completed_date: today,
            xp_earned: habit.xp_value
          });

        if (error) throw error;

        // Update user XP
        await supabase.rpc('update_user_xp', {
          p_user_id: user.id,
          xp_to_add: habit.xp_value
        });

        toast({
          title: "Quest completed! ⚡",
          description: `+${habit.xp_value} XP earned for ${habit.name}`,
        });
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['daily-completions'] });
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your adventure...</div>
      </div>
    );
  }

  const currentRank = getRank(profile.current_level);
  const nextLevelXP = getNextLevelXP(profile.current_level);
  const progressPercentage = (profile.current_xp / nextLevelXP) * 100;
  const completedHabits = habits.filter(habit => isHabitCompleted(habit.id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                LevelUp ⚔️
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Welcome back, {profile.full_name} 👋
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/skills')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Skills
              </Button>
              <SignOutButton redirectUrl="/">
                <Button variant="ghost" className="text-white hover:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Habits */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Habit Tracker */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  Daily Quest Log
                </CardTitle>
                <p className="text-gray-400">Complete your daily habits to gain XP and rank up! Resets every day at 6 AM.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {habits.map((habit) => {
                  const isCompleted = isHabitCompleted(habit.id);
                  return (
                    <div
                      key={habit.id}
                      className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer ${
                        isCompleted 
                          ? 'bg-green-500/10 border-green-500/30 shadow-green-500/20' 
                          : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                      } shadow-lg`}
                      onClick={() => toggleHabit(habit)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-500 hover:border-purple-400'
                            }`}
                          >
                            {isCompleted && '✓'}
                          </div>
                          
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              {getAttributeIcon(habit.attribute)}
                              <span className={`font-medium ${isCompleted ? 'text-green-300 line-through' : 'text-white'}`}>
                                {habit.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${getDifficultyColor(habit.difficulty)} text-xs`}>
                                {habit.difficulty}
                              </Badge>
                              <span className="text-xs text-gray-400">+{habit.xp_value} XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Daily Progress Overview */}
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <ArrowUp className="w-5 h-5 text-blue-400" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
                  <p className="text-gray-400 text-sm">Quests Completed Today</p>
                  <p className="text-3xl font-bold text-blue-300">{completedHabits}/{habits.length}</p>
                  <p className="text-xs text-gray-500 mt-2">Resets daily at 6 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - XP & Rank Panel */}
          <div className="space-y-6">
            {/* XP & Rank Panel */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Hunter Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {profile.current_xp} XP
                  </div>
                  <div className="text-lg text-gray-300">Level {profile.current_level}</div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-3 py-1">
                    {currentRank}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Progress to Level {profile.current_level + 1}</span>
                    <span>{profile.current_xp}/{Math.round(nextLevelXP)} XP</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-3 bg-slate-700"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-300 font-bold">{profile.streak_count}-Day Streak</span>
                </div>

                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <p className="text-center text-sm text-gray-300 italic">
                    "Keep grinding, Shadow Hunter! 💪"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
