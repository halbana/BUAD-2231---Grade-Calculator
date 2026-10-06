import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function getFallbackMessage(
  currentPoints: number,
  maxPossibleGrade: string,
  currentPercentage: number,
  distributedPoints: number,
  pointsRemaining: number
): string {
  if (maxPossibleGrade === 'F') {
    return `While mathematically the remaining ${pointsRemaining} points mean it's not possible to reach a passing grade in BUAD 2231 this term, please do not be discouraged. Please connect with me or your academic advisor as soon as possible so we can discuss constructive options such as course withdrawal or retaking the course next term.`;
  }

  if (currentPercentage >= 80) {
    return `Great job on your progress so far! You have earned ${currentPoints} out of ${distributedPoints} distributed points, putting you in a strong position for a final grade of ${maxPossibleGrade}. Stay diligent and focused through the final ${pointsRemaining} points to finish the semester on top!`;
  }

  const instructorEncouragement =
    currentPercentage < 70
      ? 'Since your current standing is below 70%, please make sure to connect with me during office hours to gain a stronger grasp of the course materials.\n\n'
      : '';

  return `You currently have ${currentPoints} out of ${distributedPoints} points, and you still have the potential to achieve a grade of ${maxPossibleGrade}. The remaining ${pointsRemaining} points offer a great opportunity to improve your standing.\n\n${instructorEncouragement}Key recommendations to maximize your final grade:\n• Make sure not to miss any class meetings and Connect activities.\n• Try to maximize points from every remaining activity.\n• Finish all Connect activities before taking the exam.\n• Reach out to the instructor if you need help understanding the course materials.\n\nKeep pushing forward and finish the semester strong!`;
}

app.post('/api/feedback', async (req, res) => {
  const { currentPoints, maxPossibleGrade, currentPercentage, distributedPoints, pointsRemaining } = req.body;

  if (!ai) {
    return res.json({
      message: getFallbackMessage(
        Number(currentPoints),
        String(maxPossibleGrade),
        Number(currentPercentage),
        Number(distributedPoints),
        Number(pointsRemaining)
      ),
    });
  }

  try {
    let prompt: string;
    if (maxPossibleGrade === 'F') {
      prompt = `Act as a compassionate but direct college professor for BUAD 2231. A student has earned ${currentPoints} out of ${distributedPoints} points so far. Based on the remaining ${pointsRemaining} points, it is not mathematically possible for them to pass. Write a very compact, honest, and supportive message (1-2 sentences). Acknowledge this is difficult news, avoid false hope, and gently advise them to meet with you or an advisor to discuss options like course withdrawal or retaking it. The tone should be empathetic and focused on constructive next steps.`;
    } else if (currentPercentage >= 80) {
      prompt = `Act as a proud but realistic college professor for BUAD 2231. A student has earned ${currentPoints} out of ${distributedPoints} points, a strong performance. Their highest possible grade is an ${maxPossibleGrade}. Write a very compact, complimentary message (1-2 sentences). Acknowledge their excellent work, but encourage them to stay focused, as the remaining ${pointsRemaining} points are crucial for securing a top grade. Keep the tone positive and motivating.`;
    } else {
      const lowPerformanceAdvice =
        currentPercentage < 70
          ? ' Since their current performance is below 70%, specifically encourage them to connect with you (the instructor) to get help in gaining a better understanding of the course materials.'
          : '';
      prompt = `Act as a supportive and direct college professor for BUAD 2231. A student has earned ${currentPoints} out of ${distributedPoints} points, and their highest possible grade is a ${maxPossibleGrade}. The final ${pointsRemaining} points are a significant opportunity. Write a compact, motivational message.${lowPerformanceAdvice} Briefly acknowledge their current standing, then provide these specific suggestions as a bulleted list:
* Make sure not to miss any class meetings and Connect activities.
* Try to maximize points from every remaining activity.
* Finish all Connect activities before taking the exam.
* Reach out to the instructor if you need help understanding the course materials.
End with a brief, encouraging sentence about finishing the semester strong. The tone should be direct but hopeful.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) {
      return res.json({ message: text });
    }

    return res.json({
      message: getFallbackMessage(
        Number(currentPoints),
        String(maxPossibleGrade),
        Number(currentPercentage),
        Number(distributedPoints),
        Number(pointsRemaining)
      ),
    });
  } catch (err) {
    console.error('Error generating feedback via Gemini:', err);
    return res.json({
      message: getFallbackMessage(
        Number(currentPoints),
        String(maxPossibleGrade),
        Number(currentPercentage),
        Number(distributedPoints),
        Number(pointsRemaining)
      ),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
