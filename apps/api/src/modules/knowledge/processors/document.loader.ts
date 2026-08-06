import { Injectable } from '@nestjs/common';
import type { IDocumentLoader } from '../contracts/knowledge.contracts';
import type { IngestKnowledgeDto } from '../dto/knowledge.dto';
import type {
  KnowledgeSourceType,
  LoadedKnowledgeSource,
} from '../models/knowledge.models';

/**
 * Document Loader — import raw knowledge payloads only.
 * Never understands content.
 */
@Injectable()
export class DocumentLoader implements IDocumentLoader {
  load(source: IngestKnowledgeDto): LoadedKnowledgeSource {
    if (!source || typeof source !== 'object') {
      throw new Error('IngestKnowledgeDto is required');
    }

    const sourceType = this.resolveSourceType(source);
    const rawContent = this.resolveContent(source, sourceType);

    return Object.freeze({
      sourceType,
      sourceUri: source.sourceUri,
      rawContent,
      mimeType: source.mimeType,
      metadata: Object.freeze({
        ...(source.metadata ?? {}),
        titleHint: source.title ?? null,
        tagsCount: source.tags?.length ?? 0,
      }),
    });
  }

  private resolveSourceType(source: IngestKnowledgeDto): KnowledgeSourceType {
    if (source.sourceType) return source.sourceType;
    const uri = (source.sourceUri ?? '').toLowerCase();
    const mime = (source.mimeType ?? '').toLowerCase();
    if (mime.includes('pdf') || uri.endsWith('.pdf')) return 'pdf';
    if (mime.includes('word') || uri.endsWith('.docx')) return 'docx';
    if (mime.includes('markdown') || uri.endsWith('.md')) return 'markdown';
    if (mime.includes('html') || uri.endsWith('.html') || uri.endsWith('.htm')) return 'html';
    if (mime.includes('csv') || uri.endsWith('.csv')) return 'csv';
    if (mime.includes('json') || uri.endsWith('.json')) return 'json';
    if (mime.includes('xml') || uri.endsWith('.xml')) return 'xml';
    if (uri.startsWith('postgres://') || uri.startsWith('mysql://')) return 'database';
    if (uri.startsWith('http://') || uri.startsWith('https://')) return 'rest_api';
    if (uri.startsWith('s3://') || uri.startsWith('gs://')) return 'cloud_storage';
    if (uri.includes('git@') || uri.endsWith('.git')) return 'git_repository';
    if (uri.includes('sharepoint') || uri.includes('confluence')) {
      return 'enterprise_repository';
    }
    if (source.content != null) return 'inline';
    return 'txt';
  }

  private resolveContent(
    source: IngestKnowledgeDto,
    sourceType: KnowledgeSourceType,
  ): string {
    if (typeof source.content === 'string' && source.content.length > 0) {
      return source.content;
    }
    if (typeof source.sourceUri === 'string' && source.sourceUri.length > 0) {
      // Loader imports descriptor only — no remote fetch (provider-independent).
      return `source:${sourceType}:${source.sourceUri}`;
    }
    throw new Error('Knowledge ingest requires content or sourceUri');
  }
}
