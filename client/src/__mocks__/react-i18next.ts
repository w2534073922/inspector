// Mock for react-i18next that loads actual translations for testing
import en from '../i18n/locales/en.json';

// Resolve a nested key like 'sidebar.title' from the translations object
function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return key;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === 'string') return current;
  return key;
}

// Interpolate {{variable}} placeholders
function interpolate(str: string, options?: Record<string, unknown>): string {
  if (!options) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const val = options[name];
    return val !== undefined ? String(val) : `{{${name}}}`;
  });
}

const t = (key: string, options?: Record<string, unknown>): string => {
  const value = getNestedValue(en as Record<string, unknown>, key);
  return interpolate(value, options);
};

export const useTranslation = () => ({
  t,
  i18n: {
    language: 'en',
    changeLanguage: jest.fn(),
    startsWith: (prefix: string) => 'en'.startsWith(prefix),
  },
});

export const initReactI18next = { type: '3rdParty', init: jest.fn() };

export const Trans = ({ children }: { children: React.ReactNode }) => children;

export const withTranslation = () => (Component: React.ComponentType) => Component;
