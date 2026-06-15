const STORAGE_KEY = 'myguru-completed-modules';

export function getCompletedModules(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markModuleComplete(moduleId: string): void {
  const completed = getCompletedModules();
  if (!completed.includes(moduleId)) {
    completed.push(moduleId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }
}

export function isModuleComplete(moduleId: string): boolean {
  return getCompletedModules().includes(moduleId);
}
