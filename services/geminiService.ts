import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WorkoutPlan, NutritionPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview for structured logic tasks as recommended
const MODEL_NAME = "gemini-3-flash-preview";

export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  const prompt = `
    Create a detailed 7-day workout routine for a ${profile.age} year old, ${profile.height}cm, ${profile.weight}kg person.
    Goal: ${profile.goal}.
    Experience Level: ${profile.experience}.
    Available Equipment: ${profile.equipment}.
    Injuries/Constraints: ${profile.injuries || "None"}.

    Return a valid JSON object with a summary and a daily schedule.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster latency
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A brief motivational overview of the plan." },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "Day of the week (e.g., Monday)" },
                focus: { type: Type.STRING, description: "Main focus (e.g., Chest & Triceps, Rest)" },
                durationMinutes: { type: Type.NUMBER, description: "Estimated duration in minutes" },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      sets: { type: Type.NUMBER },
                      reps: { type: Type.STRING, description: "Rep range (e.g., '8-12' or 'Failure')" },
                      notes: { type: Type.STRING, description: "Form cue or tempo instruction" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as WorkoutPlan;
};

export const generateNutritionPlan = async (profile: UserProfile): Promise<NutritionPlan> => {
  const prompt = `
    Create a daily nutrition guide for a ${profile.age} year old, ${profile.weight}kg person with the goal of ${profile.goal}.
    Calculate appropriate caloric and macro targets.
    Provide a sample day of eating.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster latency
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyTargets: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            }
          },
          advice: { type: Type.STRING, description: "General nutritional advice and hydration tips." },
          sampleDay: {
            type: Type.OBJECT,
            properties: {
              breakfast: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER }
                }
              },
              lunch: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER }
                }
              },
              dinner: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER }
                }
              },
              snack: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as NutritionPlan;
};

export const chatWithCoach = async (history: { role: string; parts: { text: string }[] }[], newMessage: string, profile: UserProfile, workoutPlan?: WorkoutPlan | null, nutritionPlan?: NutritionPlan | null) => {
  const systemInstruction = `You are an expert fitness coach named "Titan".
  User Profile: ${JSON.stringify(profile)}.
  ${workoutPlan ? `Current Workout Plan: ${JSON.stringify(workoutPlan.summary)}` : "Workout Plan: Currently being generated, tell the user to wait a moment if they ask for details."}
  ${nutritionPlan ? `Nutrition Targets: ${JSON.stringify(nutritionPlan.dailyTargets)}` : "Nutrition Plan: Currently being generated."}
  Keep answers concise, motivating, and science-based.
  Use markdown for formatting.`;

  const chat = ai.chats.create({
    model: MODEL_NAME,
    history: history,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      systemInstruction: systemInstruction,
    },
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};