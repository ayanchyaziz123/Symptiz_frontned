// ============================================
// API Configuration
// ============================================

// Use environment variable if available, otherwise fallback to defaults
const getApiBaseUrl = (): string => {
  // Check for environment variable (set during build)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Fallback: detect based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }

  // Production fallback
  return 'http://18.222.222.50:8000';
};

// ============================================
// Exported Configuration
// ============================================
export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Providers
  providers: `${API_BASE_URL}/api/providers`,

  // Appointments
  appointments: `${API_BASE_URL}/api/appointments`,

  // Users/Auth
  users: `${API_BASE_URL}/api/users`,

  // Symptoms
  symptoms: `${API_BASE_URL}/api/symptoms`,
};

// Helper function for profile pictures and media
export const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;
