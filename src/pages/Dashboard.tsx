
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AddHabitModal from '@/components/habits/AddHabitModal';
import HabitCard from '@/components/habits/HabitCard';
import { Swords, Shield } from 'lucide-react';

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
  const { isAdmin } = useRole();
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
      
      // Set up real-time subscription for habit completion updates
      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_habit_logs',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh data when habit logs change
            fetchUserData();
            fetchDailyCompletions();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_progress',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh user progress when it changes
            fetchUserData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh profile when it changes
            fetchUserData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-app-blue to-app-purple bg-clip-text text-transparent">
              LevelUp ⚔️
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back, {userProfile?.full_name || 'Hunter'}!
            </p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-app-red/30 text-app-red hover:bg-app-red/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-app-purple/30 text-app-purple hover:bg-app-purple/20"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/40 border-app-purple/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-app-blue text-sm">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {userProfile?.current_level || 1}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-app-purple/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-app-green text-sm">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {userProfile?.current_xp || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-app-purple/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-app-orange text-sm">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {userProgress?.current_streak || 0} days
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-app-purple/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-app-purple text-sm">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {userProgress?.total_habits_completed || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Habits Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Habits */}
          <div className="lg:col-span-2">
            <Card className="bg-card/40 border-app-purple/30">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-card-foreground text-xl flex items-center gap-2">
                    <Swords className="w-5 h-5" />
                    Today's Habits
                  </CardTitle>
                  <AddHabitModal onHabitAdded={fetchHabits} />
                </div>
              </CardHeader>
              <CardContent>
                {habits.length === 0 ? (
                  <div className="text-center py-8">
                    <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No active habits yet</p>
                    <p className="text-sm text-muted-foreground/70">Create your first habit to start your journey!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {habits.map((habit) => {
                      const isCompleted = dailyCompletions.includes(habit.id);
                      return (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          isCompleted={isCompleted}
                          onComplete={completeHabit}
                          onDelete={fetchHabits}
                          userId={user?.id || ''}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-card/40 border-app-blue/30">
              <CardHeader>
                <CardTitle className="text-card-foreground text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate('/skills')}
                  variant="outline"
                  className="w-full border-app-blue/30 text-app-blue hover:bg-app-blue/20"
                >
                  View Skills & Attributes
                </Button>
                <Button
                  onClick={() => navigate('/onboarding')}
                  variant="outline"
                  className="w-full border-app-purple/30 text-app-purple hover:bg-app-purple/20"
                >
                  Character Setup
                </Button>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card className="bg-card/40 border-app-green/30">
              <CardHeader>
                <CardTitle className="text-card-foreground text-lg">Progress Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily Progress</span>
                    <span className="text-app-green">
                      {dailyCompletions.length}/{habits.length}
                    </span>
                  </div>
                  <Progress 
                    value={habits.length > 0 ? (dailyCompletions.length / habits.length) * 100 : 0}
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-card-foreground">
                      {userProgress?.current_streak || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-card-foreground">
                      {userProgress?.total_habits_completed || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Done</div>
                  </div>
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
