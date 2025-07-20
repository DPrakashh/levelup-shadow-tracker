import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddHabitModalProps {
  onHabitAdded: () => void;
}

const AddHabitModal = ({ onHabitAdded }: AddHabitModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    attribute: '',
    difficulty: ''
  });

  const attributes = [
    { value: 'brain', label: 'Brain 🧠', description: 'Learning, reading, studying' },
    { value: 'health', label: 'Health 💪', description: 'Exercise, nutrition, wellness' },
    { value: 'skill', label: 'Skill ⚔️', description: 'Crafts, coding, music' },
    { value: 'discipline', label: 'Discipline 🧘', description: 'Meditation, habits, willpower' },
    { value: 'focus', label: 'Focus 🎯', description: 'Concentration, deep work' }
  ];

  const difficulties = [
    { value: 'trivial', label: 'Trivial', xp: 5, description: '5 XP - Very easy, daily basics' },
    { value: 'easy', label: 'Easy', xp: 10, description: '10 XP - Simple but meaningful' },
    { value: 'medium', label: 'Medium', xp: 15, description: '15 XP - Moderate effort required' },
    { value: 'hard', label: 'Hard', xp: 20, description: '20 XP - Challenging, requires dedication' }
  ];

  const getXPValue = (difficulty: string) => {
    const difficultyObj = difficulties.find(d => d.value === difficulty);
    return difficultyObj?.xp || 5;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.name.trim() || !formData.attribute || !formData.difficulty) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          attribute: formData.attribute,
          difficulty: formData.difficulty,
          xp_value: getXPValue(formData.difficulty),
          is_active: true
        });

      if (error) throw error;

      toast.success('Habit created successfully!');
      setFormData({ name: '', attribute: '', difficulty: '' });
      setOpen(false);
      onHabitAdded();
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create New Habit
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Habit Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Read for 30 minutes"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Attribute</Label>
            <Select 
              value={formData.attribute} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, attribute: value }))}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Choose an attribute" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {attributes.map((attr) => (
                  <SelectItem key={attr.value} value={attr.value} className="text-white hover:bg-slate-700">
                    <div>
                      <div className="font-medium">{attr.label}</div>
                      <div className="text-xs text-gray-400">{attr.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Difficulty</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Choose difficulty level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {difficulties.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value} className="text-white hover:bg-slate-700">
                    <div>
                      <div className="font-medium">{diff.label}</div>
                      <div className="text-xs text-gray-400">{diff.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.difficulty && (
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-600">
              <div className="text-sm text-gray-300">
                <strong>XP Reward:</strong> +{getXPValue(formData.difficulty)} XP per completion
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHabitModal;