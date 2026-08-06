/** Capability Service event topic constants (Layer 4.3). */

export const CAPABILITY_EVENTS = {
  started: 'capability.started',
  completed: 'capability.completed',
  failed: 'capability.failed',
  cancelled: 'capability.cancelled',
} as const;

export type CapabilityEventTopic =
  (typeof CAPABILITY_EVENTS)[keyof typeof CAPABILITY_EVENTS];
