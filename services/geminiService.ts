import { GoogleGenAI } from "@google/genai";
import { POINTS_DISTRIBUTED, POINTS_REMAINING } from "../constants";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // In a real app, you'd handle this more gracefully.
    // For this environment, we assume API_KEY is set.
    console.error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

export const generateMessage = async (currentPoints: number, maxPossibleGrade: string, currentPercentage: number): Promise<string> => {
    try {
        let prompt: string;

        if (maxPossibleGrade === 'F') {
            prompt = `Act as a compassionate but direct college professor for BUAD 2231. A student has earned ${currentPoints} out of ${POINTS_DISTRIBUTED} points so far. Based on the remaining ${POINTS_REMAINING} points, it is not mathematically possible for them to pass. Write a very compact, honest, and supportive message (1-2 sentences). Acknowledge this is difficult news, avoid false hope, and gently advise them to meet with you or an advisor to discuss options like course withdrawal or retaking it. The tone should be empathetic and focused on constructive next steps.`;
        } else if (currentPercentage >= 80) {
            prompt = `Act as a proud but realistic college professor for BUAD 2231. A student has earned ${currentPoints} out of ${POINTS_DISTRIBUTED} points, a strong performance. Their highest possible grade is an ${maxPossibleGrade}. Write a very compact, complimentary message (1-2 sentences). Acknowledge their excellent work, but encourage them to stay focused, as the remaining ${POINTS_REMAINING} points are crucial for securing a top grade. Keep the tone positive and motivating.`;
        } else {
            prompt = `Act as a supportive and direct college professor for BUAD 2231. A student has earned ${currentPoints} out of ${POINTS_DISTRIBUTED} points, and their highest possible grade is a ${maxPossibleGrade}. The final ${POINTS_REMAINING} points are a significant opportunity. Write a compact, motivational message. Briefly acknowledge their current standing, then provide these specific suggestions as a bulleted list:
* Make sure not to miss any class meetings and SIMnet activities.
* Try to maximize points from every remaining activity.
* Finish all SIMnet activities before taking the exam.
End with a brief, encouraging sentence about finishing the semester strong. The tone should be direct but hopeful.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating message from Gemini API:", error);
        return "There was an issue generating feedback. Please focus on the calculated scenarios for now.";
    }
};
