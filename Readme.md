# Traycer Task Planner

Traycer Task Planner is a tool that helps you generate a detailed step-by-step plan and suggest code changes for implementing a specific task in your codebase. It uses Google Generative AI to analyze your code and provide suggestions.

## Prerequisites

- Node.js installed on your machine
- A Google Generative AI API key

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/bhataasim1/traycer-task-planner.git
    cd traycer-task-planner
    ```

2. Install the dependencies:
    ```sh
    pnpm install
    ```

3. Create a `.env` file in the root directory and add your Google Generative AI API key:
    ```sh
    GEMINI_API_KEY=your_api_key_here
    ```

## Usage

1. Run the Task Planner:
    ```sh
    pnpm start
    ```

2. Enter your task when prompted:
    ```
    Enter your task: Implement user authentication
    ```

3. Enter the file name to analyze (or press Enter to scan all files):
    ```
    Enter the file name to analyze (or press Enter to scan all files): src/index.ts
    ```

4. The Task Planner will generate an implementation plan, analyze the code, and suggest changes. The suggestions will be displayed in the console.

## Example

```
Enter your task: Add a new feature to the project
Enter the file name to analyze (or press Enter to scan all files): src/app.ts

Generating Implementation Plan, Analyzing Code and Suggesting Changes...

Hold on, this might take a while... 🍿

Suggested Changes:
1. Modify the `src/app.ts` file to include the new feature.
2. Update the `src/routes.ts` file to handle new routes.
3. Add new tests in the `tests/app.test.ts` file.
...
```

## License

This project is licensed under the MIT License.