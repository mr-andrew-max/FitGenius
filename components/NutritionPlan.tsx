import React, { useState, useEffect } from 'react';
import { NutritionPlan as NutritionPlanType, MacroSplit, Meal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Apple, Utensils, Droplet, Flame, Plus, Minus, Info, CheckCircle, Circle } from 'lucide-react';

interface Props {
  plan: NutritionPlanType;
}

interface MealCardProps {
  meal: Meal;
  title: string;
  isConsumed: boolean;
  onToggle: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, title, isConsumed, onToggle }) => (
  <div className={`border p-5 rounded-xl transition-all ${
      isConsumed 
      ? 'bg-emerald-950/20 border-emerald-900/50' 
      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
  }`}>
    <div className="flex justify-between items-start mb-3">
      <h4 className={`text-sm font-bold uppercase tracking-wider ${isConsumed ? 'text-emerald-600' : 'text-emerald-400'}`}>{title}</h4>
      <button 
        onClick={onToggle}
        className={`transition-colors hover:scale-110 ${isConsumed ? 'text-emerald-500' : 'text-zinc-600 hover:text-emerald-500'}`}
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

const HydrationTracker: React.FC = () => {
  const [intake, setIntake] = useState(0);
  const GOAL = 3000; // ml

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem('fitgenius_hydration');
    if (saved) {
      try {
        const { date, amount } = JSON.parse(saved);
        // Check if it's from today
        if (date === new Date().toDateString()) {
          setIntake(amount);
        } else {
          // New day, reset
          setIntake(0);
        }
      } catch (e) {
        console.error("Failed to parse hydration data");
      }
    }
  }, []);

  const updateIntake = (change: number) => {
    const newAmount = Math.max(0, intake + change);
    setIntake(newAmount);
    localStorage.setItem('fitgenius_hydration', JSON.stringify({
      date: new Date().toDateString(),
      amount: newAmount
    }));
  };

  const percentage = Math.min(100, Math.round((intake / GOAL) * 100));

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Droplet className="text-blue-500 fill-blue-500/20" /> Hydration
        </h3>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
           {percentage}%
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
         <div className="text-4xl font-bold text-white mb-1">{intake}<span className="text-lg text-zinc-500 font-normal ml-1">ml</span></div>
         <div className="text-xs text-zinc-500">Target: {GOAL}ml</div>
      </div>

      <div className="w-full bg-zinc-950 rounded-full h-3 mb-6 overflow-hidden border border-zinc-800">
        <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${percentage}%` }}
        >
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
            onClick={() => updateIntake(-250)}
            disabled={intake === 0}
            className="flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
            <Minus size={16} /> 250ml
        </button>
        <button 
            onClick={() => updateIntake(250)}
            className="flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
        >
            <Plus size={16} /> 250ml
        </button>
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

  useEffect(() => {
    const saved = localStorage.getItem('fitgenius_meal_log');
    if (saved) {
      try {
        const { date, log } = JSON.parse(saved);
        if (date === new Date().toDateString()) {
          setMealLog(log);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const toggleMeal = (mealKey: keyof typeof mealLog) => {
    const newLog = { ...mealLog, [mealKey]: !mealLog[mealKey] };
    setMealLog(newLog);
    localStorage.setItem('fitgenius_meal_log', JSON.stringify({
      date: new Date().toDateString(),
      log: newLog
    }));
  };

  const consumedCalories = (mealLog.breakfast ? plan.sampleDay.breakfast.calories : 0) +
                           (mealLog.lunch ? plan.sampleDay.lunch.calories : 0) +
                           (mealLog.dinner ? plan.sampleDay.dinner.calories : 0) +
                           (mealLog.snack ? plan.sampleDay.snack.calories : 0);
  
  const consumedProtein = (mealLog.breakfast ? plan.sampleDay.breakfast.protein : 0) +
                           (mealLog.lunch ? plan.sampleDay.lunch.protein : 0) +
                           (mealLog.dinner ? plan.sampleDay.dinner.protein : 0) +
                           (mealLog.snack ? plan.sampleDay.snack.protein : 0);

  const data = [
    { name: 'Protein', value: plan.dailyTargets.protein, color: '#10b981' }, // emerald-500
    { name: 'Carbs', value: plan.dailyTargets.carbs, color: '#3b82f6' },    // blue-500
    { name: 'Fats', value: plan.dailyTargets.fats, color: '#f59e0b' },     // amber-500
  ];

  return (
    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Macros + Hydration */}
        <div className="md:col-span-1 space-y-6">
            {/* Macro Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center relative">
            <h3 className="text-white font-bold mb-4 absolute top-6 left-6">Daily Summary</h3>
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
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{consumedCalories}</span>
                    <span className="text-sm text-zinc-500">/ {plan.dailyTargets.calories}</span>
                </div>
                <span className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Kcal Consumed</span>
            </div>

            <div className="flex justify-between w-full mt-6 px-2 border-t border-zinc-800 pt-4">
                <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-1">Protein</div>
                    <div className="font-bold text-emerald-500">{consumedProtein}<span className="text-zinc-600 text-xs">/{plan.dailyTargets.protein}g</span></div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-1">Carbs</div>
                    <div className="font-bold text-blue-500">{plan.dailyTargets.carbs}g</div>
                </div>
                 <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-1">Fats</div>
                    <div className="font-bold text-amber-500">{plan.dailyTargets.fats}g</div>
                </div>
            </div>
            </div>

            {/* Hydration Tracker */}
            <HydrationTracker />
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

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <Utensils className="text-emerald-500" /> Log Your Meals
        </h3>
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