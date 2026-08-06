import { Injectable } from '@nestjs/common';
import type { ICapabilityResolver } from '../contracts/output.contracts';
import type { BuildOutputInputDto } from '../dto/build-output-input.dto';
import type {
  CapabilityName,
  CapabilityRequirement,
  CapabilityRequirements,
  IntentContext,
} from '../models/execution-intent.models';

const ALL_CAPABILITIES: readonly CapabilityName[] = [
  'reasoning',
  'vision',
  'speech',
  'memory',
  'knowledge',
  'search',
  'tools',
  'coding',
  'translation',
  'image',
] as const;

/**
 * Capability Resolver — resolve required capabilities from IntentContext.
 * Never binds to providers or workers.
 */
@Injectable()
export class CapabilityResolver implements ICapabilityResolver {
  resolve(context: IntentContext, input: BuildOutputInputDto): CapabilityRequirements {
    const byName = new Map<CapabilityName, CapabilityRequirement>();

    const add = (name: CapabilityName, reason: string, required = true): void => {
      if (byName.has(name)) return;
      byName.set(
        name,
        Object.freeze({ name, reason, required }),
      );
    };

    add('reasoning', 'Cognitive handoff always requires reasoning capability', true);
    add('knowledge', 'Strategy and objectives require knowledge capability', true);

    const text = [
      context.goal,
      context.strategy.summary,
      context.strategy.selectedActionTitle,
      ...context.tasks.map((t) => `${t.title} ${t.description}`),
      ...context.constraints,
    ]
      .join(' ')
      .toLowerCase();

    if (/\b(image|vision|ocr|screenshot|photo)\b/.test(text)) {
      add('vision', 'Blueprint references visual content', true);
      add('image', 'Blueprint references image processing', true);
    }
    if (/\b(speech|audio|voice|transcri)\b/.test(text)) {
      add('speech', 'Blueprint references speech/audio', true);
    }
    if (/\b(memory|recall|remember|session)\b/.test(text)) {
      add('memory', 'Blueprint references memory/session continuity', false);
    }
    if (/\b(search|retrieve|lookup|query)\b/.test(text)) {
      add('search', 'Blueprint references search/retrieval', true);
    }
    if (/\b(tool|api|webhook|integration)\b/.test(text)) {
      add('tools', 'Blueprint references external tools', true);
    }
    if (/\b(code|coding|script|compile|repo)\b/.test(text)) {
      add('coding', 'Blueprint references coding work', true);
    }
    if (/\b(translat|locale|language)\b/.test(text)) {
      add('translation', 'Blueprint references translation/locale', false);
    }

    if (context.tasks.some((t) => t.kind === 'verify')) {
      add('tools', 'Verification tasks may require tool capability', false);
    }

    for (const raw of input.outputHints?.extraCapabilities ?? []) {
      const name = raw.trim().toLowerCase() as CapabilityName;
      if ((ALL_CAPABILITIES as readonly string[]).includes(name)) {
        add(name, `Requested via outputHints.extraCapabilities`, false);
      }
    }

    const requirements = Object.freeze([...byName.values()]);
    const names = Object.freeze(requirements.map((r) => r.name));

    return Object.freeze({
      requirements,
      names,
      summary: `Resolved ${names.length} capabilities: ${names.join(', ')}`,
    });
  }
}
