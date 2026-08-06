import { Injectable } from '@nestjs/common';
import type { IKnowledgeParser } from '../contracts/knowledge.contracts';
import type {
  LoadedKnowledgeSource,
  ParsedKnowledge,
} from '../models/knowledge.models';

/**
 * Parser — extract text/metadata/structure only.
 * Never summarizes, classifies, or runs AI inference.
 */
@Injectable()
export class KnowledgeParser implements IKnowledgeParser {
  parse(loaded: LoadedKnowledgeSource): ParsedKnowledge {
    if (!loaded?.rawContent) {
      throw new Error('LoadedKnowledgeSource.rawContent is required');
    }

    const text = this.extractText(loaded);
    const title =
      (typeof loaded.metadata.titleHint === 'string' && loaded.metadata.titleHint) ||
      this.extractTitle(text, loaded);
    const sections = this.extractSections(text, loaded.sourceType);
    const tables = this.extractTables(text, loaded.sourceType);
    const references = this.extractReferences(text);

    return Object.freeze({
      text,
      title,
      sections: Object.freeze(sections),
      tables: Object.freeze(tables),
      references: Object.freeze(references),
      metadata: Object.freeze({
        ...loaded.metadata,
        sourceType: loaded.sourceType,
        sourceUri: loaded.sourceUri ?? null,
        mimeType: loaded.mimeType ?? null,
        charCount: text.length,
      }),
    });
  }

  private extractText(loaded: LoadedKnowledgeSource): string {
    const raw = loaded.rawContent;
    switch (loaded.sourceType) {
      case 'html':
        return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      case 'markdown':
        return raw.replace(/^#{1,6}\s+/gm, '').replace(/[*_`]/g, '').trim();
      case 'json':
        try {
          return JSON.stringify(JSON.parse(raw), null, 0);
        } catch {
          return raw;
        }
      case 'xml':
        return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      case 'csv':
        return raw.replace(/,/g, ' ').trim();
      default:
        return raw.trim();
    }
  }

  private extractTitle(text: string, loaded: LoadedKnowledgeSource): string {
    if (loaded.sourceUri) {
      const parts = loaded.sourceUri.split(/[/\\]/);
      const last = parts[parts.length - 1];
      if (last) return last.slice(0, 120);
    }
    const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0);
    return (firstLine ?? 'untitled').trim().slice(0, 120);
  }

  private extractSections(text: string, sourceType: string): string[] {
    if (sourceType === 'markdown' || sourceType === 'txt') {
      return text
        .split(/\n(?=#{1,3}\s|\n)/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 50);
    }
    return text
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 50);
  }

  private extractTables(text: string, sourceType: string): string[] {
    if (sourceType === 'csv') {
      return text
        .split(/\r?\n/)
        .filter((l) => l.includes(',') || l.includes('\t'))
        .slice(0, 20);
    }
    if (sourceType === 'markdown') {
      return text
        .split(/\r?\n/)
        .filter((l) => l.includes('|'))
        .slice(0, 20);
    }
    return [];
  }

  private extractReferences(text: string): string[] {
    const urls = text.match(/https?:\/\/[^\s)]+/gi) ?? [];
    const refs = text.match(/\[[^\]]+\]\([^)]+\)/g) ?? [];
    return [...new Set([...urls, ...refs])].slice(0, 50);
  }
}
