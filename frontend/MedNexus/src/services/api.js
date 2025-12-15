const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('Token exists:', token.substring(0, 20) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'none' },
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        detail: data.detail,
      });
      throw new Error(data.detail || 'An error occurred');
    }

    return data;
  }

  // Patient Auth
  async patientSignUp(userData) {
    return this.request('/api/patients/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async patientSignIn(credentials) {
    return this.request('/api/patients/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Patient Profile
  async getPatientProfile() {
    return this.request('/api/patients/me');
  }

  async completeProfile(profileData) {
    return this.request('/api/patients/complete-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(profileData) {
    return this.request('/api/patients/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Profile Picture
  async uploadProfilePicture(file) {
    const url = `${this.baseUrl}/api/patients/profile-picture`;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to upload profile picture');
    }

    return data;
  }

  async deleteProfilePicture() {
    return this.request('/api/patients/profile-picture', {
      method: 'DELETE',
    });
  }

  // Dashboard
  async getPatientDashboard() {
    return this.request('/api/patients/dashboard');
  }

  // Helper to get full URL for profile pictures
  getProfilePictureUrl(path) {
    if (!path) return null;
    return `${this.baseUrl}${path}`;
  }
}

export const apiService = new ApiService();
export default apiService;
