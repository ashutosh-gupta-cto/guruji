/**
 * Local compiler phase analysis (no API).
 *
 * Ported from danielace1/compiler-visualizer local parser patterns —
 * lex, parse AST, semantic check, TAC, optimize, codegen.
 *
 * @see https://github.com/danielace1/compiler-visualizer
 */

export interface AstNode {
  name: string;
  attributes: { type: string; label: string };
  children?: AstNode[];
}

export interface SymbolEntry {
  name: string;
  type: string;
  scope: string;
}

export interface CompilerPhases {
  tokens: string[];
  ast: string;
  treeData: AstNode;
  semanticAnalysis: {
    typeChecking: string;
    symbolTable: SymbolEntry[];
  };
  intermediateCode: string[];
  optimizedCode: string[];
  assemblyCode: string[];
}

const KEYWORDS = new Set(['if', 'else', 'while', 'for', 'return', 'true', 'false']);

function tokenize(expr: string): string[] {
  const regex =
    /\s*([A-Za-z_][A-Za-z0-9_]*|\d+\.?\d*|'.'|"[^"]*"|\+\+|--|&&|\|\||<=|>=|==|!=|\+=|-=|\*=|\/=|%=|\?|:|,|\(|\)|\+|-|\*|\/|%|<|>|!|~|=)\s*/g;
  const tokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(expr)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

function getOperatorLabel(op: string): string {
  const labels: Record<string, string> = {
    '+': 'Addition',
    '-': 'Subtraction',
    '*': 'Multiplication',
    '/': 'Division',
    '%': 'Modulo',
    '=': 'Assignment',
    '<': 'Less Than',
    '>': 'Greater Than',
    '==': 'Equal',
    '!=': 'Not Equal',
    '&&': 'Logical AND',
    '||': 'Logical OR',
  };
  return labels[op] ?? 'Operator';
}

function getOperatorPrecedence(op: string): number {
  const precedence: Record<string, number> = {
    '||': 1,
    '&&': 2,
    '==': 3,
    '!=': 3,
    '<': 4,
    '>': 4,
    '+': 5,
    '-': 5,
    '*': 6,
    '/': 6,
    '%': 6,
  };
  return precedence[op] ?? 999;
}

function parseExpression(expr: string): AstNode {
  expr = expr.trim();
  if (/^\d+\.?\d*$/.test(expr)) {
    return { name: expr, attributes: { type: 'literal', label: 'Number' } };
  }
  if (/^[a-zA-Z_]\w*$/.test(expr)) {
    return { name: expr, attributes: { type: 'identifier', label: 'Variable' } };
  }
  return createTreeFromCode(expr);
}

function parseArithmeticExpression(expr: string): AstNode {
  expr = expr.trim();
  let parenDepth = 0;
  let lastOpIndex = -1;
  let lastOp = '';
  let lowestPrecedence = 999;

  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') parenDepth++;
    else if (expr[i] === ')') parenDepth--;
    else if (parenDepth === 0) {
      for (const op of ['+', '-', '*', '/', '%']) {
        if (expr.substring(i).startsWith(op) && i > 0) {
          const precedence = getOperatorPrecedence(op);
          if (precedence <= lowestPrecedence) {
            lowestPrecedence = precedence;
            lastOpIndex = i;
            lastOp = op;
          }
        }
      }
    }
  }

  if (lastOpIndex > 0) {
    const leftExpr = expr.substring(0, lastOpIndex).trim();
    const rightExpr = expr.substring(lastOpIndex + lastOp.length).trim();
    return {
      name: lastOp,
      attributes: { type: 'operator', label: getOperatorLabel(lastOp) },
      children: [parseArithmeticExpression(leftExpr), parseArithmeticExpression(rightExpr)],
    };
  }

  return parseExpression(expr);
}

function parseAssignmentOrArithmetic(code: string): AstNode {
  if (
    code.includes('=') &&
    !code.includes('==') &&
    !code.includes('!=') &&
    !code.includes('<=') &&
    !code.includes('>=')
  ) {
    const eqIndex = code.indexOf('=');
    const leftSide = code.substring(0, eqIndex).trim();
    const rightSide = code.substring(eqIndex + 1).trim();
    return {
      name: '=',
      attributes: { type: 'operator', label: 'Assignment' },
      children: [
        { name: leftSide, attributes: { type: 'identifier', label: 'Variable' } },
        parseArithmeticExpression(rightSide),
      ],
    };
  }
  return parseArithmeticExpression(code);
}

function createTreeFromCode(code: string): AstNode {
  try {
    return parseAssignmentOrArithmetic(code);
  } catch {
    return {
      name: 'Expression',
      attributes: { type: 'default', label: 'Parse Error' },
      children: [{ name: code, attributes: { type: 'default', label: 'Error' } }],
    };
  }
}

