import { POINTS_DISTRIBUTED, POINTS_REMAINING } from "../constants";

function getClientFallback(
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
            ? "Since your current standing is below 70%, please make sure to connect with me during office hours to gain a stronger grasp of the course materials.\n\n"
            : "";

    return `You currently have ${currentPoints} out of ${distributedPoints} points, and you still have the potential to achieve a grade of ${maxPossibleGrade}. The remaining ${pointsRemaining} points offer a great opportunity to improve your standing.\n\n${instructorEncouragement}Key recommendations to maximize your final grade:
• Make sure not to miss any class meetings and Connect activities.
• Try to maximize points from every remaining activity.
• Finish all Connect activities before taking the exam.
• Reach out to the instructor if you need help understanding the course materials.

Keep pushing forward and finish the semester strong!`;
}

export const generateMessage = async (
    currentPoints: number,
    maxPossibleGrade: string,
    currentPercentage: number,
    distributedPoints: number = POINTS_DISTRIBUTED,
    pointsRemaining: number = POINTS_REMAINING
): Promise<string> => {
    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPoints,
                maxPossibleGrade,
                currentPercentage,
                distributedPoints,
                pointsRemaining,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();
        if (data.message) {
            return data.message;
        }

        return getClientFallback(currentPoints, maxPossibleGrade, currentPercentage, distributedPoints, pointsRemaining);
    } catch (error) {
        console.warn("Using fallback feedback:", error);
        return getClientFallback(currentPoints, maxPossibleGrade, currentPercentage, distributedPoints, pointsRemaining);
    }
};
