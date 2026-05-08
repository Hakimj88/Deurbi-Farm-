import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFarmInsights(farmData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert AI agronomist analyzing farm data for a West African farmer. 
            Given the following data about the farm, active cycles, and current weather, provide 3-5 key actionable, concise, and practical recommendations. 
            Crucially, combine the weather information (rain, temperature, humidity) with the crop cycle stages to give smart advice (e.g., "Postpone fertilizer if heavy rain is expected" or "Increase irrigation due to high heat").
            
            Farm Data: ${JSON.stringify(farmData)}`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text).insights;
    }
    return [];
  } catch (error) {
    console.error("Farm insights generation failed", error);
    return [];
  }
}

export async function generateCycleInsights(cycleData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert agronomist. Analyze this specific crop cycle data and provide 2-3 specific, actionable insights or warnings for the farmer. Focus on current growth stage, pest risks, or immediate task recommendations. Data: ${JSON.stringify(cycleData)}`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["insights"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text).insights;
    }
    return [];
  } catch (error) {
    console.error("Cycle insights generation failed", error);
    return [];
  }
}

export async function parseTask(naturalLanguageInput: string, today: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `Extract task details from this sentence: "${naturalLanguageInput}". Today's date is ${today}. Return a JSON object with properties 'taskType' (string), 'dueDate' (string in YYYY-MM-DD), and 'notes' (string). If you can't figure it out, return empty strings.`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskType: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            notes: { type: Type.STRING }
          },
          required: ["taskType", "dueDate", "notes"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Task parsing failed", error);
    return null;
  }
}

export async function generateCropPlan(cropOptions: { cropName: string, variety: string, plantingDate: string, system: string, location: string }) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert West African agronomist. Generate a practical crop management plan for a farmer planting ${cropOptions.cropName} (Variety: ${cropOptions.variety}) on ${cropOptions.plantingDate} using a ${cropOptions.system} system in ${cropOptions.location}. Give a list of tasks starting from land preparation, planting, weeding, fertilizing, pest management, up to harvesting. Provide specific due dates based on the planting date.`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskType: {
                    type: Type.STRING,
                    description: "Short title of the task (e.g. Land Preparation, Sowing, First Weeding, Fertilization)."
                  },
                  notes: {
                    type: Type.STRING,
                    description: "Specific instructions or tips for this task."
                  },
                  dueDate: {
                    type: Type.STRING,
                    description: "Date the task should be completed in YYYY-MM-DD format."
                  }
                },
                required: ["taskType", "notes", "dueDate"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Crop plan generation failed", error);
    throw error;
  }
}

export async function diagnosePest(base64Image: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: "You are an expert agronomist specialized in West African agriculture. Identify the pest, disease, or weed in the provided image. Provide the diagnosis and a brief set of recommended actions (cultural, biological, or chemical). If the image doesn't appear to show a plant or pest, indicate that.",
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: {
              type: Type.STRING,
              description: "The name of the pest or disease.",
            },
            severity: {
              type: Type.STRING,
              description: "Estimated severity (high, medium, low).",
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended integrated pest management actions.",
            },
            isPlantRelated: {
              type: Type.BOOLEAN,
              description: "True if the image actually shows a plant, crop, or pest. False otherwise.",
            }
          },
          required: ["diagnosis", "severity", "recommendations", "isPlantRelated"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Diagnosis failed", error);
    throw error;
  }
}

export async function generateFertilizerRecommendations(cycleData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert agronomist specialized in West African crops and regenerative agriculture. 
            Based on the following crop cycle data (current stage, fertilizer history, scouting records, and soil test results), provide specific fertilizer recommendations. 
            
            Crucially, include:
            1. Standard Organic and Synthetic inputs.
            2. Local plant-based / botanical fertilizer options (e.g., Moringa leaf extract, Banana peel tea, Neem cake, etc.) that the farmer can prepare locally.
            
            Scouting records might indicate plant stress or nutritional deficiencies disguised as pest issues, or pests that thrive on specific nutrient imbalances. Use this context.

            For each recommendation, specify:
            - Type: "Organic", "Synthetic", or "Local Botanical"
            - Product: The name of the input.
            - Dosage: Precise amount to use.
            - Method: How to apply it (e.g. foliar spray, side-dressing).
            - Rationale: Why this is recommended based on the current stage, soil, and scouting data.
            
            Cycle Data: ${JSON.stringify(cycleData)}`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["Organic", "Synthetic", "Local Botanical"] },
                  product: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  method: { type: Type.STRING },
                  recommendation: { type: Type.STRING, description: "Detailed rationale and application tips." }
                },
                required: ["type", "product", "dosage", "method", "recommendation"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text).recommendations;
    }
    return [];
  } catch (error) {
    console.error("Fertilizer recommendations generation failed", error);
    return [];
  }
}

