import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { WorkoutPlan } from '../types';
import { Scale, TrendingUp, Calendar, Trophy, Plus, History, Flame, Timer, Dumbbell, Trash2, X } from 'lucide-react';

interface Props {
  workoutPlan: WorkoutPlan | null;
}

interface WeightEntry {
  date: string;
  weight: number;
}

interface PersonalRecord {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

const ProgressView: React.FC<Props> = ({ workoutPlan }) => {
  // State for Weight
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fitgenius_weight_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [currentWeight, setCurrentWeight] = useState<string>('');

  // State for PRs
  const [prs, setPrs] = useState<PersonalRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fitgenius_prs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showAddPr, setShowAddPr] = useState(false);
  const [newPr, setNewPr] = useState({ exercise: '', weight: '', reps: '' });

  // State for Metrics
  const [progressData, setProgressData] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  // Load Metrics
  useEffect(() => {
    // 1. Calculate Plan Adherence & Total Duration
    if (workoutPlan) {
      const savedProgress = localStorage.getItem('fitgenius_workout_progress');
      const progressMap = savedProgress ? JSON.parse(savedProgress) : {};

      let completedDays = 0;
      let minutes = 0;
      const totalDays = workoutPlan.schedule.length;

      workoutPlan.schedule.forEach((day, index) => {
        let isDayDone = false;
        if (day.exercises.length === 0) {
          if (progressMap[`d${index}-rest`]) isDayDone = true;
        } else {
          const allExercisesComplete = day.exercises.every((_, exIndex) => 
            progressMap[`d${index}-e${exIndex}`]
          );
          if (allExercisesComplete) isDayDone = true;
        }

        if (isDayDone) {
          completedDays++;
          minutes += day.durationMinutes || 0;
        }
      });

      setProgressData({ completed: completedDays, total: totalDays });
      setTotalMinutes(minutes);
    }

    // 2. Calculate Streak from Nutrition History (Proxy for Daily Activity)
    const savedHistory = localStorage.getItem('fitgenius_history');
    if (savedHistory) {
        const history: { date: string }[] = JSON.parse(savedHistory);
        // Sort by date (assuming current year roughly)
        // We'll simplisticly map "Oct 27" to a timestamp assuming current year
        const currentYear = new Date().getFullYear();
        
        const sortedDates = history.map(h => {
            const d = new Date(`${h.date}, ${currentYear}`);
            // If date is in future (e.g. Dec in Jan), subtract a year. 
            // Simple logic: just use current year.
            return d.getTime();
        }).sort((a, b) => b - a); // Descending

        if (sortedDates.length > 0) {
            let currentStreak = 0;
            const today = new Date();
            today.setHours(0,0,0,0);
            
            // Check if last entry is today or yesterday
            const lastEntry = new Date(sortedDates[0]);
            lastEntry.setHours(0,0,0,0);
            
            const diffTime = Math.abs(today.getTime() - lastEntry.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays <= 1) {
                currentStreak = 1;
                let prevDate = lastEntry;

                for (let i = 1; i < sortedDates.length; i++) {
                    const currentDate = new Date(sortedDates[i]);
                    currentDate.setHours(0,0,0,0);
                    
                    const gap = (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
                    if (Math.round(gap) === 1) {
                        currentStreak++;
                        prevDate = currentDate;
                    } else if (Math.round(gap) === 0) {
                        // Same day, skip
                        continue;
                    } else {
                        break;
                    }
                }
            }
            setStreak(currentStreak);
        }
    }
  }, [workoutPlan]);

  // Weight Handlers
  const handleAddWeight = () => {
    if (!currentWeight) return;
    const val = parseFloat(currentWeight);
    if (isNaN(val)) return;

    const newEntry = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: val
    };

    const updatedHistory = [...weightHistory, newEntry];
    setWeightHistory(updatedHistory);
    localStorage.setItem('fitgenius_weight_history', JSON.stringify(updatedHistory));
    setCurrentWeight('');
  };

