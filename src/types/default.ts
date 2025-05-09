
export interface FileDialogOptions {
  accept?: string;
  message?: string;
  title?: string;
  filters?: { name: string; extensions: string[] }[];
  buttonLabel?: string;
  multiple?: boolean; // return multiple files
}


export interface ChatHistory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Record<string, ChatMessage>;
}

export type LLMRoles = 'user' | 'assistant' | 'system' | 'tool';

export enum ToolType {
  CALLER = 'c',
  SUCCESS = 's',
  ERROR = 'e',
}

export enum ChatType {
  TEXT = 0,
  TOOL = 1,
}

export interface ChatMessage {
  id: string;
  role: LLMRoles;
  type: ChatType;
  toolContent?: any;// from response (llama cpp string, openai json)
  toolCalls?: any;//from llm request
  toolState?: ToolType;
  meta?: any[] | null;
  message: string;
  tokens: number;
  isStreaming?: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: string;
  tool_call_id?: string;
  name?: string;
}

export interface Prompt {
  id: string;
  name: string;
  systemPrompt: string;
  chatIDs: string[]; // ids of chat histories
}