export async function generateSoilRecommendations(soilData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert agronomist specialized in West African soil science. 
            Based on the following soil test results (NPK levels, pH, organic matter), provide 2-3 specific recommendations for soil amendments. 
            Focus on improving soil health and correcting deficiencies.
            
            Soil Test Data: ${JSON.stringify(soilData)}`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text).recommendations;
    }
    return [];
  } catch (error) {
    console.error("Soil health recommendations generation failed", error);
    return [];
  }
}

export async function generateWeatherAlertAdvice(weatherData: any, cycleData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert agronomist specialized in West African agriculture. 
            Analyze the following weather forecast alerts and the current state of a crop cycle. 
            Provide specific, actionable advice to protect or optimize the crop based on the forecast. 
            Focus on tasks like adjusting irrigation, postponing fertilization, protecting young plants, or preparing for high pest pressure.
            
            Weather Alerts: ${JSON.stringify(weatherData.alerts)}
            Crop Cycle Data: ${JSON.stringify(cycleData)}`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: {
              type: Type.STRING,
              description: "Actionable advice for the farmer based on the weather alert and crop stage."
            }
          },
          required: ["advice"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text).advice;
    }
    return null;
  } catch (error) {
    console.error("Weather advice generation failed", error);
    return null;
  }
}

export async function generateIrrigationAdvice(cycleData: any, weatherData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert agronomist specialized in West African irrigation management and water conservation. 
            Analyze the following crop cycle data (including growth stage and recent soil moisture readings of ${cycleData.latestMoisture || 'unknown'}%) and current 5-day weather forecast to provide a granular irrigation plan. 
            
            Focus on:
            1. Stage-Specific Needs: Precisely match water volume and frequency to the current growth stage (e.g., higher needs during flowering/fruiting vs. lower during late maturation).
            2. Moisture Calibration: Use the latest soil moisture percentage (if available) to adjust the baseline recommendation.
            3. Detailed Scheduling: Provide a specific frequency (e.g., "30 mins every 48 hours") and the best time of day (e.g., "5:00 AM - 7:00 AM").
            4. Volume Estimation: Estimate the approximate water volume needed per plant or per hectare (e.g., "4 liters per plant" or "25,000 liters per hectare").
            5. Optimization & Conservation: Suggest ways to minimize water loss (e.g., mulching, timing).
            6. Risk Mitigation: Explicitly warn about over-watering risks (root rot, leaching) if soil moisture is already high or rain is imminent in the 5-day forecast.
            
            Cycle Data: ${JSON.stringify(cycleData)}
            5-Day Weather Data: ${JSON.stringify(weatherData)}`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            frequency: { type: Type.STRING, description: "Detailed frequency and timing, e.g., 'Twice a week (Early Morning)'" },
            method: { type: Type.STRING, description: "Recommended method (Drip, Sprinkler, Manual) and technical justification." },
            estimatedVolume: { type: Type.STRING, description: "Amount of water needed, e.g., '5 Liters per plant'" },
            rationale: { type: Type.STRING, description: "Technical reasoning based on moisture data, growth stage, and upcoming weather." },
            optimizationTips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 specific tips for conservation and health for this specific crop/stage."
            }
          },
          required: ["frequency", "method", "estimatedVolume", "rationale", "optimizationTips"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Irrigation advice generation failed", error);
    return null;
  }
}

export async function generateIntegratedActionPlan(cycleData: any, weatherData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert West African agronomist. 
            Create a streamlined, unified action plan for the current growth stage of this crop.
            
            Integrate:
            1. Fertilizer: Specific application tasks based on recommended products and dosages.
            2. Irrigation: Precise timing and volume based on current soil moisture (${cycleData.latestMoisture || 'unknown'}%) and weather.
            3. Pest & Disease: Specific scouting and sampling tasks (e.g., "Check undersides of 5 leaves per plant", "Look for egg masses on lower canopy").
            4. Operations: Key maintenance tasks (weeding, pruning).
            
            Cycle Data: ${JSON.stringify(cycleData)}
            Weather Forecast: ${JSON.stringify(weatherData)}`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Action-oriented task name" },
                  category: { type: Type.STRING, enum: ["fertilizer", "irrigation", "pest_scouting", "operations"] },
                  description: { type: Type.STRING, description: "Specific instructions including sampling methods where applicable" },
                  urgency: { type: Type.STRING, enum: ["low", "moderate", "high"] },
                  plannedDate: { type: Type.STRING, description: "e.g., 'Today', 'Tomorrow', 'In 2 days'" }
                },
                required: ["title", "category", "description", "urgency", "plannedDate"]
              }
            },
            summary: { type: Type.STRING, description: "A briefly stated primary focus for the next 48 hours." }
          },
          required: ["tasks", "summary"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Integrated action plan generation failed", error);
    return null;
  }
}

export async function generateMarketInsights(region: string, cropName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are a West African agricultural market analyst. 
            Provide current market insights for ${cropName} in the ${region} region of The Gambia/West Africa.
            
            Return:
            1. Current estimated price range per kg (in GMD).
            2. Price trend (Stable, Rising, or Falling) and briefly why.
            3. Best time to sell (now or wait).
            4. Demand level (Low, Medium, High).
            5. A tactical tip for the farmer (e.g., storage advice, collective bargaining).
            
            Be realistic based on typical seasonal cycles for this region.`,
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priceRange: { type: Type.STRING, description: "e.g. '45 - 55 GMD'" },
            trend: { type: Type.STRING, description: "Stable, Rising, Falling" },
            trendReason: { type: Type.STRING },
            demand: { type: Type.STRING, description: "Low, Medium, High" },
            recommendation: { type: Type.STRING, description: "Sell now / Wait" },
            tacticalTip: { type: Type.STRING }
          },
          required: ["priceRange", "trend", "trendReason", "demand", "recommendation", "tacticalTip"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Market insights generation failed", error);
    return null;
  }
}
