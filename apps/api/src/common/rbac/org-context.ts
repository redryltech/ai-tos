/** Resolve organization id from route params or `x-organization-id` header. */
export function resolveOrganizationId(req: {
  params?: Record<string, string>;
  headers?: Record<string, string | string[] | undefined>;
}): string | undefined {
  const fromParams =
    req.params?.orgId ?? req.params?.organizationId ?? req.params?.id;
  if (fromParams) return fromParams;

  const header = req.headers?.['x-organization-id'];
  if (typeof header === 'string' && header.length > 0) return header;
  if (Array.isArray(header) && header[0]) return header[0];
  return undefined;
}
