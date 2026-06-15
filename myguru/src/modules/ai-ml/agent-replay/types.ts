export type Role = 'user' | 'assistant';

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: unknown;
  is_error?: boolean;
}

export type ContentBlock =
  | TextBlock
  | ThinkingBlock
  | ToolUseBlock
  | ToolResultBlock;

export interface RawMessage {
  role: Role;
  content: string | ContentBlock[];
}

export type StepKind =
  | 'user'
  | 'assistant'
  | 'thinking'
  | 'tool_call'
  | 'tool_result';

export interface Step {
  index: number;
  kind: StepKind;
  text?: string;
  toolName?: string;
  toolInput?: unknown;
  toolUseId?: string;
  isError?: boolean;
}

export interface TraceStats {
  messages: number;
  toolCalls: number;
  tools: string[];
  errors: number;
}

export interface ParseResult {
  ok: boolean;
  steps: Step[];
  stats: TraceStats;
  error?: string;
}

export interface SampleTrace {
  id: string;
  title: string;
  description: string;
  messages: RawMessage[];
}
