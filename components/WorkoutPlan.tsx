import React, { useState, useEffect } from 'react';
import { WorkoutPlan as WorkoutPlanType, WorkoutDay, Exercise } from '../types';
import { Calendar, Clock, CheckCircle2, PlayCircle, Info, ChevronDown, ChevronUp, Circle, CheckCircle, Trophy } from 'lucide-react';

interface Props {
  plan: WorkoutPlanType;
}

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  onToggle: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isCompleted, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border rounded-xl p-4 transition-all group ${
        isCompleted 
        ? 'bg-emerald-950/20 border-emerald-900/50' 
        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="flex gap-4 items-start mb-2">
        <button 
            onClick={onToggle}
            className={`mt-1 transition-colors shrink-0 ${
                isCompleted 
                ? 'text-emerald-500 hover:text-emerald-400' 
                : 'text-zinc-600 hover:text-emerald-500'
            }`}
        >
            {isCompleted ? <CheckCircle className="fill-emerald-500/20" size={24} /> : <Circle size={24} />}
        </button>

        <div className="flex-1">
            <div className="flex justify-between items-start">
                <h4 className={`font-bold text-lg transition-colors ${
                    isCompleted ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-white group-hover:text-emerald-400'
                }`}>
                {exercise.name}
                </h4>
                <div className="flex gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${
                        isCompleted 
                        ? 'bg-emerald-900/20 text-emerald-700 border-emerald-900/30' 
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                    }`}>
                        {exercise.sets} Sets
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${
                        isCompleted 
                        ? 'bg-emerald-900/20 text-emerald-700 border-emerald-900/30' 
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                    }`}>
                        {exercise.reps} Reps
                    </span>
                </div>
            </div>
            
            {exercise.notes && (
                <div className="flex items-start gap-2 text-zinc-500 text-sm mt-1">
                    <CheckCircle2 size={14} className="mt-0.5 text-emerald-600/70 shrink-0" />
                    <span>{exercise.notes}</span>
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-800/50 pt-3">
                <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise form")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-full"
                >
                    <PlayCircle size={14} /> Watch Demo
                </a>
                
                {exercise.description && (
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-xs font-medium flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors px-2 py-1.5"
                    >
                        <Info size={14} /> 
                        {isOpen ? 'Hide Guide' : 'How to perform'}
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                )}
            </div>
            
            {isOpen && exercise.description && (
                <div className="mt-3 text-sm text-zinc-300 leading-relaxed animate-in slide-in-from-top-1 fade-in duration-200 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                    {exercise.description}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const WorkoutPlanView: React.FC<Props> = ({ plan }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // State to track completed exercises/days. 
  // Key format: "d{dayIndex}-e{exerciseIndex}" for exercises, "d{dayIndex}" for full day override/rest days
  const [progress, setProgress] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('fitgenius_workout_progress');
        return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('fitgenius_workout_progress', JSON.stringify(progress));
  }, [progress]);

  const activeDay = plan.schedule[selectedDayIndex];

  const toggleExercise = (dayIdx: number, exIdx: number) => {
    const key = `d${dayIdx}-e${exIdx}`;
    setProgress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDayComplete = (dayIdx: number) => {
    const day = plan.schedule[dayIdx];
    const isRestDay = day.exercises.length === 0;
    
    if (isRestDay) {
        const key = `d${dayIdx}-rest`;
        setProgress(prev => ({ ...prev, [key]: !prev[key] }));
        return;
    }

    // Check if currently all exercises are complete
    const allComplete = day.exercises.every((_, idx) => progress[`d${dayIdx}-e${idx}`]);
    
    // Toggle all
    const newProgress = { ...progress };
    day.exercises.forEach((_, idx) => {
        newProgress[`d${dayIdx}-e${idx}`] = !allComplete;
    });
    setProgress(newProgress);
  };

  const isExerciseComplete = (dayIdx: number, exIdx: number) => {
      return !!progress[`d${dayIdx}-e${exIdx}`];
  };

  const isDayComplete = (dayIdx: number) => {
      const day = plan.schedule[dayIdx];
      if (day.exercises.length === 0) {
          return !!progress[`d${dayIdx}-rest`];
      }
      return day.exercises.every((_, idx) => progress[`d${dayIdx}-e${idx}`]);
  };

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Weekly Plan</h2>
        <p className="text-zinc-400">{plan.summary}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Days */}
        <div className="lg:w-1/3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
          {plan.schedule.map((day, index) => {
            const completed = isDayComplete(index);
            return (
                <button
                key={index}
                onClick={() => setSelectedDayIndex(index)}
                className={`p-4 rounded-xl text-left border transition-all min-w-[140px] lg:min-w-0 relative overflow-hidden ${
                    selectedDayIndex === index
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
                >
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                            {day.day}
                            {completed && <CheckCircle size={16} className="text-emerald-500" />}
                        </div>
                        <div className="text-xs uppercase tracking-wider opacity-70 truncate">{day.focus}</div>
                    </div>
                </div>
                {completed && (
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Trophy size={48} />
                    </div>
                )}
                </button>
            );
          })}
        </div>

        {/* Active Day Detail */}
        <div className="lg:w-2/3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 border-b border-zinc-800 pb-4 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  {activeDay.day}
                  {isDayComplete(selectedDayIndex) && <span className="text-sm bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">Completed</span>}
              </h3>
              <p className="text-emerald-400 font-medium">{activeDay.focus}</p>
            </div>
            <div className="flex gap-2">
                {activeDay.durationMinutes > 0 && (
                    <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950 px-3 py-2 rounded-lg text-sm border border-zinc-800 h-10">
                        <Clock size={16} />
                        <span>{activeDay.durationMinutes} min</span>
                    </div>
                )}
                <button
                    onClick={() => toggleDayComplete(selectedDayIndex)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border h-10 ${
                        isDayComplete(selectedDayIndex)
                        ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                >
                    {isDayComplete(selectedDayIndex) ? 'Completed' : 'Mark Day Complete'}
                </button>
            </div>
          </div>

          {activeDay.exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
              <Calendar size={48} className="opacity-20" />
              <p>Rest Day. Recovery is key!</p>
              <button 
                onClick={() => toggleDayComplete(selectedDayIndex)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDayComplete(selectedDayIndex) ? 'text-emerald-500' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isDayComplete(selectedDayIndex) ? <CheckCircle size={16} /> : <Circle size={16} />}
                {isDayComplete(selectedDayIndex) ? 'Rest Day Recorded' : 'Mark Rest Day as Complete'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDay.exercises.map((exercise, i) => (
                <ExerciseCard 
                    key={i} 
                    exercise={exercise} 
                    isCompleted={isExerciseComplete(selectedDayIndex, i)}
                    onToggle={() => toggleExercise(selectedDayIndex, i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanView;