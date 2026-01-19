import React, { useState, useEffect } from 'react';
import { NutritionPlan as NutritionPlanType, MacroSplit, Meal } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { 
  Apple, Utensils, Droplet, Flame, Plus, Minus, Info, 
  CheckCircle, Circle, Clock, Brain, Zap, Lightbulb, 
  History, X, Settings, Save, RotateCcw, Check, ChevronRight
} from 'lucide-react';

interface Props {
  plan: NutritionPlanType;
}

interface MealCardProps {
  meal: Meal;
  title: string;
  isConsumed: boolean;
  onToggle: () => void;
}

interface DailyStats {
  date: string;
  calories: number;
  protein: number;
  water: number;
}

const MealCard: React.FC<MealCardProps> = ({ meal, title, isConsumed, onToggle }) => (
  <div className={`border p-5 rounded-xl transition-all duration-300 ${
      isConsumed 
      ? 'bg-emerald-950/20 border-emerald-900/50' 
      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
  }`}>
    <div className="flex justify-between items-start mb-3">
      <h4 className={`text-sm font-bold uppercase tracking-wider ${isConsumed ? 'text-emerald-600' : 'text-emerald-400'}`}>{title}</h4>
      <button 
        onClick={onToggle}
        className={`transition-all duration-300 hover:scale-110 ${isConsumed ? 'text-emerald-500' : 'text-zinc-600 hover:text-emerald-500'}`}
        title={isConsumed ? "Mark as not eaten" : "Mark as eaten"}
      >
        {isConsumed ? <CheckCircle size={22} className="fill-emerald-500/10" /> : <Circle size={22} />}
      </button>
    </div>
    
    <div className={`transition-opacity duration-300 ${isConsumed ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
        <h3 className={`font-semibold text-lg mb-2 ${isConsumed ? 'text-zinc-400 line-through decoration-emerald-900/50' : 'text-white'}`}>{meal.name}</h3>
        <div className="flex gap-2 mb-3 text-xs">
             <span className="bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">{meal.calories} kcal</span>
             <span className="bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">{meal.protein}g pro</span>
        </div>
        <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside marker:text-emerald-600">
        {meal.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
        ))}
        </ul>
    </div>
  </div>
);

interface HydrationTrackerProps {
  intake: number;
  onUpdate: (amount: number) => void;
}

const HydrationTracker: React.FC<HydrationTrackerProps> = ({ intake, onUpdate }) => {
  const GOAL = 3000; // ml
  const percentage = Math.min(100, Math.round((intake / GOAL) * 100));
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomAdd = () => {
      const amount = parseInt(customAmount);
      if (!isNaN(amount) && amount > 0) {
          onUpdate(intake + amount);
          setCustomAmount('');
          setShowCustom(false);
      }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Droplet className="text-blue-500 fill-blue-500/20" /> Hydration
        </h3>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
           {percentage}%
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
         <div className="text-4xl font-bold text-white mb-1 transition-all">{intake}<span className="text-lg text-zinc-500 font-normal ml-1">ml</span></div>
         <div className="text-xs text-zinc-500">Target: {GOAL}ml</div>
      </div>

      <div className="w-full bg-zinc-950 rounded-full h-3 mb-6 overflow-hidden border border-zinc-800 relative z-10">
        <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out relative shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${percentage}%` }}
        >
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <button 
            onClick={() => onUpdate(Math.max(0, intake - 250))}
            disabled={intake === 0}
            className="flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
            <Minus size={16} /> 250ml
        </button>
        <button 
            onClick={() => onUpdate(intake + 250)}
            className="flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
        >
            <Plus size={16} /> 250ml
        </button>
      </div>

      <div className="mt-3 text-center relative z-10">
          {!showCustom ? (
            <button 
                onClick={() => setShowCustom(true)}
                className="text-xs text-zinc-500 hover:text-blue-400 transition-colors"
            >
                Add custom amount
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-bottom-2 fade-in">
                <input 
                    type="number" 
                    placeholder="ml" 
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    autoFocus
                />
                <button onClick={handleCustomAdd} className="bg-blue-600 text-white px-2 rounded hover:bg-blue-500"><Check size={14}/></button>
                <button onClick={() => setShowCustom(false)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
            </div>
          )}
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
          <Droplet size={150} />
      </div>
    </div>
  );
};

