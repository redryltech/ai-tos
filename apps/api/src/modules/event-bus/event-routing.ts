/**
 * Topic routing helpers.
 * Patterns:
 * - exact: `ai.request.completed`
 * - single-segment wildcard: `ai.*.completed`
 * - multi-segment wildcard: `ai.#` or `kernel.#`
 */

export function topicMatches(pattern: string, topic: string): boolean {
  if (pattern === topic) return true;
  if (pattern === '#' || pattern === '*') return true;

  const patternParts = pattern.split('.');
  const topicParts = topic.split('.');

  let pi = 0;
  let ti = 0;
  while (pi < patternParts.length && ti < topicParts.length) {
    const p = patternParts[pi];
    if (p === '#') {
      return true;
    }
    if (p === '*' || p === topicParts[ti]) {
      pi += 1;
      ti += 1;
      continue;
    }
    return false;
  }

  if (pi === patternParts.length && ti === topicParts.length) return true;
  if (pi === patternParts.length - 1 && patternParts[pi] === '#') return true;
  return false;
}

export function assertValidTopic(topic: string): void {
  if (!/^[a-z][a-z0-9_-]*(\.[a-z0-9_-]+)+$/i.test(topic)) {
    throw new Error(
      `Invalid event topic "${topic}". Use dotted segments, e.g. kernel.job.started`,
    );
  }
}
