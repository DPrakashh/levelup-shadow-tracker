
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Habit {
  id: string;
  name: string;
  attribute: string;
  difficulty: string;
  xp_value: number;
  is_active: boolean;
}

interface UserProgress {
  current_streak: number;
  longest_streak: number;
  total_habits_completed: number;
  total_xp_earned: number;
}

interface UserProfile {
  full_name: string;
  current_level: number;
  current_xp: number;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyCompletions, setDailyCompletions] = useState<string[]>([]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in');
    }
  }, [user, loading, navigate]);

  // Fetch user data when authenticated
  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchHabits();
      fetchDailyCompletions();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, current_level, current_xp')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Fetch user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('current_streak, longest_streak, total_habits_completed, total_xp_earned')
        .eq('user_id', user.id)
        .single();

      if (progress) {
        setUserProgress(progress);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchDailyCompletions = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_habit_logs')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (error) throw error;
      setDailyCompletions(data?.map(log => log.habit_id) || []);
    } catch (error) {
      console.error('Error fetching daily completions:', error);
    }
  };

  const completeHabit = async (habitId: string, xpValue: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('daily_habit_logs')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          xp_earned: xpValue
        });

      if (error) throw error;

      // Update local state
      setDailyCompletions(prev => [...prev, habitId]);
      
      // Update user XP
      await supabase.rpc('update_user_xp', {
        p_user_id: user.id,
        xp_to_add: xpValue
      });

      toast.success(`Habit completed! +${xpValue} XP`);
      
      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Failed to complete habit');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LevelUp ⚔️
            </h1>
            <p className="text-gray-300 text-lg">
              Welcome back, {userProfile?.full_name || 'Hunter'}!
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-purple-500/30 text-white hover:bg-purple-600/20"
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 text-sm">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userProfile?.current_level || 1}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userProfile?.current_xp || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-400 text-sm">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userProgress?.current_streak || 0} days
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-400 text-sm">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userProgress?.total_habits_completed || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Habits */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Today's Habits</CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <p className="text-gray-400">No active habits. Create some habits to get started!</p>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => {
                  const isCompleted = dailyCompletions.includes(habit.id);
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-white font-medium">{habit.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {habit.attribute}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {habit.difficulty}
                            </Badge>
                            <span className="text-green-400 text-xs">+{habit.xp_value} XP</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => completeHabit(habit.id, habit.xp_value)}
                        disabled={isCompleted}
                        className={isCompleted 
                          ? "bg-green-600 text-white cursor-not-allowed" 
                          : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        }
                      >
                        {isCompleted ? '✓ Completed' : 'Complete'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
