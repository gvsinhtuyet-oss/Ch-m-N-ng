export const MAIN_FIRESTORE_DATABASE = 'ai-studio-71b45c71-26f3-4479-9372-306c6b35245a';

export function firestoreConfiguration(env = process.env) {
  const project = String(env.AUTH_FIRESTORE_PROJECT || '').trim();
  const explicitDatabase = String(env.AUTH_FIRESTORE_DATABASE || '').trim();
  const database = explicitDatabase || MAIN_FIRESTORE_DATABASE;
  if (env.CHAM_ENV === 'test' && (!project || !explicitDatabase || database === MAIN_FIRESTORE_DATABASE)) {
    throw new Error('Bản thử nghiệm cần AUTH_FIRESTORE_PROJECT và AUTH_FIRESTORE_DATABASE riêng; không được dùng database của ứng dụng chính.');
  }
  return {project, database, candidates: [database]};
}
