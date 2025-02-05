import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

class TaskPlanner {
    private gemini: GoogleGenerativeAI;
    public projectPath: string;
    private task: string;
    private model: any;
    private generationConfig: object;
    private history: { role: string; content: string }[] = [];

    constructor(task: string) {
        dotenv.config();
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

    public async generateTaskPlan(filePath?: string): Promise<string | undefined> {
        const fileContent = filePath ? this.readFileContent(filePath) : '';
        const prompt = `Given the following codebase structure:${this.scanDirectory(this.projectPath).join('\n')}` +
            (fileContent ? `File Content (${filePath}):${fileContent}` : '') +
            `Plan steps to implement: ${this.task}`;

        const chatSession = this.model.startChat({
            generationConfig: this.generationConfig,
            history: this.history,
        });

        const result = await chatSession.sendMessage(prompt);
        return result.response.text();
    }

    public async editOrCreateFile(filePath: string): Promise<void> {
        let fileContent = this.readFileContent(filePath);
        const prompt = `Modify the following file content to implement the task: ${this.task}\n\n\nCurrent content:${fileContent || '(File is empty)'}Provide the updated content:`;

        const chatSession = this.model.startChat({
            generationConfig: this.generationConfig,
            history: this.history,
        });

        const result = await chatSession.sendMessage(prompt);
        const updatedContent = result.response.text();

        fs.writeFileSync(filePath, updatedContent, 'utf-8');
        console.log(`Updated file: ${filePath}`);
    }

    public async execute(): Promise<void> {
        const plan = await this.generateTaskPlan();
        console.log('\nGenerated Task Plan:\n', plan);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your task: ', async (task) => {
    rl.question('Enter the file name to modify (or press Enter to skip): ', async (fileName) => {
        const planner = new TaskPlanner(task);
        await planner.execute();

        if (fileName) {
            const filePath = path.join(planner.projectPath, fileName);
            await planner.editOrCreateFile(filePath);
        }
        rl.close();
    });
});