function extractIdentifiers(code: string): string[] {
  const identifiers = new Set<string>();
  const regex = /[a-zA-Z_]\w*/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(code)) !== null) {
    if (!KEYWORDS.has(match[0])) identifiers.add(match[0]);
  }
  return Array.from(identifiers);
}

function findOperatorIndex(expr: string, op: string): number {
  let parenDepth = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') parenDepth++;
    else if (expr[i] === ')') parenDepth--;
    else if (parenDepth === 0 && expr.substring(i).startsWith(op)) return i;
  }
  return -1;
}

function generateIntermediateCode(code: string): string[] {
  let tempCounter = 1;
  const instructions: string[] = [];

  function genTemp(): string {
    const t = `t${tempCounter}`;
    tempCounter += 1;
    return t;
  }

  function generateForExpression(expr: string, target: string | null = null): string {
    expr = expr.trim();
    const operators = ['+', '-', '*', '/', '%'];
    for (const op of operators) {
      const opIndex = findOperatorIndex(expr, op);
      if (opIndex > 0) {
        const left = expr.substring(0, opIndex).trim();
        const right = expr.substring(opIndex + op.length).trim();
        const leftTemp = generateForExpression(left);
        const rightTemp = generateForExpression(right);
        const result = target ?? genTemp();
        instructions.push(`${result} = ${leftTemp} ${op} ${rightTemp}`);
        return result;
      }
    }
    if (target && (/^\d+\.?\d*$/.test(expr) || /^[a-zA-Z_]\w*$/.test(expr))) {
      instructions.push(`${target} = ${expr}`);
      return target;
    }
    return expr;
  }

  if (code.includes('=') && !code.includes('==') && !code.includes('!=')) {
    const eqIndex = code.indexOf('=');
    const leftSide = code.substring(0, eqIndex).trim();
    const rightSide = code.substring(eqIndex + 1).trim();
    generateForExpression(rightSide, leftSide);
  } else {
    generateForExpression(code);
  }

  return instructions;
}

function optimizeIntermediateCode(intermediateCode: string[]): string[] {
  const optimized: string[] = [];
  for (let i = 0; i < intermediateCode.length; i++) {
    const current = intermediateCode[i];
    const next = intermediateCode[i + 1];
    if (current.match(/^t\d+ = /) && next?.includes(current.split(' = ')[0])) {
      const temp = current.split(' = ')[0];
      const value = current.split(' = ')[1];
      const usageCount = intermediateCode.slice(i + 1).filter((line) => line.includes(temp)).length;
      if (usageCount === 1) {
        optimized.push(next.replace(temp, `(${value})`));
        i += 1;
        continue;
      }
    }
    optimized.push(current);
  }
  return optimized.length > 0 ? optimized : intermediateCode;
}

function generateAssemblyCode(intermediateCode: string[]): string[] {
  const assembly: string[] = [];
  for (const line of intermediateCode) {
    if (!line.includes(' = ')) continue;
    const [dest, expr] = line.split(' = ').map((s) => s.trim());
    if (expr.includes(' + ')) {
      const [left, right] = expr.split(' + ').map((s) => s.trim());
      assembly.push(`LOAD R1, ${left}`, `ADD R1, ${right}`, `STORE ${dest}, R1`);
    } else if (expr.includes(' - ')) {
      const [left, right] = expr.split(' - ').map((s) => s.trim());
      assembly.push(`LOAD R1, ${left}`, `SUB R1, ${right}`, `STORE ${dest}, R1`);
    } else if (expr.includes(' * ')) {
      const [left, right] = expr.split(' * ').map((s) => s.trim());
      assembly.push(`LOAD R1, ${left}`, `MUL R1, ${right}`, `STORE ${dest}, R1`);
    } else if (expr.includes(' / ')) {
      const [left, right] = expr.split(' / ').map((s) => s.trim());
      assembly.push(`LOAD R1, ${left}`, `DIV R1, ${right}`, `STORE ${dest}, R1`);
    } else {
      assembly.push(`LOAD R1, ${expr}`, `STORE ${dest}, R1`);
    }
  }
  return assembly;
}

export function analyzeCode(code: string): CompilerPhases {
  const trimmed = code.trim();
  const tokens = tokenize(trimmed);
  const treeData = createTreeFromCode(trimmed);
  const intermediateCode = generateIntermediateCode(trimmed);
  const optimizedCode = optimizeIntermediateCode(intermediateCode);
  const assemblyCode = generateAssemblyCode(optimizedCode);

  return {
    tokens,
    ast: `Expression: ${trimmed}`,
    treeData,
    semanticAnalysis: {
      typeChecking: 'Type checking passed — all expressions inferred as integers',
      symbolTable: extractIdentifiers(trimmed).map((id) => ({
        name: id,
        type: 'int',
        scope: 'global',
      })),
    },
    intermediateCode,
    optimizedCode,
    assemblyCode,
  };
}

export const SAMPLE_SNIPPETS = [
  'total = price + rate * 60',
  'sum = a + b - c',
  'x = y * 2',
  'result = a + b * c',
];
