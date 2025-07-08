
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Award, Star, Target, Zap, Crown } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LevelUp ⚔️
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors">How it Works</a>
            </div>
            <div className="flex space-x-4">
              <Link to="/sign-in">
                <Button variant="ghost" className="text-white hover:text-purple-400">
                  Login
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Level Up Your Life Like an RPG
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Complete habits. Earn XP. Become the best version of yourself. Transform your daily routine into an epic adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4">
                Sign Up with Email
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-4">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Habit Tracking with XP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Turn every completed habit into XP points. Watch your progress grow as you level up your life, one habit at a time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Customizable Attributes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Focus on Brain 🧠, Health 💪, Skill ⚔️, Discipline 🧘, and Focus 🎯. Build a balanced character across all life areas.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Real-time Progress & Ranks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Climb the ranks from E-Rank to Universal Hunter. Track your streaks and celebrate every milestone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          How It Works
        </h2>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">Set Your Habits</h3>
              <p className="text-gray-400 text-lg">
                Define 5 custom habits that align with your goals. Choose their difficulty and attribute focus.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">Complete Daily Quests</h3>
              <p className="text-gray-400 text-lg">
                Check off habits as you complete them. Each completion earns XP based on difficulty.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">Level Up & Rank Up</h3>
              <p className="text-gray-400 text-lg">
                Watch your XP grow, level increase, and rank climb from E-Rank to Universal Hunter!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Choose Your Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Free Forever</h3>
                <div className="text-4xl font-bold text-green-400 mb-4">$0</div>
                <p className="text-gray-400">Perfect for getting started</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Up to 5 custom habits</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">XP tracking & leveling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Basic rank system</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">7-day habit history</span>
                </div>
              </div>
              <Link to="/sign-up" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-bold">
              Coming Soon
            </div>
            <CardHeader>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                <div className="text-4xl font-bold text-purple-400 mb-4">$9<span className="text-lg">/mo</span></div>
                <p className="text-gray-400">For serious habit builders</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Unlimited habits</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Custom themes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Unlimited history</span>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-purple-500/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              LevelUp ⚔️
            </div>
            <div className="flex justify-center space-x-8 text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
            </div>
            <p className="text-gray-500 mt-4">
              © 2024 LevelUp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
