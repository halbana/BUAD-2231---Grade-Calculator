import { GoogleGenAI } from "@google/genai";
import { POINTS_DISTRIBUTED, POINTS_REMAINING } from "../constants";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // In a real app, you'd handle this more gracefully.
    // For this environment, we assume API_KEY is set.
    console.error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

export const generateMessage = async (
    currentPoints: number,
    maxPossibleGrade: string,
    currentPercentage: number,
    distributedPoints: number = POINTS_DISTRIBUTED,
    pointsRemaining: number = POINTS_REMAINING
): Promise<string> => {
    try {
        let prompt: string;

        if (maxPossibleGrade === 'F') {
            prompt = `Act as a compassionate but direct college professor for BUAD 2231. A student has earned ${currentPoints} out of ${distributedPoints} points so far. Based on the remaining ${pointsRemaining} points, it is not mathematically possible for them to pass. Write a very compact, honest, and supportive message (1-2 sentences). Acknowledge this is difficult news, avoid false hope, and gently advise them to meet with you or an advisor to discuss options like course withdrawal or retaking it. The tone should be empathetic and focused on constructive next steps.`;
        } else if (currentPercentage >= 80) {
            prompt = `Act as a proud but realistic college professor for BUAD 2231. A student has earned ${currentPoints} out of ${distributedPoints} points, a strong performance. Their highest possible grade is an ${maxPossibleGrade}. Write a very compact, complimentary message (1-2 sentences). Acknowledge their excellent work, but encourage them to stay focused, as the remaining ${pointsRemaining} points are crucial for securing a top grade. Keep the tone positive and motivating.`;
        } else {
            const lowPerformanceAdvice = currentPercentage < 70 ? " Since their current performance is below 70%, specifically encourage them to connect with you (the instructor) to get help in gaining a better understanding of the course materials." : "";
            prompt = `Act as a supportive and direct college professor for BUAD 2231. A student has earned ${currentPoints} out of ${distributedPoints} points, and their highest possible grade is a ${maxPossibleGrade}. The final ${pointsRemaining} points are a significant opportunity. Write a compact, motivational message.${lowPerformanceAdvice} Briefly acknowledge their current standing, then provide these specific suggestions as a bulleted list:
* Make sure not to miss any class meetings and Connect activities.
* Try to maximize points from every remaining activity.
* Finish all Connect activities before taking the exam.
* Reach out to the instructor if you need help understanding the course materials.
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
