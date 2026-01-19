import React, { useState } from 'react';
import { UserProfile, Goal, ExperienceLevel, Equipment } from '../types';
import { Dumbbell, Target, User, Activity, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    goal: Goal.BUILD_MUSCLE,
    experience: ExperienceLevel.BEGINNER,
    equipment: Equipment.FULL_GYM,
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (formData.name && formData.age && formData.weight && formData.height) {
        onComplete(formData as UserProfile);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
          FitGenius Setup
        </h1>
        <p className="text-zinc-400">Let's personalize your AI trainer.</p>
        <div className="flex justify-center mt-4 gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full ${step >= i ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
            ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 fade-in">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="text-emerald-500" /> Basic Details
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-4">
                <input
                type="number"
                placeholder="Age"
                className="bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.age || ''}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                />
                <input
                type="number"
                placeholder="Weight (kg)"
                className="bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.weight || ''}
                onChange={(e) => handleChange('weight', Number(e.target.value))}
                />
                <input
                type="number"
                placeholder="Height (cm)"
                className="bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.height || ''}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 fade-in">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="text-emerald-500" /> Your Goal
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {Object.values(Goal).map((g) => (
              <button
                key={g}
                onClick={() => handleChange('goal', g)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.goal === g
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-emerald-500/50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 fade-in">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="text-emerald-500" /> Experience
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {Object.values(ExperienceLevel).map((l) => (
              <button
                key={l}
                onClick={() => handleChange('experience', l)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.experience === l
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-emerald-500/50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 fade-in">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Dumbbell className="text-emerald-500" /> Equipment & Injuries
          </h2>
          <label className="text-sm text-zinc-400">Available Equipment</label>
          <div className="grid grid-cols-1 gap-3 mb-4">
            {Object.values(Equipment).map((e) => (
              <button
                key={e}
                onClick={() => handleChange('equipment', e)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  formData.equipment === e
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-emerald-500/50'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <label className="text-sm text-zinc-400">Injuries (Optional)</label>
           <textarea
              placeholder="e.g. Lower back pain, bad left knee..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
              value={formData.injuries || ''}
              onChange={(e) => handleChange('injuries', e.target.value)}
            />
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={step === 1 && (!formData.name || !formData.age || !formData.weight)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 4 ? 'Generate Plan' : 'Next'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;