/**
 * API Endpoints
 * 
 * Centralized definitions of all API endpoint paths
 */

// Base paths
export const API_BASE = '/api';
export const API_ADMIN = `${API_BASE}/admin`;
export const API_WEBSITE = `${API_ADMIN}/website-landing`;
export const API_SPMB = `${API_BASE}/penerimaan-siswa`;

// Website Landing Endpoints
export const API_ARTICLES = `${API_WEBSITE}/articles`;
export const API_NEWS = `${API_WEBSITE}/news`;
export const API_EVENTS = `${API_WEBSITE}/events`;
export const API_FACULTY = `${API_WEBSITE}/faculty`;
export const API_PAGES = `${API_WEBSITE}/pages`;
export const API_MEDIA = `${API_WEBSITE}/media`;
export const API_GALLERY = `${API_WEBSITE}/gallery`;
export const API_LANDING_SECTIONS = `${API_WEBSITE}/landing-sections`;
export const API_THEME = `${API_WEBSITE}/theme`;
export const API_THEME_ACTIVE = `${API_THEME}/active`;
export const API_THEME_RESET = `${API_THEME}/reset`;

// SPMB Endpoints
export const API_SPMB_REGISTER = `${API_SPMB}/spmb/register`;
export const API_SPMB_STATUS = `${API_SPMB}/spmb/status`;

// Admin User Endpoints
export const API_USERS = `${API_ADMIN}/users`;

// Auth Endpoints
export const API_AUTH = `${API_BASE}/auth`;

/**
 * Helper function to get item detail endpoint
 */
export const getDetailEndpoint = (baseEndpoint: string, id: string) => `${baseEndpoint}/${id}`;

/**
 * Helper function to build query string
 */
export const buildQueryString = (params: Record<string, string | number | boolean> = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};
