import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
class TaskPlanner {
    private gemini: GoogleGenerativeAI;
    public projectPath: string;
    private task: string;
    private model: any;
    private generationConfig: object;
    private history: { role: string; content: string }[] = [];

    constructor(task: string) {
        this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        this.task = task;
        this.projectPath = process.cwd();
        this.model = this.gemini.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });
        this.generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
    }

    private scanDirectory(dir: string): string[] {
        let files: string[] = [];
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                files = files.concat(this.scanDirectory(fullPath));
            } else {
                files.push(fullPath);
            }
        });
        return files;
    }

    private readFileContent(filePath: string): string {
        return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    }

    public async generatePlanAndSuggestChanges(filePath?: string): Promise<string | undefined> {
        const fileContent = filePath ? this.readFileContent(filePath) : '';
        const prompt = `Given the following codebase structure: ${this.scanDirectory(this.projectPath).join('\n')}` +
            (fileContent ? `\n\nFile Content (${filePath}):\n${fileContent}` : '') +
            `\n\nProvide a detailed step-by-step plan on how to implement this Task: ${this.task}` +
            ` Analyze the code and suggest changes to implement: ${this.task}`;

        const chatSession = this.model.startChat({
            generationConfig: this.generationConfig,
            history: this.history,
        });

        const result = await chatSession.sendMessage(prompt);
        return result.response.text();
    }

    public async execute(filePath?: string): Promise<void> {
        console.log('\nGenerating Implementation Plan, Analyzing Code and Suggesting Changes...');
        console.log('\nHold on, this might take a while... 🍿');
        const planAndSuggestions = await this.generatePlanAndSuggestChanges(filePath);
        console.log('\nSuggested Changes:\n', planAndSuggestions);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// rl.question('Enter your task: ', async (task) => {
//     rl.question('Enter the file name to analyze (or press Enter to scan all files): ', async (fileName) => {
//         const planner = new TaskPlanner(task);
//         await planner.execute(fileName ? path.join(planner.projectPath, fileName) : undefined);
//         rl.close();
//     });
// });

const promptForTask = async () => {
    rl.question('\nEnter your task (or type "exit" to quit): ', async (task) => {
        if (task.toLowerCase() === "exit") {
            console.log("\nExiting... 👋");
            rl.close();
            return;
        }

        rl.question('Enter the file name to analyze (or press Enter to scan all files): ', async (fileName) => {
            const planner = new TaskPlanner(task);
            await planner.execute(fileName ? path.join(planner.projectPath, fileName) : undefined);

            // After completing, ask for another task
            promptForTask();
        });
    });
};

promptForTask();