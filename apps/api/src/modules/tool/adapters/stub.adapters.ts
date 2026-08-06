import type {
  ToolDescriptor,
  ToolExecutionMode,
  ToolRequest,
  ToolResult,
} from '../models/tool.models';
import { BUILTIN_TOOL_IDS } from '../models/tool.models';
import type { IToolAdapter } from './tool.adapter';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Deterministic stub tool adapters — no SaaS, no AI inference, no real shell. */
export function createStubToolAdapter(opts: {
  toolId: string;
  name: string;
  executionMode?: ToolExecutionMode;
  inputTypes?: readonly string[];
  outputTypes?: readonly string[];
  capabilities?: readonly string[];
  streamingSupport?: boolean;
  timeoutMs?: number;
  run: (request: ToolRequest) => Record<string, unknown>;
}): IToolAdapter {
  const descriptor: ToolDescriptor = Object.freeze({
    toolId: opts.toolId,
    name: opts.name,
    version: '1.0.0',
    lifecycle: 'active',
    inputTypes: Object.freeze([...(opts.inputTypes ?? ['object'])]),
    outputTypes: Object.freeze([...(opts.outputTypes ?? ['object'])]),
    executionMode: opts.executionMode ?? 'sync',
    timeoutMs: opts.timeoutMs ?? 30_000,
    capabilities: Object.freeze([...(opts.capabilities ?? ['deterministic'])]),
    streamingSupport: opts.streamingSupport ?? false,
    metadata: Object.freeze({ stub: true, saas: false, inference: false }),
  });

  return {
    adapterId: `${opts.toolId}-adapter`,
    toolId: opts.toolId,
    supports(toolId: string): boolean {
      return toolId === opts.toolId;
    },
    descriptor(): ToolDescriptor {
      return descriptor;
    },
    async execute(request: ToolRequest): Promise<ToolResult> {
      const started = Date.now();
      const output = opts.run(request);
      return Object.freeze({
        requestId: request.requestId,
        toolId: opts.toolId,
        status: 'completed',
        output: Object.freeze(output),
        metadata: Object.freeze({
          adapterId: `${opts.toolId}-adapter`,
          mode: request.options?.mode ?? descriptor.executionMode,
          stub: true,
        }),
        duration: Date.now() - started,
        traceId: request.traceId,
      });
    },
  };
}

function calculatorRun(request: ToolRequest): Record<string, unknown> {
  const expression = asString(request.input.expression, asString(request.input.text));
  const a = asNumber(request.input.a);
  const b = asNumber(request.input.b);
  const op = asString(request.input.op, '+');
  let result: number | string = 0;
  if (expression) {
    // Safe arithmetic subset only — no eval.
    const match = expression.trim().match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
    if (!match) return { error: 'unsupported_expression', expression };
    const left = Number(match[1]);
    const right = Number(match[3]);
    const operator = match[2]!;
    result =
      operator === '+'
        ? left + right
        : operator === '-'
          ? left - right
          : operator === '*'
            ? left * right
            : right === 0
              ? 'division_by_zero'
              : left / right;
  } else {
    result =
      op === '+'
        ? a + b
        : op === '-'
          ? a - b
          : op === '*'
            ? a * b
            : b === 0
              ? 'division_by_zero'
              : a / b;
  }
  return { result, expression: expression || `${a}${op}${b}` };
}

function jsonProcessorRun(request: ToolRequest): Record<string, unknown> {
  const action = asString(request.input.action, 'parse');
  if (action === 'stringify') {
    return { json: JSON.stringify(request.input.value ?? request.input.data ?? {}) };
  }
  const raw = asString(request.input.json, asString(request.input.text, '{}'));
  try {
    return { value: JSON.parse(raw) };
  } catch {
    return { error: 'invalid_json', raw };
  }
}

function csvProcessorRun(request: ToolRequest): Record<string, unknown> {
  const csv = asString(request.input.csv, asString(request.input.text));
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((cell) => cell.trim()));
  return { rows, rowCount: rows.length };
}

function encodingRun(request: ToolRequest): Record<string, unknown> {
  const action = asString(request.input.action, 'base64_encode');
  const text = asString(request.input.text, asString(request.input.value));
  if (action === 'base64_decode') {
    return { text: Buffer.from(text, 'base64').toString('utf8') };
  }
  if (action === 'hex_encode') {
    return { hex: Buffer.from(text, 'utf8').toString('hex') };
  }
  return { base64: Buffer.from(text, 'utf8').toString('base64') };
}

function compressionRun(request: ToolRequest): Record<string, unknown> {
  const text = asString(request.input.text, asString(request.input.value));
  return {
    algorithm: 'stub-deflate',
    originalBytes: Buffer.byteLength(text, 'utf8'),
    compressedRef: `compress:${Buffer.from(text).toString('base64').slice(0, 24)}`,
  };
}

