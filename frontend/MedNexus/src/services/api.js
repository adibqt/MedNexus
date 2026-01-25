const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAuthHeaders(isDoctor = false) {
    const token = isDoctor 
      ? localStorage.getItem('doctor_access_token')
      : localStorage.getItem('access_token');
    if (token) {
      console.log('Token exists:', token.substring(0, 20) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    // Check if this is a doctor endpoint
    const isDoctor = endpoint.includes('/doctor') || options.isDoctor === true;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...this.getAuthHeaders(isDoctor),
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

  // Shared: public symptoms (for patient dashboard)
  async getAllSymptoms() {
    // reuse admin endpoint which currently has no auth
    return this.adminRequest('/api/admin/symptoms');
  }

  // Doctors visible to patients
  async getPublicDoctors() {
    return this.request('/api/doctors');
  }

  // Patient appointments
  async getPatientAppointments() {
    return this.request('/api/patients/appointments');
  }

  // Appointment booking
  async getAvailableSlots(doctorId, date) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return this.request(`/api/appointments/doctors/${doctorId}/available-slots?selected_date=${dateStr}`);
  }

  async bookAppointment(appointmentData) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  // Doctor appointments
  async getDoctorAppointments(statusFilter = null) {
    const token = localStorage.getItem('doctor_access_token') || '';
    const url = statusFilter 
      ? `/api/appointments/doctors/my-appointments?status_filter=${statusFilter}`
      : '/api/appointments/doctors/my-appointments';
    return this.request(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  async confirmAppointment(appointmentId) {
    const token = localStorage.getItem('doctor_access_token') || '';
    return this.request(`/api/appointments/${appointmentId}/confirm`, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  async cancelAppointment(appointmentId) {
    const token = localStorage.getItem('doctor_access_token') || '';
    return this.request(`/api/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  async completeAppointment(appointmentId) {
    const token = localStorage.getItem('doctor_access_token') || '';
    return this.request(`/api/appointments/${appointmentId}/complete`, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  // Helper to get full URL for profile pictures
  getProfilePictureUrl(path) {
    if (!path) return null;
    return `${this.baseUrl}${path}`;
  }

  // Admin APIs (no auth required for now)
  async adminRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'An error occurred');
    }

    return data;
  }

  async getAllPatients(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    return this.adminRequest(`/api/admin/patients${queryString ? `?${queryString}` : ''}`);
  }

  async getPatientById(patientId) {
    return this.adminRequest(`/api/admin/patients/${patientId}`);
  }

  async updatePatientStatus(patientId, isActive) {
    return this.adminRequest(`/api/admin/patients/${patientId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async getAdminStats() {
    return this.adminRequest('/api/admin/stats');
  }

  async getAllDoctors(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return this.adminRequest(`/api/admin/doctors${queryString ? `?${queryString}` : ''}`);
  }

  async updateDoctorApproval(doctorId, approve) {
    return this.adminRequest(`/api/admin/doctors/${doctorId}/approval?approve=${approve}`, {
      method: 'PATCH',
    });
  }

  async updateDoctorStatus(doctorId, isActive) {
    return this.adminRequest(`/api/admin/doctors/${doctorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  // Admin: Specializations
  async getSpecializations() {
    return this.adminRequest('/api/admin/specializations');
  }

  async createSpecialization(payload) {
    return this.adminRequest('/api/admin/specializations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSpecialization(id, payload) {
    return this.adminRequest(`/api/admin/specializations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteSpecialization(id) {
    return this.adminRequest(`/api/admin/specializations/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin: Symptoms
  async getSymptoms() {
    return this.adminRequest('/api/admin/symptoms');
  }

  async createSymptom(payload) {
    return this.adminRequest('/api/admin/symptoms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSymptom(id, payload) {
    return this.adminRequest(`/api/admin/symptoms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteSymptom(id) {
    return this.adminRequest(`/api/admin/symptoms/${id}`, {
      method: 'DELETE',
    });
  }

  async updateDoctorProfile(formData) {
    const token = localStorage.getItem('doctor_access_token') || '';
    return this.request('/api/doctors/me', {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  // Video Call APIs (Following guide structure)
  async joinAppointmentCall(appointmentId, roomType = 'consultation', isDoctor = false) {
    const endpoint = isDoctor 
      ? '/api/livekit/join-appointment/doctor'
      : '/api/livekit/join-appointment';
    
    // Use the standard request method which handles auth headers automatically
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        appointment_id: appointmentId,
        room_type: roomType
      }),
      isDoctor: isDoctor, // Pass flag to request method
    });
  }

  // Legacy methods for backward compatibility
  async getVideoToken(roomName, participantName) {
    return this.request(`/api/video-call/token?room_name=${roomName}&participant_name=${participantName}`);
  }

  async getDoctorVideoToken(roomName, participantName) {
    const token = localStorage.getItem('doctor_access_token') || '';
    return this.request(`/api/video-call/token/doctor?room_name=${roomName}&participant_name=${participantName}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  async initiateCall(appointmentId) {
    return this.request('/api/livekit/initiate', {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId }),
    });
  }

  async initiateCallDoctor(appointmentId) {
    return this.request('/api/livekit/initiate/doctor', {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId }),
      isDoctor: true, // Use doctor token
    });
  }

  // Room status for polling-based notifications
  async checkRoomStatus(appointmentId, isDoctor = false) {
    const endpoint = isDoctor 
      ? `/api/livekit/room-status/${appointmentId}/doctor`
      : `/api/livekit/room-status/${appointmentId}`;
    
    // Use the standard request method which handles auth headers automatically
    return this.request(endpoint, {
      isDoctor: isDoctor, // Pass flag to request method for correct token
    });
  }

  // AI Doctor Chat (Conversational)
  async aiChat(message, conversationHistory = []) {
    return this.request('/api/patients/ai-chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
      }),
    });
  }

  // AI Doctor Consultation (Legacy)
  async aiDoctorConsultation(data) {
    return this.request('/api/patients/ai-consultation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Consultation History
  async getAIConsultationHistory(limit = 20, offset = 0) {
    return this.request(`/api/patients/ai-consultation/history?limit=${limit}&offset=${offset}`);
  }

  async getAIConsultationDetail(consultationId) {
    return this.request(`/api/patients/ai-consultation/history/${consultationId}`);
  }

  async deleteAIConsultation(consultationId) {
    return this.request(`/api/patients/ai-consultation/history/${consultationId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
