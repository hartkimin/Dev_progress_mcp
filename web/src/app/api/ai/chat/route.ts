import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createTaskDb, updateTaskStatus, updateProjectDocumentDb } from '@/lib/db';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, projectId } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are an AI project management assistant for VibePlanner. You help users plan tasks, write requirements, and architect their system.
    If the user asks you to create a task, update a task status, or write a document, ALWAYS use the available tools to actually perform the action in the system.
    Current Project ID: ${projectId || 'Unknown (Prompt the user to navigate to a project)'}`,
    tools: {
      createTask: tool({
        description: 'Create a new task in the current project',
        parameters: z.object({
          title: z.string().describe('The title of the task'),
          status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).describe('The status of the task'),
          taskType: z.string().optional().describe('Type of task: Docs, Coding, Prompting, etc.'),
        }),
        execute: async ({ title, status, taskType }) => {
          if (!projectId) return { error: 'No project context. User must be in a project page.' };
          try {
            const taskId = await createTaskDb(projectId, title, status, 'AI Assistant', taskType);
            return { success: true, taskId, message: `Task "${title}" created successfully.` };
          } catch (e: any) {
            return { success: false, error: e.message };
          }
        },
      }),
      updateTaskStatus: tool({
        description: 'Update the status of an existing task. Use this when the user says they finished something.',
        parameters: z.object({
          taskId: z.string().describe('The ID of the task to update'),
          status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).describe('The new status'),
        }),
        execute: async ({ taskId, status }) => {
          try {
            await updateTaskStatus(taskId, status, 'AI Assistant');
            return { success: true, message: `Task status updated to ${status}.` };
          } catch (e: any) {
            return { success: false, error: e.message };
          }
        },
      }),
      generateDocument: tool({
        description: 'Generate or update a project document (like PRD, Architecture, etc.) based on context.',
        parameters: z.object({
          docType: z.enum(['ARCHITECTURE', 'DATABASE', 'WORKFLOW', 'API', 'ENVIRONMENT', 'CHANGELOG']).describe('The type of document to update'),
          content: z.string().describe('The markdown content of the document'),
        }),
        execute: async ({ docType, content }) => {
          if (!projectId) return { error: 'No project context. User must be in a project page.' };
          try {
            await updateProjectDocumentDb(projectId, docType, content, 'AI Assistant');
            return { success: true, message: `${docType} document successfully generated and saved.` };
          } catch (e: any) {
            return { success: false, error: e.message };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
