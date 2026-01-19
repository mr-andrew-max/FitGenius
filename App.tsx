import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import WorkoutPlanView from './components/WorkoutPlan';
import NutritionPlanView from './components/NutritionPlan';
import ChatCoach from './components/ChatCoach';
import ProgressView from './components/ProgressView';
import { UserProfile, WorkoutPlan, NutritionPlan } from './types';
import { generateWorkoutPlan, generateNutritionPlan } from './services/geminiService';
import { Dumbbell, Utensils, MessageSquare, Loader2, RefreshCw, BarChart3, Trash2 } from 'lucide-react';

enum Tab {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  COACH = 'coach',
  PROGRESS = 'progress'
}

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

const LoadingView: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
      <Loader2 size={48} className="text-emerald-500 animate-spin relative z-10" />
    </div>
    <p className="text-zinc-400 text-sm">{message}</p>
  </div>
);

const ErrorView: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="text-red-400 font-semibold">{message}</div>
    <button 
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-white text-sm"
    >
      <RefreshCw size={16} /> Retry
    </button>
  </div>
);

const App: React.FC = () => {
  // --- Persistence Wrappers ---
  const loadState = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Failed to load ${key}`, e);
      return fallback;
    }
  };

  // --- State ---
  const [profile, setProfile] = useState<UserProfile | null>(() => loadState('fitgenius_profile', null));
  
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(() => loadState('fitgenius_workout_plan', null));
  const [workoutStatus, setWorkoutStatus] = useState<LoadStatus>(() => workoutPlan ? 'success' : 'idle');
  
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(() => loadState('fitgenius_nutrition_plan', null));
  const [nutritionStatus, setNutritionStatus] = useState<LoadStatus>(() => nutritionPlan ? 'success' : 'idle');

  const [activeTab, setActiveTab] = useState<Tab>(() => loadState('fitgenius_active_tab', Tab.WORKOUT));

  // --- Effects for Persistence ---
  useEffect(() => {
    if (profile) localStorage.setItem('fitgenius_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (workoutPlan) localStorage.setItem('fitgenius_workout_plan', JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    if (nutritionPlan) localStorage.setItem('fitgenius_nutrition_plan', JSON.stringify(nutritionPlan));
  }, [nutritionPlan]);

  useEffect(() => {
    localStorage.setItem('fitgenius_active_tab', activeTab);
  }, [activeTab]);

  // --- Handlers ---

  const fetchWorkout = async (userProfile: UserProfile) => {
    setWorkoutStatus('loading');
    // We do NOT clear progress here automatically anymore to allow regeneration without data loss,
    // unless the user explicitly resets from settings (feature for later).
    try {
      const plan = await generateWorkoutPlan(userProfile);
      setWorkoutPlan(plan);
      setWorkoutStatus('success');
    } catch (err) {
      console.error(err);
      setWorkoutStatus('error');
    }
  };

  const fetchNutrition = async (userProfile: UserProfile) => {
    setNutritionStatus('loading');
    try {
      const plan = await generateNutritionPlan(userProfile);
      setNutritionPlan(plan);
      setNutritionStatus('success');
    } catch (err) {
      console.error(err);
      setNutritionStatus('error');
    }
  };

  const handleOnboardingComplete = (userProfile: UserProfile) => {
    setProfile(userProfile);
    // Trigger generation
    fetchWorkout(userProfile);
    fetchNutrition(userProfile);
  };

  const handleResetApp = () => {
      if (confirm("Are you sure you want to reset everything? This will delete your profile and plans.")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  // --- Render ---

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Dumbbell className="text-black" size={18} />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden sm:inline">FitGenius AI</span>
                </div>
                
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab(Tab.WORKOUT)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === Tab.WORKOUT 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                        <Dumbbell size={16} /> 
                        <span className="hidden md:inline">Workout</span>
                        {workoutStatus === 'loading' && <Loader2 size={12} className="animate-spin text-emerald-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab(Tab.NUTRITION)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === Tab.NUTRITION
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                        <Utensils size={16} /> 
                        <span className="hidden md:inline">Nutrition</span>
                        {nutritionStatus === 'loading' && <Loader2 size={12} className="animate-spin text-emerald-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab(Tab.PROGRESS)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === Tab.PROGRESS
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                        <BarChart3 size={16} /> <span className="hidden md:inline">Progress</span>
                    </button>
                    <button
                        onClick={() => setActiveTab(Tab.COACH)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === Tab.COACH 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                    >
                        <MessageSquare size={16} /> <span className="hidden md:inline">Coach</span>
                    </button>
                </div>
                
                <button 
                    onClick={handleResetApp}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Reset App Data"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === Tab.WORKOUT && (
                <div className="animate-in fade-in duration-300">
                    {workoutStatus === 'loading' && <LoadingView message="Designing your optimal training split..." />}
                    {workoutStatus === 'error' && <ErrorView message="Failed to generate workout." onRetry={() => fetchWorkout(profile)} />}
                    {workoutStatus === 'success' && workoutPlan && <WorkoutPlanView plan={workoutPlan} />}
                </div>
            )}
            
            {activeTab === Tab.NUTRITION && (
                 <div className="animate-in fade-in duration-300">
                    {nutritionStatus === 'loading' && <LoadingView message="Calculating metabolic requirements & meal plan..." />}
                    {nutritionStatus === 'error' && <ErrorView message="Failed to generate nutrition plan." onRetry={() => fetchNutrition(profile)} />}
                    {nutritionStatus === 'success' && nutritionPlan && <NutritionPlanView plan={nutritionPlan} />}
                </div>
            )}

            {activeTab === Tab.PROGRESS && (
                 <div className="animate-in fade-in duration-300">
                    <ProgressView workoutPlan={workoutPlan} />
                </div>
            )}

            {activeTab === Tab.COACH && profile && (
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Titan AI Coach</h2>
                        <p className="text-zinc-400">Ask specific questions about your generated plan or form.</p>
                        {(workoutStatus === 'loading' || nutritionStatus === 'loading') && (
                            <p className="text-xs text-emerald-500 mt-2 animate-pulse">
                                Analyzing your profile to generate custom plans...
                            </p>
                        )}
                    </div>
                    <ChatCoach 
                        profile={profile} 
                        workoutPlan={workoutPlan} 
                        nutritionPlan={nutritionPlan} 
                    />
                </div>
            )}
        </main>
    </div>
  );
};

export default App;