  // PR Handlers
  const handleAddPr = () => {
    if (!newPr.exercise || !newPr.weight || !newPr.reps) return;
    
    const entry: PersonalRecord = {
      id: Date.now().toString(),
      exercise: newPr.exercise,
      weight: parseFloat(newPr.weight),
      reps: parseInt(newPr.reps),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    const updatedPrs = [entry, ...prs];
    setPrs(updatedPrs);
    localStorage.setItem('fitgenius_prs', JSON.stringify(updatedPrs));
    setNewPr({ exercise: '', weight: '', reps: '' });
    setShowAddPr(false);
  };

  const handleDeletePr = (id: string) => {
    const updatedPrs = prs.filter(p => p.id !== id);
    setPrs(updatedPrs);
    localStorage.setItem('fitgenius_prs', JSON.stringify(updatedPrs));
  };

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : '--';
  let weightChange = 0;
  if (weightHistory.length >= 2) {
      weightChange = weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight;
  }

  return (
    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-zinc-500 text-sm font-medium">Activity Streak</p>
                <h3 className="text-3xl font-bold text-white mt-1">{streak} <span className="text-base font-normal text-zinc-500">days</span></h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 relative z-10">
                <Flame size={24} className={streak > 0 ? "animate-pulse" : ""} />
            </div>
            {streak > 2 && <div className="absolute -bottom-4 -right-4 text-orange-500/5 rotate-12 transform scale-150"><Flame size={120} /></div>}
        </div>

        {/* Time Trained */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-zinc-500 text-sm font-medium">Time Trained</p>
                <h3 className="text-3xl font-bold text-white mt-1">{totalMinutes} <span className="text-base font-normal text-zinc-500">min</span></h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Timer size={24} />
            </div>
        </div>
        
        {/* Weight Change */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-zinc-500 text-sm font-medium">Weight Change</p>
                <h3 className={`text-3xl font-bold mt-1 ${weightChange <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} <span className="text-base font-normal text-zinc-500">kg</span>
                </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                <TrendingUp size={24} />
            </div>
        </div>

        {/* Adherence */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-zinc-500 text-sm font-medium">Plan Adherence</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                    {progressData ? Math.round((progressData.completed / Math.max(1, progressData.total)) * 100) : 0}%
                </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Trophy size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weight Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="text-emerald-500" size={20} /> Weight History
            </h3>
            <div className="flex gap-2">
                <input 
                    type="number" 
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="kg" 
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white w-24 focus:ring-2 focus:ring-emerald-500 outline-none text-sm placeholder:text-zinc-600"
                />
                <button 
                    onClick={handleAddWeight}
                    disabled={!currentWeight}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
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
                    <p>Log your weight to see progress.</p>
                </div>
            )}
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Dumbbell className="text-purple-500" size={20} /> Personal Bests
                </h3>
                <button 
                    onClick={() => setShowAddPr(!showAddPr)}
                    className={`p-2 rounded-lg transition-colors ${showAddPr ? 'bg-zinc-800 text-zinc-400' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                >
                    {showAddPr ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {showAddPr && (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-4 animate-in slide-in-from-top-2">
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Exercise (e.g., Bench Press)"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={newPr.exercise}
                            onChange={e => setNewPr({...newPr, exercise: e.target.value})}
                        />
                        <div className="flex gap-3">
                            <input 
                                type="number" 
                                placeholder="Kg"
                                className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                value={newPr.weight}
                                onChange={e => setNewPr({...newPr, weight: e.target.value})}
                            />
                            <input 
                                type="number" 
                                placeholder="Reps"
                                className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                value={newPr.reps}
                                onChange={e => setNewPr({...newPr, reps: e.target.value})}
                            />
                        </div>
                        <button 
                            onClick={handleAddPr}
                            disabled={!newPr.exercise || !newPr.weight || !newPr.reps}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Save Record
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[400px]">
                {prs.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        <Trophy size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No records yet.<br/>Log your heaviest lifts!</p>
                    </div>
                ) : (
                    prs.map(pr => (
                        <div key={pr.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-between items-center group hover:border-zinc-700 transition-colors">
                            <div>
                                <h4 className="font-bold text-zinc-200">{pr.exercise}</h4>
                                <div className="text-sm text-zinc-500 mt-0.5">
                                    {pr.weight}kg <span className="text-zinc-600">×</span> {pr.reps} reps
                                </div>
                                <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wide">{pr.date}</div>
                            </div>
                            <button 
                                onClick={() => handleDeletePr(pr.id)}
                                className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProgressView;