import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateUsername } from './username';

describe('Username Validation & SARA/Racism Moderation', () => {
  it('accepts valid creative campus usernames', () => {
    assert.deepEqual(validateUsername('pasha_hutagaol'), {
      valid: true,
      normalizedUsername: 'pasha_hutagaol',
    });
    assert.deepEqual(validateUsername('anak.fikom23'), {
      valid: true,
      normalizedUsername: 'anak.fikom23',
    });
    assert.deepEqual(validateUsername('preloved_unpad8'), {
      valid: true,
      normalizedUsername: 'preloved_unpad8',
    });
  });

  it('rejects usernames with invalid length or bad characters', () => {
    assert.equal(validateUsername('ab').valid, false);
    assert.equal(validateUsername('this_username_is_way_too_long_for_ocho').valid, false);
    assert.equal(validateUsername('_starts_with_underscore').valid, false);
    assert.equal(validateUsername('ends_with_dot.').valid, false);
    assert.equal(validateUsername('has..dots').valid, false);
    assert.equal(validateUsername('123456').valid, false); // no letters
    assert.equal(validateUsername('user@unpad').valid, false);
  });

  it('strictly blocks SARA, racism, hate speech, and profanity', () => {
    assert.equal(validateUsername('anak_rasis').valid, false);
    assert.equal(validateUsername('sara_unpad').valid, false);
    assert.equal(validateUsername('anti_chindo').valid, false);
    assert.equal(validateUsername('kafir_2026').valid, false);
    assert.equal(validateUsername('babi_ngepet').valid, false);
    assert.equal(validateUsername('anjing_gila').valid, false);
    assert.equal(validateUsername('kontol_badak').valid, false);
    assert.equal(validateUsername('ngentot_yuk').valid, false);
  });

  it('strictly blocks impersonation of admin and platform staff', () => {
    assert.equal(validateUsername('admin_ocho').valid, false);
    assert.equal(validateUsername('ocho_official').valid, false);
    assert.equal(validateUsername('moderator_unpad').valid, false);
    assert.equal(validateUsername('unpad_official').valid, false);
  });
});
