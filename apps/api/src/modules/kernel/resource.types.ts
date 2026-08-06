/** AI Kernel resource management contracts (Phase 2.2.4). */

export interface ResourceLimits {
  maxWorkers: number;
  maxModelSlots: number;
  maxMemoryMb: number;
  maxConcurrency: number;
}

export interface ResourceUsage {
  workers: number;
  modelSlots: number;
  memoryMb: number;
  concurrency: number;
}

export interface ResourceAvailability extends ResourceUsage {
  /** Remaining capacity per dimension. */
}

export interface ReserveResourcesInput {
  ownerId: string;
  workers?: number;
  modelSlots?: number;
  memoryMb?: number;
  concurrency?: number;
  /** Prefer a specific model id when allocating model slots. */
  modelId?: string;
  /** Prefer a specific worker id when allocating workers. */
  workerId?: string;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  /** Optional TTL; reservation auto-expires after this many ms. */
  ttlMs?: number;
}

export interface ResourceReservation {
  id: string;
  ownerId: string;
  workers: number;
  modelSlots: number;
  memoryMb: number;
  concurrency: number;
  modelId?: string;
  workerId?: string;
  correlationId?: string;
  organizationId?: string;
  userId?: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface WorkerAllocation {
  reservationId: string;
  workerId: string;
  ownerId: string;
}

export interface ModelAllocation {
  reservationId: string;
  modelId: string;
  slots: number;
  ownerId: string;
}

export interface ResourceManagerStats {
  limits: ResourceLimits;
  usage: ResourceUsage;
  available: ResourceAvailability;
  activeReservations: number;
}
