export interface AnatomyArrow {
  from: 1 | 2 | 3;
  to: 1 | 2 | 3;
  label: string;
  color: string;
}

export interface AnatomyCard {
  lane: 'user' | 'agent' | 'llm' | 'agent-llm';
  tags: { label: string; tone: string }[];
  text: string;
  json?: string;
}

export interface AnatomyStep {
  turn?: number;
  turnLabel?: string;
  arrows?: AnatomyArrow[];
  cards?: AnatomyCard[];
  insight?: string;
}

export const ANATOMY_STEPS: AnatomyStep[] = [
  {
    turn: 1,
    turnLabel: 'User sends a request',
  },
  {
    arrows: [{ from: 1, to: 2, label: 'user message', color: 'var(--aiml-anatomy-green)' }],
    cards: [
      {
        lane: 'user',
        tags: [{ label: 'input', tone: 'green' }],
        text: '"Build a todo API"',
      },
    ],
    insight: "The user's text reaches the Agent. The LLM is not involved yet.",
  },
  {
    arrows: [{ from: 2, to: 3, label: 'API request', color: 'var(--aiml-anatomy-orange)' }],
    cards: [
      {
        lane: 'agent-llm',
        tags: [
          { label: 'system', tone: 'cyan' },
          { label: 'tools', tone: 'orange' },
          { label: 'user msg', tone: 'green' },
        ],
        text: 'Agent assembles context and sends to the LLM API:',
        json: `{
  "system": "You are a coding agent…",
  "tools": [{ "name": "Bash" }, { "name": "Write" }],
  "messages": [{ "role": "user", "content": "Build a todo API" }]
}`,
      },
    ],
    insight:
      'Agent job #1: assemble system + tools[] + messages[] and call the LLM. Skills are text in system; MCP tools sit in tools[].',
  },
  {
    arrows: [{ from: 3, to: 2, label: 'response (tool_use)', color: 'var(--aiml-anatomy-accent)' }],
    cards: [
      {
        lane: 'llm',
        tags: [{ label: 'LLM decides', tone: 'accent' }],
        text: 'LLM outputs a tool_use — it requests execution but does not run anything:',
        json: `{
  "content": [
    { "type": "text", "text": "Checking project structure." },
    { "type": "tool_use", "name": "Bash",
      "input": { "command": "ls -la" } }
  ]
}`,
      },
    ],
    insight: 'tool_use is an execution request, not execution. The LLM only outputs JSON.',
  },
  {
    cards: [
      {
        lane: 'agent',
        tags: [{ label: 'execute', tone: 'orange' }],
        text: 'Agent parses tool_use and runs locally:\n\n$ ls -la\npackage.json\nsrc/routes/\ntests/',
      },
    ],
    insight: 'Agent job #2: detect tool_use, execute, collect results.',
  },
  {
    turn: 2,
    turnLabel: 'Agent returns result to LLM',
  },
  {
    arrows: [{ from: 2, to: 3, label: 'tool_result + re-request', color: 'var(--aiml-anatomy-orange)' }],
    cards: [
      {
        lane: 'agent-llm',
        tags: [
          { label: 'tool_result', tone: 'orange' },
          { label: 'history grows', tone: 'red' },
        ],
        text: 'Agent appends execution result as a user message and calls LLM again:',
        json: `"messages": [
  { "role": "user", "content": "Build a todo API" },
  { "role": "assistant", "content": [..tool_use] },
  { "role": "user", "content": [{
    "type": "tool_result",
    "content": "package.json\\nsrc/routes/..."
  }] }
]`,
      },
    ],
    insight:
      'tool_result uses role "user" — there is no tool role in the LLM API. The LLM re-reads the entire messages[] each call (stateless).',
  },
  {
    turn: 3,
    turnLabel: 'Loop ends — no more tool_use',
  },
  {
    arrows: [{ from: 3, to: 2, label: 'text only', color: 'var(--aiml-anatomy-accent)' }],
    cards: [
      {
        lane: 'llm',
        tags: [{ label: 'done', tone: 'blue' }],
        text: 'LLM responds with text only — no tool_use:',
        json: `{ "content": [{ "type": "text",
  "text": "✅ Todo API complete" }],
  "stop_reason": "end_turn" }`,
      },
    ],
    insight: 'When the response has no tool_use, the Agent stops the loop and shows the text to the user.',
  },
  {
    arrows: [{ from: 2, to: 1, label: 'final result', color: 'var(--aiml-anatomy-orange)' }],
    cards: [
      {
        lane: 'user',
        tags: [{ label: 'result', tone: 'green' }],
        text: 'User sees: "✅ Todo API complete — CRUD router, tests passing."',
      },
    ],
    insight:
      'Agent = while(true) { assemble context → call LLM → parse response → execute tools → append results }. Context engineering is agent engineering.',
  },
];

export const ANATOMY_LANES = ['Human', 'Agent (code)', 'LLM (AI)'] as const;