export function createBuiltinToolAdapters(): IToolAdapter[] {
  const defs: Array<Parameters<typeof createStubToolAdapter>[0]> = [
    {
      toolId: 'filesystem',
      name: 'Filesystem',
      capabilities: ['read', 'write', 'list'],
      run: (r) => ({
        action: asString(r.input.action, 'stat'),
        path: asString(r.input.path, '/'),
        stub: true,
        exists: true,
      }),
    },
    {
      toolId: 'shell',
      name: 'Shell',
      capabilities: ['command'],
      run: (r) => ({
        command: asString(r.input.command),
        stdout: 'shell_stub_ok',
        exitCode: 0,
        note: 'deterministic_stub_no_os_exec',
      }),
    },
    {
      toolId: 'python_runtime',
      name: 'Python Runtime',
      capabilities: ['eval_stub'],
      run: (r) => ({
        code: asString(r.input.code),
        result: 'python_stub_ok',
      }),
    },
    {
      toolId: 'javascript_runtime',
      name: 'JavaScript Runtime',
      capabilities: ['eval_stub'],
      run: (r) => ({
        code: asString(r.input.code),
        result: 'javascript_stub_ok',
      }),
    },
    {
      toolId: 'http_client',
      name: 'HTTP Client',
      capabilities: ['request'],
      run: (r) => ({
        method: asString(r.input.method, 'GET'),
        url: asString(r.input.url),
        status: 200,
        body: { stub: true },
        note: 'no_network_stub',
      }),
    },
    {
      toolId: 'sql_executor',
      name: 'SQL Executor',
      capabilities: ['query'],
      run: (r) => ({
        sql: asString(r.input.sql, asString(r.input.query)),
        rows: [],
        rowCount: 0,
        note: 'no_db_stub',
      }),
    },
    {
      toolId: 'nosql_executor',
      name: 'NoSQL Executor',
      capabilities: ['query'],
      run: (r) => ({
        collection: asString(r.input.collection, 'default'),
        operation: asString(r.input.operation, 'find'),
        documents: [],
        note: 'no_db_stub',
      }),
    },
    {
      toolId: 'calculator',
      name: 'Calculator',
      inputTypes: ['number', 'string'],
      outputTypes: ['number', 'string'],
      capabilities: ['arithmetic'],
      run: calculatorRun,
    },
    {
      toolId: 'json_processor',
      name: 'JSON Processor',
      capabilities: ['parse', 'stringify'],
      run: jsonProcessorRun,
    },
    {
      toolId: 'csv_processor',
      name: 'CSV Processor',
      capabilities: ['parse'],
      run: csvProcessorRun,
    },
    {
      toolId: 'xml_processor',
      name: 'XML Processor',
      capabilities: ['parse'],
      run: (r) => ({
        xml: asString(r.input.xml, asString(r.input.text)),
        tags: (asString(r.input.xml, asString(r.input.text)).match(/<\/?[\w:-]+/g) ?? []).slice(
          0,
          20,
        ),
      }),
    },
    {
      toolId: 'compression',
      name: 'Compression',
      capabilities: ['compress'],
      run: compressionRun,
    },
    {
      toolId: 'encoding',
      name: 'Encoding',
      capabilities: ['base64', 'hex'],
      run: encodingRun,
    },
    {
      toolId: 'pdf_processor',
      name: 'PDF Processor',
      capabilities: ['extract'],
      run: (r) => ({
        source: asString(r.input.source, asString(r.input.path)),
        pages: 1,
        text: 'pdf_stub_text',
      }),
    },
    {
      toolId: 'archive_processor',
      name: 'Archive Processor',
      capabilities: ['list', 'extract'],
      run: (r) => ({
        archive: asString(r.input.archive, asString(r.input.path)),
        entries: ['stub/file.txt'],
      }),
    },
    {
      toolId: 'image_processor',
      name: 'Image Processor',
      capabilities: ['metadata'],
      run: (r) => ({
        source: asString(r.input.source, asString(r.input.path)),
        width: 1,
        height: 1,
        format: 'stub',
      }),
    },
    {
      toolId: 'browser_automation',
      name: 'Browser Automation',
      executionMode: 'async',
      streamingSupport: true,
      capabilities: ['navigate'],
      run: (r) => ({
        url: asString(r.input.url),
        title: 'browser_stub',
        note: 'no_browser_stub',
      }),
    },
  ];

  const adapters = defs.map((d) => createStubToolAdapter(d));
  const missing = BUILTIN_TOOL_IDS.filter(
    (id) => !adapters.some((a) => a.toolId === id),
  );
  if (missing.length > 0) {
    throw new Error(`Missing builtin tool adapters: ${missing.join(',')}`);
  }
  return adapters;
}
