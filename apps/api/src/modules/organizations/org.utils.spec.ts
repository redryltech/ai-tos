import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidSlug, slugify } from './org.utils';

describe('org.utils', () => {
  it('slugifies names', () => {
    assert.equal(slugify('Acme Trading Co.'), 'acme-trading-co');
    assert.equal(slugify('  Hello--World  '), 'hello-world');
  });

  it('validates slugs', () => {
    assert.equal(isValidSlug('acme'), true);
    assert.equal(isValidSlug('acme-trading'), true);
    assert.equal(isValidSlug('Acme'), false);
    assert.equal(isValidSlug('-bad'), false);
    assert.equal(isValidSlug('a'), false);
  });
});
