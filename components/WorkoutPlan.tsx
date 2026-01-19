import React, { useState } from 'react';
import { WorkoutPlan as WorkoutPlanType, WorkoutDay } from '../types';
import { Calendar, Clock, RotateCcw, CheckCircle2 } from 'lucide-react';

interface Props {
  plan: WorkoutPlanType;
}

const WorkoutPlanView: React.FC<Props> = ({ plan }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const activeDay = plan.schedule[selectedDayIndex];

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Weekly Plan</h2>
        <p className="text-zinc-400">{plan.summary}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Days */}
        <div className="lg:w-1/3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
          {plan.schedule.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className={`p-4 rounded-xl text-left border transition-all min-w-[140px] lg:min-w-0 ${
                selectedDayIndex === index
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <div className="font-semibold text-lg">{day.day}</div>
              <div className="text-xs uppercase tracking-wider opacity-70 truncate">{day.focus}</div>
            </button>
          ))}
        </div>

        {/* Active Day Detail */}
        <div className="lg:w-2/3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 min-h-[500px]">
          <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{activeDay.day}</h3>
              <p className="text-emerald-400 font-medium">{activeDay.focus}</p>
            </div>
            {activeDay.durationMinutes > 0 && (
                 <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-full text-sm border border-zinc-800">
                    <Clock size={16} />
                    <span>{activeDay.durationMinutes} min</span>
                 </div>
            )}
          </div>

          {activeDay.exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
              <Calendar size={48} className="opacity-20" />
              <p>Rest Day. Recovery is key!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDay.exercises.map((exercise, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                      {exercise.name}
                    </h4>
                    <div className="flex gap-2">
                        <span className="bg-zinc-900 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-800">
                            {exercise.sets} Sets
                        </span>
                        <span className="bg-zinc-900 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-800">
                            {exercise.reps} Reps
                        </span>
                    </div>
                  </div>
                  {exercise.notes && (
                    <div className="flex items-start gap-2 text-zinc-500 text-sm mt-2">
                        <CheckCircle2 size={14} className="mt-0.5 text-emerald-600/70" />
                        <span>{exercise.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanView;