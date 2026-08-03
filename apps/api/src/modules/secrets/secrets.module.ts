import { Global, Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EnvSecretProvider } from './env-secret.provider';
import { MemorySecretProvider } from './memory-secret.provider';
import { SecretsService } from './secrets.service';

/**
 * Global SecretsModule (Phase 2.1.2).
 * Provider abstraction + SecretsService for secure retrieval and rotation.
 */
@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [EnvSecretProvider, MemorySecretProvider, SecretsService],
  exports: [SecretsService, EnvSecretProvider, MemorySecretProvider],
})
export class SecretsModule {}
