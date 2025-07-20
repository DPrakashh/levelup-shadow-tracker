import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
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

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: (habitId: string, xpValue: number) => void;
  onDelete: () => void;
  userId: string;
}

const HabitCard = ({ habit, isCompleted, onComplete, onDelete, userId }: HabitCardProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habit.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Habit deleted successfully');
      onDelete();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    } finally {
      setDeleting(false);
    }
  };

  const getAttributeColor = (attribute: string) => {
    switch (attribute) {
      case 'brain': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'health': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'skill': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'discipline': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'focus': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'easy': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex-1">
          <h3 className="text-white font-medium mb-2">{habit.name}</h3>
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs border ${getAttributeColor(habit.attribute)}`}>
              {habit.attribute}
            </Badge>
            <Badge className={`text-xs border ${getDifficultyColor(habit.difficulty)}`}>
              {habit.difficulty}
            </Badge>
            <span className="text-green-400 text-xs font-medium">+{habit.xp_value} XP</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onComplete(habit.id, habit.xp_value)}
          disabled={isCompleted}
          size="sm"
          className={isCompleted 
            ? "bg-green-600 text-white cursor-not-allowed hover:bg-green-600" 
            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          }
        >
          {isCompleted ? '✓ Completed' : 'Complete'}
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-900 border-red-500/30 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400">Delete Habit</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete "{habit.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600 text-white hover:bg-slate-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default HabitCard;