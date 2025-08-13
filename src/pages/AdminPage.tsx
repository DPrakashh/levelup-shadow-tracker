import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Users, Trash2, RotateCcw, Eye, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  full_name: string;
  email: string;
  current_level: number;
  current_xp: number;
  created_at: string;
  role?: string;
  total_habits_completed?: number;
  current_streak?: number;
}

const AdminPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with their profiles and roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          current_level,
          current_xp,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, total_habits_completed, current_streak');

      if (progressError) throw progressError;

      // Combine the data
      const combinedUsers = profilesData?.map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.user_id);
        const userProgress = progressData?.find(progress => progress.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          current_level: profile.current_level || 1,
          current_xp: profile.current_xp || 0,
          created_at: profile.created_at,
          role: userRole?.role || 'user',
          total_habits_completed: userProgress?.total_habits_completed || 0,
          current_streak: userProgress?.current_streak || 0,
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setActionLoading(userId);
      
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });

      if (error) throw error;

      toast.success(`User ${userEmail} deleted successfully`);
      await fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const resetUserProgress = async (userId: string, userEmail: string) => {
    try {
      setActionLoading(userId);
      
      const { error } = await supabase.rpc('admin_reset_user_progress', {
        target_user_id: userId
      });

      if (error) throw error;

      toast.success(`Progress reset for ${userEmail}`);
      await fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error resetting user progress:', error);
      toast.error(error.message || 'Failed to reset user progress');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-400" />
                Admin Control Center
              </h1>
              <p className="text-gray-300 text-lg">
                Manage users and their progress
              </p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-purple-500/30 text-white hover:bg-purple-600/20"
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.current_streak > 0).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-400 text-sm">Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Eye className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-white">Loading users...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((userData) => (
                  <Card key={userData.id} className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                        {/* User Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium">
                              {userData.full_name}
                            </h3>
                            <Badge 
                              variant={userData.role === 'admin' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {userData.role}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{userData.email}</p>
                          <p className="text-gray-500 text-xs">
                            Joined: {formatDate(userData.created_at)}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <div className="text-lg font-bold text-white">
                              {userData.current_level}
                            </div>
                            <div className="text-xs text-gray-400">Level</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">
                              {userData.current_xp}
                            </div>
                            <div className="text-xs text-gray-400">XP</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">
                              {userData.current_streak}
                            </div>
                            <div className="text-xs text-gray-400">Streak</div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">
                            {userData.total_habits_completed}
                          </div>
                          <div className="text-xs text-gray-400">Habits Completed</div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                          {userData.id !== user?.id && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-500/30 text-orange-400 hover:bg-orange-600/20"
                                    disabled={actionLoading === userData.id}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-slate-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      Reset User Progress
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      This will reset all progress for {userData.full_name} ({userData.email}). 
                                      Their XP, level, streaks, and habit completion logs will be cleared. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-slate-600 text-white hover:bg-slate-800">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => resetUserProgress(userData.id, userData.email)}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      Reset Progress
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500/30 text-red-400 hover:bg-red-600/20"
                                    disabled={actionLoading === userData.id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-slate-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      Delete User Account
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      This will permanently delete {userData.full_name} ({userData.email}) 
                                      and all their data including habits, progress, and logs. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-slate-600 text-white hover:bg-slate-800">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser(userData.id, userData.email)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {userData.id === user?.id && (
                            <Badge variant="outline" className="border-green-500/30 text-green-400">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mt-6 bg-blue-900/20 border-blue-500/30">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Admin Privileges:</strong> You can view all users, delete accounts, and reset progress. 
            Use these powers responsibly. You cannot delete your own account from this interface.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AdminPage;