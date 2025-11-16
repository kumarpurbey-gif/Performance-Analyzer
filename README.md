# Chrome Extension Performance Analyzer

This tool provides an automation framework to measure and analyze the performance impact of a Chrome browser extension on websites. It runs side-by-side performance tests (with and without a simulated extension workload) and uses the Google Gemini API to provide actionable optimization suggestions.

## Key Features

- **Side-by-Side Comparison:** See a direct comparison of key web performance metrics with and without the extension's simulated impact.
- **Historical Tracking:** A chart visualizes the Largest Contentful Paint (LCP) over multiple test runs, helping you track performance improvements or regressions over time.
- **AI-Powered Analysis:** Leverages Google's Gemini model to analyze the data, identify potential causes of performance degradation, and suggest specific, actionable recommendations for developers.
- **Sandboxed Testing:** All tests are run within a sandboxed `iframe` to isolate the process and ensure security.

---

## Installation and Setup

Follow these steps to run the application locally.

1.  **Clone the Repository**
    ```bash
    # Make sure to replace <repository-url> with the actual URL
    git clone <repository-url>
    cd chrome-extension-performance-analyzer
    ```

2.  **Set up your Gemini API Key**
    This project uses the Google Gemini API for its AI analysis feature. You will need to obtain an API key from [Google AI Studio](https://aistudio.google.com/).

    *   In the root of the project directory, you'll need to make your API key available as an environment variable. The specific method depends on how you serve the files. The application code will access it via `process.env.API_KEY`.

3.  **Run the Application**
    This project is set up to run directly in the browser without a complex build step. You just need to serve the files from a local web server. An easy way to do this is with the `serve` package.

    *   If you don't have it, you can run it directly with `npx`:
    ```bash
    npx serve
    ```
    *   This will start a local server. You can then open the provided URL (usually `http://localhost:3000`) in your browser to use the application.

---

## How it Works

The application simulates the performance impact of an extension by running two tests for any given URL:

1.  **Baseline Test:** The URL is loaded in an `iframe`, and standard performance metrics are collected using the browser's `PerformanceObserver` API. This represents the website's performance without any interference.
2.  **"With Extension" Test:** The URL is loaded in a separate `iframe`. After the page loads, the tool injects a script that simulates a "heavy" extension by performing:
    -   **Intensive DOM Manipulation:** It adds hundreds of new elements to the page to simulate UI injections.
    -   **Main Thread Blocking:** It runs a synchronous script to simulate long-running JavaScript tasks that can freeze the page.

The metrics from both tests are then compared to calculate the performance "delta," or the impact of the simulated extension.

---

## How to Understand the Report

### 1. Performance Results Table

This is the core of the analysis, showing a direct comparison.

| Metric | Baseline | With Extension | Impact (Delta) |
| :--- | :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | The speed of your main content loading. | **Lower is better.** | `red` = Bad |
| **First Contentful Paint (FCP)** | The speed of the *first* content loading. | **Lower is better.** | `red` = Bad |
| **Total Blocking Time (TBT)** | Measures how "frozen" the page is during load. | **Lower is better.** | `red` = Bad |
| **Page Load Time** | Total time for the page to load. | **Lower is better.** | `red` = Bad |
| **Cumulative Layout Shift (CLS)** | Measures how much the page layout shifts unexpectedly. | **Lower (closer to 0) is better.** | `red` = Bad |

-   **Baseline:** The website's natural performance. This is your control group.
-   **With Extension:** The site's performance under the stress of the simulated extension.
-   **Impact (Delta):** The difference between the two.
    -   A **positive number** (e.g., `+200ms`) means the metric got worse.
    -   The text will be colored **red** for significant regressions, helping you quickly spot problem areas.

### 2. LCP History Chart

This chart tracks the LCP metric for both "Baseline" and "With Extension" tests across multiple runs. It's useful for visualizing if your optimization efforts are working over time. If the orange line ("Extension LCP") starts getting closer to the green line ("Baseline LCP"), you're making progress!

### 3. AI Performance Analysis

Clicking the **"Get AI Analysis"** button sends the raw performance data to the Google Gemini API with a specialized prompt. The AI acts as a senior performance engineer to give you:

-   **A High-Level Summary:** A quick overview of the extension's overall impact.
-   **Metric-by-Metric Breakdown:** An explanation of *what* the change in each metric means for user experience.
-   **Potential Causes:** Based on which metrics were affected, the AI will hypothesize the root cause. For example:
    -   High TBT? -> "The extension is likely running heavy JavaScript on the main thread."
    -   High CLS? -> "The extension is likely adding UI to the page without reserving space first."
-   **Actionable Recommendations:** Specific, concrete coding advice for developers to fix the identified issues (e.g., "Use `requestIdleCallback` for non-critical tasks," or "Break up long tasks with `setTimeout`.").

### Disclaimer

The "extension simulation" is a generalized workload. The actual performance impact of your specific extension will vary based on its architecture. This tool is designed to be a powerful starting point for identifying potential bottlenecks and guiding your optimization strategy.