const GeneralTips = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500 border border-purple-500/20">
          <Clock size={20} />
        </div>
        <h4 className="font-bold text-white text-sm">Meal Prep Mastery</h4>
      </div>
      <p className="text-zinc-400 text-xs leading-relaxed">
        Cook bulk protein (chicken, tofu) and carbs (rice, oats) on Sundays. Store in glass containers for easy, consistent meals during busy weekdays.
      </p>
    </div>
    
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-pink-500/10 p-2 rounded-lg text-pink-500 border border-pink-500/20">
          <Brain size={20} />
        </div>
        <h4 className="font-bold text-white text-sm">Mindful Eating</h4>
      </div>
      <p className="text-zinc-400 text-xs leading-relaxed">
        Eat slowly without distractions. Chew thoroughly to improve digestion and give your body time to signal satiety, preventing overeating.
      </p>
    </div>

    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 border border-amber-500/20">
          <Zap size={20} />
        </div>
        <h4 className="font-bold text-white text-sm">Post-Workout</h4>
      </div>
      <p className="text-zinc-400 text-xs leading-relaxed">
        Consume a meal rich in protein and fast-digesting carbs within 30-60 minutes after training to replenish glycogen and kickstart muscle repair.
      </p>
    </div>
  </div>
);

const HistoryModal: React.FC<{ history: DailyStats[], onClose: () => void }> = ({ history, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <History className="text-emerald-500" /> Nutrition History
          </h2>
  
          {history.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              No history recorded yet. Start logging your meals!
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-4">Calorie Intake</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        cursor={{ fill: '#27272a' }}
                      />
                      <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} name="Calories" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
  
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-4">Hydration</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        cursor={{ fill: '#27272a' }}
                      />
                      <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Water (ml)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
               <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Daily Log</h3>
                   <div className="overflow-x-auto border border-zinc-800 rounded-lg">
                      <table className="w-full text-sm text-left text-zinc-400">
                          <thead className="text-xs text-zinc-500 uppercase bg-zinc-950">
                              <tr>
                                  <th className="px-6 py-3">Date</th>
                                  <th className="px-6 py-3">Calories</th>
                                  <th className="px-6 py-3">Protein</th>
                                  <th className="px-6 py-3">Water</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                              {history.slice().reverse().map((day, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-800/20">
                                      <td className="px-6 py-4 font-medium text-white">{day.date}</td>
                                      <td className="px-6 py-4">{day.calories} kcal</td>
                                      <td className="px-6 py-4 text-emerald-500">{day.protein}g</td>
                                      <td className="px-6 py-4 text-blue-500">{day.water} ml</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

const NutritionPlanView: React.FC<Props> = ({ plan }) => {
  const [mealLog, setMealLog] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false
  });
  const [waterIntake, setWaterIntake] = useState(0);
  const [history, setHistory] = useState<DailyStats[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Targets State
  const [targets, setTargets] = useState<MacroSplit>(plan.dailyTargets);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<MacroSplit>(plan.dailyTargets);

  // Load initial data
  useEffect(() => {
    // 1. Load History
    const savedHistory = localStorage.getItem('fitgenius_history');
    if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
    }

    // 2. Load Today's Meals
    const savedMealLog = localStorage.getItem('fitgenius_meal_log');
    if (savedMealLog) {
      try {
        const { date, log } = JSON.parse(savedMealLog);
        if (date === new Date().toDateString()) {
          setMealLog(log);
        }
      } catch (e) { console.error(e); }
    }

    // 3. Load Today's Water
    const savedHydration = localStorage.getItem('fitgenius_hydration');
    if (savedHydration) {
        try {
            const { date, amount } = JSON.parse(savedHydration);
            if (date === new Date().toDateString()) {
                setWaterIntake(amount);
            }
        } catch (e) { console.error(e); }
    }

    // 4. Load Custom Targets
    const savedTargets = localStorage.getItem('fitgenius_nutrition_targets');
    if (savedTargets) {
        setTargets(JSON.parse(savedTargets));
    } else {
        setTargets(plan.dailyTargets);
    }
  }, [plan]);

  // Handlers for Target Editing
  const handleSaveTargets = () => {
    setTargets(editValues);
    localStorage.setItem('fitgenius_nutrition_targets', JSON.stringify(editValues));
    setIsEditing(false);
  };

  const handleResetTargets = () => {
    setTargets(plan.dailyTargets);
    setEditValues(plan.dailyTargets);
    localStorage.removeItem('fitgenius_nutrition_targets');
    setIsEditing(false);
  };

  // Calculate current totals
  const consumedCalories = (mealLog.breakfast ? plan.sampleDay.breakfast.calories : 0) +
                           (mealLog.lunch ? plan.sampleDay.lunch.calories : 0) +
                           (mealLog.dinner ? plan.sampleDay.dinner.calories : 0) +
                           (mealLog.snack ? plan.sampleDay.snack.calories : 0);
  
  const consumedProtein = (mealLog.breakfast ? plan.sampleDay.breakfast.protein : 0) +
                           (mealLog.lunch ? plan.sampleDay.lunch.protein : 0) +
                           (mealLog.dinner ? plan.sampleDay.dinner.protein : 0) +
                           (mealLog.snack ? plan.sampleDay.snack.protein : 0);

  // Update History State (Logic only)
  useEffect(() => {
      const shortDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Oct 27"

      setHistory(prevHistory => {
          const newHistory = [...prevHistory];
          const todayIndex = newHistory.findIndex(h => h.date === shortDate);
          
          const todayEntry: DailyStats = {
              date: shortDate,
              calories: consumedCalories,
              protein: consumedProtein,
              water: waterIntake
          };

          if (todayIndex >= 0) {
              newHistory[todayIndex] = todayEntry;
          } else {
              newHistory.push(todayEntry);
          }
          return newHistory;
      });
  }, [mealLog, waterIntake, consumedCalories, consumedProtein]);

  // Persistence Effect (Side Effects)
  useEffect(() => {
    const todayStr = new Date().toDateString();
    
    // Save daily logs
    localStorage.setItem('fitgenius_meal_log', JSON.stringify({ date: todayStr, log: mealLog }));
    localStorage.setItem('fitgenius_hydration', JSON.stringify({ date: todayStr, amount: waterIntake }));

    // Save history
    if (history.length > 0) {
        localStorage.setItem('fitgenius_history', JSON.stringify(history));
    }
  }, [mealLog, waterIntake, history]);

  const toggleMeal = (mealKey: keyof typeof mealLog) => {
    setMealLog(prev => ({ ...prev, [mealKey]: !prev[mealKey] }));
  };

  const manualSave = () => {
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
  };

  const data = [
    { name: 'Protein', value: targets.protein, color: '#10b981' }, 
    { name: 'Carbs', value: targets.carbs, color: '#3b82f6' },    
    { name: 'Fats', value: targets.fats, color: '#f59e0b' },     
  ];

  return (
    <div className="animate-in fade-in zoom-in duration-300 space-y-6 relative">
      {/* Toast Notification */}
      {showSavedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in">
              <CheckCircle size={20} className="text-white" />
              <span className="font-medium">Nutrition log saved successfully!</span>
          </div>
      )}

      {/* History Toggle */}
      <div className="flex justify-end mb-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 rounded-lg transition-colors"
          >
              <History size={16} /> View History
          </button>
      </div>

      {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Macros + Hydration */}
        <div className="md:col-span-1 space-y-6">
            {/* Macro Chart with Editing */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center relative">
            
            <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                <h3 className="text-white font-bold">Daily Summary</h3>
                {isEditing ? (
                    <div className="flex gap-1 ml-2 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                        <button onClick={handleSaveTargets} className="text-emerald-500 hover:text-emerald-400 p-1.5 hover:bg-emerald-500/10 rounded transition-colors"><Save size={14}/></button>
                        <button onClick={handleResetTargets} className="text-amber-500 hover:text-amber-400 p-1.5 hover:bg-amber-500/10 rounded transition-colors" title="Reset to AI defaults"><RotateCcw size={14}/></button>
                        <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-zinc-400 p-1.5 hover:bg-zinc-800 rounded transition-colors"><X size={14}/></button>
                    </div>
                ) : (
                    <button onClick={() => { setEditValues(targets); setIsEditing(true); }} className="text-zinc-600 hover:text-white transition-colors p-1" title="Edit Targets">
                        <Settings size={14} />
                    </button>
                )}
            </div>

            <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="text-center -mt-4 flex flex-col items-center">
                {isEditing ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Target Kcal</label>
                        <input 
                            type="number" 
                            value={editValues.calories}
                            onChange={(e) => setEditValues({...editValues, calories: Math.max(0, Number(e.target.value))})}
                            className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-center text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">{consumedCalories}</span>
                            <span className="text-sm text-zinc-500">/ {targets.calories}</span>
                        </div>
                        <span className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Kcal Consumed</span>
                    </>
                )}
            </div>

            <div className="flex justify-between w-full mt-6 px-2 border-t border-zinc-800 pt-4 gap-2">
                <div className="text-center flex-1">
                    <div className="text-xs text-zinc-400 mb-1">Protein</div>
                    {isEditing ? (
                        <input 
                            type="number" 
                            value={editValues.protein} 
                            onChange={(e) => setEditValues({...editValues, protein: Math.max(0, Number(e.target.value))})}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-1 py-1 text-center text-emerald-500 font-bold text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                    ) : (
                        <div className="font-bold text-emerald-500">{consumedProtein}<span className="text-zinc-600 text-xs">/{targets.protein}g</span></div>
                    )}
                </div>
                <div className="text-center flex-1">
                    <div className="text-xs text-zinc-400 mb-1">Carbs</div>
                    {isEditing ? (
                        <input 
                            type="number" 
                            value={editValues.carbs} 
                            onChange={(e) => setEditValues({...editValues, carbs: Math.max(0, Number(e.target.value))})}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-1 py-1 text-center text-blue-500 font-bold text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    ) : (
                        <div className="font-bold text-blue-500">{targets.carbs}g</div>
                    )}
                </div>
                 <div className="text-center flex-1">
                    <div className="text-xs text-zinc-400 mb-1">Fats</div>
                    {isEditing ? (
                        <input 
                            type="number" 
                            value={editValues.fats} 
                            onChange={(e) => setEditValues({...editValues, fats: Math.max(0, Number(e.target.value))})}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-1 py-1 text-center text-amber-500 font-bold text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                    ) : (
                        <div className="font-bold text-amber-500">{targets.fats}g</div>
                    )}
                </div>
            </div>
            </div>

            {/* Hydration Tracker */}
            <HydrationTracker intake={waterIntake} onUpdate={setWaterIntake} />
        </div>

        {/* Advice Box */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl md:col-span-2 flex flex-col">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Flame className="text-amber-500" /> Nutritional Strategy
            </h3>
            <div className="flex-1 bg-zinc-950/50 rounded-xl p-6 border border-zinc-800/50">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-lg">
                    {plan.advice}
                </p>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                    <Apple size={14} className="text-emerald-500" /> Whole Foods Focus
                </div>
                <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                    <Info size={14} className="text-blue-500" /> Adjust as needed
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={20} /> Pro Tips
         </h3>
         <GeneralTips />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
                <Utensils className="text-emerald-500" /> Log Your Meals
            </h3>
            <button 
                onClick={manualSave}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
                <Save size={16} /> Save Log
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MealCard 
                title="Breakfast" 
                meal={plan.sampleDay.breakfast} 
                isConsumed={mealLog.breakfast}
                onToggle={() => toggleMeal('breakfast')}
            />
            <MealCard 
                title="Lunch" 
                meal={plan.sampleDay.lunch} 
                isConsumed={mealLog.lunch}
                onToggle={() => toggleMeal('lunch')}
            />
            <MealCard 
                title="Dinner" 
                meal={plan.sampleDay.dinner} 
                isConsumed={mealLog.dinner}
                onToggle={() => toggleMeal('dinner')}
            />
            <MealCard 
                title="Snack" 
                meal={plan.sampleDay.snack} 
                isConsumed={mealLog.snack}
                onToggle={() => toggleMeal('snack')}
            />
        </div>
      </div>
    </div>
  );
};

export default NutritionPlanView;