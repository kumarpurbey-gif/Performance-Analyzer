
import { GoogleGenAI } from "@google/genai";
import type { PerformanceMetrics } from '../types';

export async function getPerformanceAnalysis(baseline: PerformanceMetrics, withExtension: PerformanceMetrics): Promise<string> {
  if (!process.env.API_KEY) {
    return "API_KEY environment variable is not set. Please set it to use the AI analysis feature.";
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a senior web performance engineer. Analyze the following web performance data for a website tested with and without a browser extension.

    **Performance Metrics definitions:**
    - FCP (First Contentful Paint): Time until the first piece of content is painted. Lower is better.
    - LCP (Largest Contentful Paint): Time until the largest content element is visible. Lower is better. A key user experience metric.
    - CLS (Cumulative Layout Shift): Measures visual stability. Lower is better (closer to 0).
    - TBT (Total Blocking Time): Measures main-thread blocking time. Lower is better.
    - Load Time: Total page load time. Lower is better.

    **Baseline Data (Without Extension):**
    \`\`\`json
    ${JSON.stringify(baseline, null, 2)}
    \`\`\`

    **With Extension Data:**
    \`\`\`json
    ${JSON.stringify(withExtension, null, 2)}
    \`\`\`

    **Your Task:**
    1.  **Summarize the Impact:** Briefly state the overall performance impact of the extension (e.g., negligible, minor, moderate, significant regression).
    2.  **Metric-by-Metric Analysis:** For each metric, calculate the percentage change and explain what this change means in practical terms. Focus on the most significant regressions.
    3.  **Identify Potential Causes:** Based on the affected metrics, hypothesize the likely causes. For example:
        - If LCP and FCP are up, the extension might be blocking rendering with synchronous scripts or heavy CSS.
        - If TBT is up, the extension is likely running long-running JavaScript tasks on the main thread.
        - If CLS is up, the extension is probably injecting UI elements into the page without reserving space.
    4.  **Provide Actionable Recommendations:** Suggest concrete, specific steps the extension developers could take to mitigate these performance issues. Examples:
        - "Use 'requestIdleCallback' for non-essential tasks."
        - "Asynchronously inject scripts using '<script async>'."
        - "Pre-calculate and reserve space for injected UI to avoid layout shifts."
        - "Optimize long tasks by breaking them into smaller chunks using 'setTimeout'."

    Format your response in clear, well-structured Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI analysis request failed. See console for details.");
  }
}
