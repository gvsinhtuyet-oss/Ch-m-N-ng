import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firestoreStore } from './auth-server.mjs';

function storeWith(status, message) {
  return firestoreStore('test-project', 'test-db', async url =>
    url.startsWith('http://metadata.')
      ? Response.json({ access_token: 'test-token', expires_in: 3600 })
      : Response.json({ error: { message } }, { status }));
}

test('a missing document is empty, but a missing database is unavailable', async () => {
  assert.equal(await storeWith(404, 'Document not found').get('cham_users', 'owner'), null);
  await assert.rejects(storeWith(404, 'The database test-db does not exist').get('cham_users', 'owner'), { status: 503 });
});

test('failed account creation and collection reads cannot silently succeed', async () => {
  const store = storeWith(404, 'Not found');
  await assert.rejects(store.put('cham_users', 'owner', { role: 'admin' }, true), { status: 503 });
  await assert.rejects(store.list('cham_users'), { status: 503 });
});

test('permission failures remain unavailable and conflicts remain conflicts', async () => {
  await assert.rejects(storeWith(403, 'Permission denied').get('cham_users', 'owner'), { status: 503 });
  await assert.rejects(storeWith(409, 'Already exists').put('cham_users', 'owner', {}, true), { status: 409 });
});
