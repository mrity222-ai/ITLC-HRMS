const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5000/api'
  : (import.meta.env.VITE_API_URL || 'https://gold-stork-993357.hostingersite.com/api');

// Helper to get request headers with token
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('hrms_jwt_token');
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Handle response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      localStorage.removeItem('hrms_jwt_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // ========================================================
  // AUTHENTICATION APIs
  // ========================================================
  async checkSuperOwner() {
    const res = await fetch(`${API_URL}/auth/check-superowner`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async registerSuperOwner(data: any) {
    const res = await fetch(`${API_URL}/auth/register-superowner`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async registerCompany(data: any) {
    const res = await fetch(`${API_URL}/auth/register-company`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async login(credentials: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    const result = await handleResponse(res);
    if (result.token) {
      localStorage.setItem('hrms_jwt_token', result.token);
    }
    return result;
  },

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (e) {
      console.error('Logout request failed', e);
    }
    localStorage.removeItem('hrms_jwt_token');
  },

  async getProfile() {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ========================================================
  // SUPER OWNER PLAN & TENANT APIs
  // ========================================================
  async getCompanies() {
    const res = await fetch(`${API_URL}/superowner/companies`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createCompany(data: any) {
    const res = await fetch(`${API_URL}/superowner/companies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCompany(id: string, data: any) {
    const res = await fetch(`${API_URL}/superowner/companies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteCompany(id: string) {
    const res = await fetch(`${API_URL}/superowner/companies/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getSuperOwnerTickets() {
    const res = await fetch(`${API_URL}/superowner/tickets`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateSuperOwnerTicket(id: string, data: any) {
    const res = await fetch(`${API_URL}/superowner/tickets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ========================================================
  // COMPANY ADMIN / HR MANAGERS APIs
  // ========================================================
  async getAdminCompany() {
    const res = await fetch(`${API_URL}/admin/company`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateAdminCompany(data: any) {
    const res = await fetch(`${API_URL}/admin/company`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getEmployees() {
    const res = await fetch(`${API_URL}/admin/employees`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createEmployee(data: any) {
    const res = await fetch(`${API_URL}/admin/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateEmployee(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteEmployee(id: string) {
    const res = await fetch(`${API_URL}/admin/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAdminLeaves() {
    const res = await fetch(`${API_URL}/admin/leaves`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateAdminLeave(id: string, status: string) {
    const res = await fetch(`${API_URL}/admin/leaves/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getManagerLeaves() {
    const res = await fetch(`${API_URL}/manager/leaves`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateManagerLeaveRecommendation(id: string, status: string, comment: string) {
    const res = await fetch(`${API_URL}/manager/leaves/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, comment })
    });
    return handleResponse(res);
  },

  async getManagerTeam() {
    const res = await fetch(`${API_URL}/manager/team`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getManagerTeamAttendance() {
    const res = await fetch(`${API_URL}/manager/team-attendance`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getManagerCorrections() {
    const res = await fetch(`${API_URL}/manager/corrections`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateManagerCorrection(id: string, status: string, managerComment: string) {
    const res = await fetch(`${API_URL}/manager/corrections/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, managerComment })
    });
    return handleResponse(res);
  },

  async getManagerTasks() {
    const res = await fetch(`${API_URL}/manager/tasks`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createManagerTask(taskData: any) {
    const res = await fetch(`${API_URL}/manager/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  async updateManagerTask(id: string, taskData: any) {
    const res = await fetch(`${API_URL}/manager/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  async deleteManagerTask(id: string) {
    const res = await fetch(`${API_URL}/manager/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getManagerPerformance() {
    const res = await fetch(`${API_URL}/manager/performance`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async saveManagerPerformance(perfData: any) {
    const res = await fetch(`${API_URL}/manager/performance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(perfData)
    });
    return handleResponse(res);
  },

  async getManagerExpenses() {
    const res = await fetch(`${API_URL}/manager/expenses`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateManagerExpense(id: string, status: string) {
    const res = await fetch(`${API_URL}/manager/expenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getManagerAssets() {
    const res = await fetch(`${API_URL}/manager/assets`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createManagerAsset(assetData: any) {
    const res = await fetch(`${API_URL}/manager/assets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(assetData)
    });
    return handleResponse(res);
  },

  async updateManagerAsset(id: string, assetData: any) {
    const res = await fetch(`${API_URL}/manager/assets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(assetData)
    });
    return handleResponse(res);
  },

  async getManagerMeetings() {
    const res = await fetch(`${API_URL}/manager/meetings`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createManagerMeeting(meetingData: any) {
    const res = await fetch(`${API_URL}/manager/meetings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(meetingData)
    });
    return handleResponse(res);
  },

  async getManagerAnnouncements() {
    const res = await fetch(`${API_URL}/manager/announcements`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createManagerAnnouncement(annData: any) {
    const res = await fetch(`${API_URL}/manager/announcements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(annData)
    });
    return handleResponse(res);
  },

  async getAdminExpenses() {
    const res = await fetch(`${API_URL}/admin/expenses`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateAdminExpense(id: string, status: string) {
    const res = await fetch(`${API_URL}/admin/expenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getAdminTickets() {
    const res = await fetch(`${API_URL}/admin/tickets`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateAdminTicket(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/tickets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ========================================================
  // EMPLOYEE INDIVIDUAL PROFILE APIs
  // ========================================================
  async getEmployeeLeaves() {
    const res = await fetch(`${API_URL}/employee/leaves`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createLeaveRequest(data: any) {
    const res = await fetch(`${API_URL}/employee/leaves`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getEmployeeExpenses() {
    const res = await fetch(`${API_URL}/employee/expenses`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createExpenseClaim(data: any) {
    const res = await fetch(`${API_URL}/employee/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getEmployeeTickets() {
    const res = await fetch(`${API_URL}/employee/tickets`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createSupportTicket(data: any) {
    const res = await fetch(`${API_URL}/employee/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async changePassword(data: any) {
    const res = await fetch(`${API_URL}/employee/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async upgradeSubscription(planId: string) {
    const res = await fetch(`${API_URL}/admin/subscription`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ planId })
    });
    return handleResponse(res);
  },

  async getSuperOwnerUsers() {
    const res = await fetch(`${API_URL}/superowner/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async deleteSuperOwnerUser(id: string) {
    const res = await fetch(`${API_URL}/superowner/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateSuperOwnerUser(id: string, data: any) {
    const res = await fetch(`${API_URL}/superowner/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async createSuperOwnerUser(data: any) {
    const res = await fetch(`${API_URL}/superowner/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getEmployeeAttendance() {
    const res = await fetch(`${API_URL}/employee/attendance`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async punchIn(data: { date: string; checkIn: string; status?: string }) {
    const res = await fetch(`${API_URL}/employee/attendance/punch-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async punchOut(data: { date: string; checkOut: string; breakDuration: string; workHours: string; status: string }) {
    const res = await fetch(`${API_URL}/employee/attendance/punch-out`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAdminAttendance(employeeId?: string) {
    const url = employeeId 
      ? `${API_URL}/admin/attendance/${employeeId}` 
      : `${API_URL}/admin/attendance`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getSuperOwnerCompanyEmployees(companyId: string) {
    const res = await fetch(`${API_URL}/superowner/companies/${companyId}/employees`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getSuperOwnerEmployeeAttendance(employeeId: string) {
    const res = await fetch(`${API_URL}/superowner/employees/${employeeId}/attendance`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getEmployeeTasks() {
    const res = await fetch(`${API_URL}/employee/tasks`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateEmployeeTaskStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/employee/tasks/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  }
};
