import React from 'react';
import { NutritionPlan as NutritionPlanType, MacroSplit, Meal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Apple, Utensils, Droplet, Flame } from 'lucide-react';

interface Props {
  plan: NutritionPlanType;
}

const MealCard: React.FC<{ meal: Meal; title: string }> = ({ meal, title }) => (
  <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl">
    <div className="flex justify-between items-start mb-3">
      <h4 className="text-emerald-400 text-sm font-bold uppercase tracking-wider">{title}</h4>
      <div className="text-zinc-500 text-xs flex gap-2">
        <span>{meal.calories} kcal</span>
        <span>{meal.protein}g pro</span>
      </div>
    </div>
    <h3 className="text-white font-semibold text-lg mb-2">{meal.name}</h3>
    <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside marker:text-emerald-600">
      {meal.ingredients.map((ing, i) => (
        <li key={i}>{ing}</li>
      ))}
    </ul>
  </div>
);

const NutritionPlanView: React.FC<Props> = ({ plan }) => {
  const data = [
    { name: 'Protein', value: plan.dailyTargets.protein, color: '#10b981' }, // emerald-500
    { name: 'Carbs', value: plan.dailyTargets.carbs, color: '#3b82f6' },    // blue-500
    { name: 'Fats', value: plan.dailyTargets.fats, color: '#f59e0b' },     // amber-500
  ];

  return (
    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Macro Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl md:col-span-1 flex flex-col items-center justify-center relative">
          <h3 className="text-white font-bold mb-4 absolute top-6 left-6">Daily Targets</h3>
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
          <div className="text-center -mt-4">
             <span className="text-4xl font-bold text-white">{plan.dailyTargets.calories}</span>
             <span className="block text-zinc-500 text-sm">Calories / Day</span>
          </div>
          <div className="flex justify-between w-full mt-6 px-2">
            {data.map((d) => (
                <div key={d.name} className="text-center">
                    <div className="text-xs text-zinc-400 mb-1">{d.name}</div>
                    <div className="font-bold text-white" style={{color: d.color}}>{d.value}g</div>
                </div>
            ))}
          </div>
        </div>

        {/* Advice Box */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl md:col-span-2">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Droplet className="text-blue-500" /> Nutritional Strategy
            </h3>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {plan.advice}
            </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <Utensils className="text-emerald-500" /> Sample Day of Eating
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MealCard title="Breakfast" meal={plan.sampleDay.breakfast} />
            <MealCard title="Lunch" meal={plan.sampleDay.lunch} />
            <MealCard title="Dinner" meal={plan.sampleDay.dinner} />
            <MealCard title="Snack" meal={plan.sampleDay.snack} />
        </div>
      </div>
    </div>
  );
};

export default NutritionPlanView;