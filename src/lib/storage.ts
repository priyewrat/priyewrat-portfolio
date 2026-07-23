import { PortfolioData, Project, Experience, Education, Certification, Profile, Skill, Message } from '../types';
import { defaultPortfolioData } from '../data';

const PORTFOLIO_STORAGE_KEY = 'priyewrat_portfolio_data';
const MESSAGES_STORAGE_KEY = 'priyewrat_portfolio_messages';
const AUTH_STORAGE_KEY = 'priyewrat_admin_authenticated';

export function getPortfolioData(): PortfolioData {
  if (typeof window === 'undefined') return defaultPortfolioData;
  const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(defaultPortfolioData));
    return defaultPortfolioData;
  }
  try {
    const parsed = JSON.parse(stored) as PortfolioData;
    // Upgrade existing certifications with default URLs if they don't have one
    let updated = false;
    if (parsed.certifications) {
      parsed.certifications = parsed.certifications.map(c => {
        const defaultCert = defaultPortfolioData.certifications.find(dc => dc.id === c.id);
        if (defaultCert && defaultCert.url && !c.url) {
          updated = true;
          return { ...c, url: defaultCert.url };
        }
        return c;
      });
    }
    if (updated) {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse stored portfolio data, using default', e);
    return defaultPortfolioData;
  }
}

export function savePortfolioData(data: PortfolioData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
}

export function getMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}

export function addMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Message {
  const messages = getMessages();
  const newMessage: Message = {
    ...message,
    id: 'msg_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleString(),
    read: false
  };
  messages.unshift(newMessage);
  saveMessages(messages);
  return newMessage;
}

export function deleteMessage(id: string): void {
  const messages = getMessages();
  const updated = messages.filter(m => m.id !== id);
  saveMessages(updated);
}

export function markMessageAsRead(id: string): void {
  const messages = getMessages();
  const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
  saveMessages(updated);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function setAdminAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  if (authenticated) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
