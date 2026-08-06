import { Injectable } from '@nestjs/common';
import type { ResourceReservation } from '../resource.types';
import type { IResourceStore } from './kernel-store.contracts';

@Injectable()
export class MemoryResourceStore implements IResourceStore {
  private readonly reservations = new Map<string, ResourceReservation>();

  save(reservation: ResourceReservation): void {
    this.reservations.set(reservation.id, reservation);
  }

  get(id: string): ResourceReservation | undefined {
    return this.reservations.get(id);
  }

  delete(id: string): boolean {
    return this.reservations.delete(id);
  }

  values(): IterableIterator<ResourceReservation> {
    return this.reservations.values();
  }

  list(ownerId?: string): ResourceReservation[] {
    const all = [...this.reservations.values()];
    return ownerId ? all.filter((r) => r.ownerId === ownerId) : all;
  }

  size(): number {
    return this.reservations.size;
  }

  clear(): void {
    this.reservations.clear();
  }
}
