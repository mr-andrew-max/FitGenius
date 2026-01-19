import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import WorkoutPlanView from './components/WorkoutPlan';
import NutritionPlanView from './components/NutritionPlan';
import ChatCoach from './components/ChatCoach';
import { UserProfile, WorkoutPlan, NutritionPlan } from './types';
import { generateWorkoutPlan, generateNutritionPlan } from './services/geminiService';
import { Dumbbell, Utensils, MessageSquare, Loader2, RefreshCw } from 'lucide-react';

enum Tab {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  COACH = 'coach'
}

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.WORKOUT);

  const handleOnboardingComplete = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setIsGenerating(true);
    setError(null);

    try {
      // Parallel generation for speed
      const [wPlan, nPlan] = await Promise.all([
        generateWorkoutPlan(userProfile),
        generateNutritionPlan(userProfile)
      ]);
      setWorkoutPlan(wPlan);
      setNutritionPlan(nPlan);
    } catch (err) {
      console.error(err);
      setError("Failed to generate your plan. Please check your internet or API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const retry = () => {
    if (profile) handleOnboardingComplete(profile);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 size={64} className="text-emerald-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Constructing your program...</h2>
            <p className="text-zinc-400">Analyzing body metrics • Calculating macros • Designing splits</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4 bg-zinc-900 p-8 rounded-2xl border border-red-900/50">
          <h2 className="text-xl font-bold text-red-400">Generation Error</h2>
          <p className="text-zinc-400">{error}</p>
          <button 
            onClick={retry}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <RefreshCw size={20} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Dumbbell className="text-black" size={18} />
                    </div>
                    <span className="font-bold text-xl tracking-tight">FitGenius AI</span>
                </div>
                
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                        onClick={() => setActiveTab(Tab.WORKOUT)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === Tab.WORKOUT 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                        <Dumbbell size={16} /> <span className="hidden sm:inline">Workout</span>
                    </button>
                    <button
                        onClick={() => setActiveTab(Tab.NUTRITION)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === Tab.NUTRITION
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                        <Utensils size={16} /> <span className="hidden sm:inline">Nutrition</span>
                    </button>
                    <button
                        onClick={() => setActiveTab(Tab.COACH)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === Tab.COACH 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                        <MessageSquare size={16} /> <span className="hidden sm:inline">Coach</span>
                    </button>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === Tab.WORKOUT && workoutPlan && (
                <WorkoutPlanView plan={workoutPlan} />
            )}
            
            {activeTab === Tab.NUTRITION && nutritionPlan && (
                <NutritionPlanView plan={nutritionPlan} />
            )}

            {activeTab === Tab.COACH && profile && (
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Titan AI Coach</h2>
                        <p className="text-zinc-400">Ask specific questions about your generated plan or form.</p>
                    </div>
                    <ChatCoach profile={profile} />
                </div>
            )}
        </main>
    </div>
  );
};

export default App;