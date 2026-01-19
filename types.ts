export enum Goal {
  LOSE_WEIGHT = 'Lose Weight',
  BUILD_MUSCLE = 'Build Muscle',
  IMPROVE_ENDURANCE = 'Improve Endurance',
  GAIN_STRENGTH = 'Gain Strength',
  FLEXIBILITY = 'Flexibility & Mobility'
}

export enum ExperienceLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum Equipment {
  FULL_GYM = 'Full Gym',
  DUMBBELLS_ONLY = 'Dumbbells Only',
  BODYWEIGHT = 'Bodyweight Only',
  HOME_GYM = 'Home Gym (Barbell + Rack)'
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  goal: Goal;
  experience: ExperienceLevel;
  equipment: Equipment;
  injuries?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
  durationMinutes: number;
}

export interface WorkoutPlan {
  summary: string;
  schedule: WorkoutDay[];
}

export interface MacroSplit {
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  calories: number;
}

export interface Meal {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
}

export interface NutritionPlan {
  dailyTargets: MacroSplit;
  advice: string;
  sampleDay: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}