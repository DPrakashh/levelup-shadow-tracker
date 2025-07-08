
import React, { useState } from 'react';
import { Brain, Award, Star, Flame, ArrowUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [habits, setHabits] = useState([
    { id: 1, title: "Study for 1 hour", attribute: "brain", difficulty: "Medium", completed: false, xp: 15 },
    { id: 2, title: "Exercise 30 mins", attribute: "health", difficulty: "Hard", completed: true, xp: 20 },
    { id: 3, title: "Read 20 pages", attribute: "skill", difficulty: "Easy", completed: false, xp: 10 },
    { id: 4, title: "Practice coding", attribute: "skill", difficulty: "Hard", completed: false, xp: 25 },
    { id: 5, title: "Meditate 10 mins", attribute: "brain", difficulty: "Easy", completed: true, xp: 8 }
  ]);

  const [userStats] = useState({
    name: "Krish",
    currentXP: 320,
    currentLevel: 8,
    currentRank: "C-Rank",
    nextLevelXP: 400,
    streak: 3,
    yesterdayLevel: 7,
    todayXP: 28
  });

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const getAttributeIcon = (attribute: string) => {
    switch (attribute) {
      case 'brain': return <Brain className="w-5 h-5 text-blue-400" />;
      case 'health': return <Star className="w-5 h-5 text-green-400" />;
      case 'skill': return <Award className="w-5 h-5 text-purple-400" />;
      default: return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const progressPercentage = (userStats.currentXP / userStats.nextLevelXP) * 100;
  const completedHabits = habits.filter(habit => habit.completed).length;

  const ranks = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank', 'Shadow', 'Monarch', 'Universal Hunter'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LevelUp ⚔️
          </h1>
          <p className="text-xl text-gray-300 mt-2">
            Welcome back, {userStats.name} 👋
          </p>
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
                <p className="text-gray-400">Complete your daily habits to gain XP and rank up!</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
                      habit.completed 
                        ? 'bg-green-500/10 border-green-500/30 shadow-green-500/20' 
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                    } shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            habit.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-500 hover:border-purple-400'
                          }`}
                        >
                          {habit.completed && '✓'}
                        </button>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            {getAttributeIcon(habit.attribute)}
                            <span className={`font-medium ${habit.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                              {habit.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getDifficultyColor(habit.difficulty)} text-xs`}>
                              {habit.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-400">+{habit.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 text-lg">
                  Log Today's Progress ⚡
                </Button>
              </CardContent>
            </Card>

            {/* Daily Growth Overview */}
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <ArrowUser className="w-5 h-5 text-blue-400" />
                  Daily Growth Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Yesterday</p>
                    <p className="text-2xl font-bold text-gray-300">Level {userStats.yesterdayLevel}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
                    <p className="text-gray-400 text-sm">Today</p>
                    <p className="text-2xl font-bold text-blue-300">Level {userStats.currentLevel}</p>
                  </div>
                  <div className="text-center p-4 bg-green-600/10 rounded-lg border border-green-500/30">
                    <p className="text-gray-400 text-sm">XP Earned Today</p>
                    <p className="text-2xl font-bold text-green-400">+{userStats.todayXP} XP</p>
                  </div>
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
                    {userStats.currentXP} XP
                  </div>
                  <div className="text-lg text-gray-300">Level {userStats.currentLevel}</div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-3 py-1">
                    {userStats.currentRank}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Progress to Level {userStats.currentLevel + 1}</span>
                    <span>{userStats.currentXP}/{userStats.nextLevelXP} XP</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-3 bg-slate-700"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-300 font-bold">{userStats.streak}-Day Streak</span>
                </div>

                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <p className="text-center text-sm text-gray-300 italic">
                    "Keep grinding, Shadow Hunter! 💪"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rank Ladder */}
            <Card className="bg-black/40 border-yellow-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">Rank Ladder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ranks.map((rank, index) => (
                    <div
                      key={rank}
                      className={`p-2 rounded text-center text-sm transition-all ${
                        rank === userStats.currentRank
                          ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-500/50 text-yellow-300 font-bold'
                          : index < ranks.indexOf(userStats.currentRank)
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-slate-800/30 text-gray-500'
                      }`}
                    >
                      {rank}
                      {rank === userStats.currentRank && ' 👑'}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-600/10 rounded-lg border border-blue-500/30">
                  <p className="text-xs text-blue-300 text-center">
                    Next Unlock at {userStats.nextLevelXP} XP: D-Rank
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{completedHabits}/5</div>
                  <div className="text-sm text-gray-400">Habits Completed Today</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
