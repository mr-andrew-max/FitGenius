import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { WorkoutPlan } from '../types';
import { Scale, TrendingUp, Calendar, Trophy, Plus, History } from 'lucide-react';

interface Props {
  workoutPlan: WorkoutPlan | null;
}

interface WeightEntry {
  date: string;
  weight: number;
}

const ProgressView: React.FC<Props> = ({ workoutPlan }) => {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fitgenius_weight_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [progressData, setProgressData] = useState<any>(null);

  // Load progress for adherence chart
  useEffect(() => {
    if (!workoutPlan) return;

    const savedProgress = localStorage.getItem('fitgenius_workout_progress');
    const progressMap = savedProgress ? JSON.parse(savedProgress) : {};

    let completedDays = 0;
    const totalDays = workoutPlan.schedule.length;

    workoutPlan.schedule.forEach((day, index) => {
      if (day.exercises.length === 0) {
        // Rest day
        if (progressMap[`d${index}-rest`]) completedDays++;
      } else {
        // Workout day - check if all exercises are done
        const allExercisesComplete = day.exercises.every((_, exIndex) => 
          progressMap[`d${index}-e${exIndex}`]
        );
        if (allExercisesComplete) completedDays++;
      }
    });

    setProgressData({ completed: completedDays, total: totalDays });
  }, [workoutPlan]);

  const handleAddWeight = () => {
    if (!currentWeight) return;
    const val = parseFloat(currentWeight);
    if (isNaN(val)) return;

    const newEntry = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: val
    };

    const updatedHistory = [...weightHistory, newEntry];
    // Keep only last 30 entries for cleanliness if needed, or sort
    setWeightHistory(updatedHistory);
    localStorage.setItem('fitgenius_weight_history', JSON.stringify(updatedHistory));
    setCurrentWeight('');
  };

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : '--';
  const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : '--';
  
  // Calculate change
  let weightChange = 0;
  if (weightHistory.length >= 2) {
      weightChange = weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight;
  }

  return (
    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-zinc-500 text-sm font-medium">Current Weight</p>
                <h3 className="text-3xl font-bold text-white mt-1">{latestWeight} <span className="text-base font-normal text-zinc-500">kg</span></h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Scale size={24} />
            </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-zinc-500 text-sm font-medium">Total Change</p>
                <h3 className={`text-3xl font-bold mt-1 ${weightChange <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} <span className="text-base font-normal text-zinc-500">kg</span>
                </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                <TrendingUp size={24} />
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-zinc-500 text-sm font-medium">Plan Adherence</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                    {progressData ? Math.round((progressData.completed / progressData.total) * 100) : 0}%
                </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Trophy size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Chart Section */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="text-emerald-500" size={20} /> Weight History
            </h3>
            <div className="flex gap-2">
                <input 
                    type="number" 
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="kg" 
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white w-24 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <button 
                    onClick={handleAddWeight}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {weightHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightHistory}>
                    <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#71717a" 
                        tick={{fill: '#71717a', fontSize: 12}} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#71717a" 
                        tick={{fill: '#71717a', fontSize: 12}} 
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        itemStyle={{ color: '#10b981' }}
                        labelStyle={{ color: '#a1a1aa' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorWeight)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <Scale size={48} className="mb-4 opacity-20" />
                    <p>No weight data logged yet.</p>
                </div>
            )}
          </div>
        </div>

        {/* Plan Completion Donut */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-amber-500" size={20} /> Current Plan
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center relative">
                {progressData ? (
                   <>
                    <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="#27272a"
                            strokeWidth="12"
                            fill="transparent"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="#f59e0b"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - progressData.completed / Math.max(1, progressData.total))}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{progressData.completed}</span>
                        <span className="text-zinc-500 text-sm uppercase tracking-wider">of {progressData.total} Days</span>
                    </div>
                   </> 
                ) : (
                    <div className="text-zinc-500">No active plan</div>
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-zinc-400 text-sm">
                    {progressData && progressData.completed === progressData.total 
                        ? "🎉 Plan Completed! Great job!"
                        : "Keep pushing! Consistency is key."}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;