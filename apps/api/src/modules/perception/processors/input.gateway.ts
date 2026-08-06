import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IInputGateway } from '../contracts/perception.contracts';
import type { PerceiveInputDto } from '../dto/perceive-input.dto';
import type {
  NormalizedPerceptionInput,
  PerceptionInputType,
} from '../models/world-understanding.models';

const SUPPORTED_TYPES: readonly PerceptionInputType[] = [
  'text',
  'image',
  'audio',
  'video',
  'pdf',
  'website',
  'json',
  'api_request',
  'event',
] as const;

/**
 * Input Gateway — accept every supported input type and normalize.
 * Never performs reasoning.
 */
@Injectable()
export class InputGateway implements IInputGateway {
  accept(input: PerceiveInputDto): NormalizedPerceptionInput {
    if (input == null || typeof input !== 'object') {
      throw new Error('Perception input is required');
    }

    const inputType = this.resolveType(input);
    const content = this.resolveContent(input, inputType);
    const requestId =
      typeof input.requestId === 'string' && input.requestId.trim().length > 0
        ? input.requestId.trim()
        : randomUUID();

    const rawMetadata: Record<string, string | number | boolean | null> = {
      ...(input.metadata ?? {}),
    };
    if (input.data !== undefined && inputType !== 'text') {
      rawMetadata.hasStructuredData = true;
    }

    return Object.freeze({
      requestId,
      userId: input.userId,
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      inputType,
      content,
      contentBinaryRef: input.contentBinaryRef,
      uri: input.uri,
      mimeType: input.mimeType,
      languageHint: input.languageHint,
      actor: input.actor,
      environment: input.environment,
      receivedAt: new Date().toISOString(),
      rawMetadata: Object.freeze(rawMetadata),
    });
  }

  private resolveType(input: PerceiveInputDto): PerceptionInputType {
    if (input.type) {
      if (!SUPPORTED_TYPES.includes(input.type)) {
        throw new Error(`Unsupported perception input type: ${input.type}`);
      }
      return input.type;
    }
    if (input.uri && /^https?:\/\//i.test(input.uri)) return 'website';
    if (input.contentBinaryRef) {
      const mime = (input.mimeType ?? '').toLowerCase();
      if (mime.startsWith('image/')) return 'image';
      if (mime.startsWith('audio/')) return 'audio';
      if (mime.startsWith('video/')) return 'video';
      if (mime.includes('pdf')) return 'pdf';
      return 'image';
    }
    if (input.data !== undefined) {
      if (input.metadata?.source === 'event') return 'event';
      if (input.metadata?.source === 'api') return 'api_request';
      return 'json';
    }
    return 'text';
  }

  private resolveContent(input: PerceiveInputDto, type: PerceptionInputType): string {
    if (typeof input.content === 'string' && input.content.length > 0) {
      return input.content;
    }
    if (input.data !== undefined) {
      try {
        return JSON.stringify(input.data);
      } catch {
        throw new Error('Perception structured data is not serializable');
      }
    }
    if (typeof input.uri === 'string' && input.uri.length > 0) {
      return input.uri;
    }
    if (typeof input.contentBinaryRef === 'string' && input.contentBinaryRef.length > 0) {
      return input.contentBinaryRef;
    }
    if (type === 'text') {
      throw new Error('Text perception input requires content');
    }
    return '';
  }
}
