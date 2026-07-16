const isMobileApp = typeof window !== 'undefined' && (
  (window as any).Capacitor || 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
);

const API_URL = isMobileApp
  ? 'https://gold-stork-993357.hostingersite.com/api'
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
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

  async updateProfile(data: any) {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ========================================================
  // ===== PAYROLL =====
  async getAdminPayroll() {
    const res = await fetch(`${API_URL}/admin/payroll?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getEmployeePayroll() {
    const res = await fetch(`${API_URL}/employee/payroll?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createAdminPayroll(data: any) {
    const res = await fetch(`${API_URL}/admin/payroll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateAdminPayroll(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/payroll/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAdminAssets() {
    const res = await fetch(`${API_URL}/admin/assets?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createAdminAsset(data: any) {
    const res = await fetch(`${API_URL}/admin/assets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateAdminAsset(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/assets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ===== PERFORMANCE =====
  async getAdminPerformance() {
    const res = await fetch(`${API_URL}/admin/performance?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  async createAdminPerformance(data: any) {
    const res = await fetch(`${API_URL}/admin/performance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateAdminPerformance(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/performance/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ===== JOBS =====
  async getAdminJobs() {
    const res = await fetch(`${API_URL}/admin/jobs?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  async createAdminJob(data: any) {
    const res = await fetch(`${API_URL}/admin/jobs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateAdminJob(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/jobs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ===== TRAININGS =====
  async getAdminTrainings() {
    const res = await fetch(`${API_URL}/admin/trainings?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  async createAdminTraining(data: any) {
    const res = await fetch(`${API_URL}/admin/trainings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateAdminTraining(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/trainings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ===== HOLIDAYS =====
  async getAdminHolidays() {
    const res = await fetch(`${API_URL}/admin/holidays?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  async createAdminHoliday(data: any) {
    const res = await fetch(`${API_URL}/admin/holidays`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteAdminHoliday(id: string) {
    const res = await fetch(`${API_URL}/admin/holidays/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ===== LEAVE POLICIES =====
  async getAdminLeavePolicies() {
    const res = await fetch(`${API_URL}/admin/leave-policies?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  async createAdminLeavePolicy(data: any) {
    const res = await fetch(`${API_URL}/admin/leave-policies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteAdminLeavePolicy(id: string) {
    const res = await fetch(`${API_URL}/admin/leave-policies/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ===== DEPARTMENTS =====
  async getAdminDepartments() {
    const res = await fetch(`${API_URL}/admin/departments?t=${new Date().getTime()}`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },
  async createAdminDepartment(data: any) {
    const res = await fetch(`${API_URL}/admin/departments`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(res);
  },
  async updateAdminDepartment(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/departments/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(res);
  },
  async deleteAdminDepartment(id: string) {
    const res = await fetch(`${API_URL}/admin/departments/${id}`, { method: 'DELETE', headers: getHeaders() });
    return handleResponse(res);
  },

  // ===== DESIGNATIONS =====
  async getAdminDesignations() {
    const res = await fetch(`${API_URL}/admin/designations?t=${new Date().getTime()}`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },
  async createAdminDesignation(data: any) {
    const res = await fetch(`${API_URL}/admin/designations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(res);
  },
  async updateAdminDesignation(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/designations/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(res);
  },
  async deleteAdminDesignation(id: string) {
    const res = await fetch(`${API_URL}/admin/designations/${id}`, { method: 'DELETE', headers: getHeaders() });
    return handleResponse(res);
  },

  // ===== BRANCHES =====
  async getAdminBranches() {
    const res = await fetch(`${API_URL}/admin/branches?t=${new Date().getTime()}`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },
  async createAdminBranch(data: any) {
    const res = await fetch(`${API_URL}/admin/branches`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(res);
  },
  async updateAdminBranch(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/branches/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(res);
  },
  async deleteAdminBranch(id: string) {
    const res = await fetch(`${API_URL}/admin/branches/${id}`, { method: 'DELETE', headers: getHeaders() });
    return handleResponse(res);
  },

  // ===== SUPEROWNER ENDPOINTS =====& TENANT APIs
  // ========================================================
  async getCompanies() {
    const res = await fetch(`${API_URL}/superowner/companies?t=${new Date().getTime()}`, {
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

  async getPlans() {
    const res = await fetch(`${API_URL}/superowner/plans?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createPlan(data: any) {
    const res = await fetch(`${API_URL}/superowner/plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updatePlan(id: string, data: any) {
    const res = await fetch(`${API_URL}/superowner/plans/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deletePlan(id: string) {
    const res = await fetch(`${API_URL}/superowner/plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getCoupons() {
    const res = await fetch(`${API_URL}/superowner/coupons?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createCoupon(data: any) {
    const res = await fetch(`${API_URL}/superowner/coupons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCoupon(id: string, data: any) {
    const res = await fetch(`${API_URL}/superowner/coupons/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteCoupon(id: string) {
    const res = await fetch(`${API_URL}/superowner/coupons/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getIntegrations() {
    const res = await fetch(`${API_URL}/superowner/integrations?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateIntegration(id: string, data: any) {
    const res = await fetch(`${API_URL}/superowner/integrations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getWebhooks() {
    const res = await fetch(`${API_URL}/superowner/webhooks?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createWebhook(data: any) {
    const res = await fetch(`${API_URL}/superowner/webhooks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteWebhook(id: string) {
    const res = await fetch(`${API_URL}/superowner/webhooks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getApiToken() {
    const res = await fetch(`${API_URL}/superowner/api-token?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async rotateApiToken() {
    const res = await fetch(`${API_URL}/superowner/api-token/rotate`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getNotifications() {
    const res = await fetch(`${API_URL}/superowner/notifications?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async sendNotification(data: any) {
    const res = await fetch(`${API_URL}/superowner/notifications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getGlobalSettings() {
    const res = await fetch(`${API_URL}/superowner/settings?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateGlobalSettings(data: any) {
    const res = await fetch(`${API_URL}/superowner/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getSecuritySettings() {
    const res = await fetch(`${API_URL}/superowner/security?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateSecuritySettings(data: any) {
    const res = await fetch(`${API_URL}/superowner/security`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getSessions() {
    const res = await fetch(`${API_URL}/superowner/sessions?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async deleteSession(id: string) {
    const res = await fetch(`${API_URL}/superowner/sessions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getLogs() {
    const res = await fetch(`${API_URL}/superowner/logs?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createLog(data: any) {
    const res = await fetch(`${API_URL}/superowner/logs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async clearLogs() {
    const res = await fetch(`${API_URL}/superowner/logs`, {
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

  async getSuperOwnerAnalytics() {
    const res = await fetch(`${API_URL}/superowner/analytics`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getSuperOwnerPayments() {
    const res = await fetch(`${API_URL}/superowner/payments`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateSuperOwnerPaymentStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/superowner/payments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
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

  async createSuperOwner(data: any) {
    const res = await fetch(`${API_URL}/superowner/create-superowner`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ========================================================
  // COMPANY ADMIN / HR MANAGERS APIs
  // ========================================================
  async getAdminCompany() {
    const res = await fetch(`${API_URL}/admin/company?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAdminPlans() {
    const res = await fetch(`${API_URL}/admin/plans?t=${new Date().getTime()}`, {
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

  async createStripeSession(data: any) {
    const res = await fetch(`${API_URL}/payment/create-stripe-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async createRazorpayOrder(data: any) {
    const res = await fetch(`${API_URL}/payment/create-razorpay-order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async verifyPayment(data: any) {
    const res = await fetch(`${API_URL}/payment/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async createPaypalPayment(data: any) {
    const res = await fetch(`${API_URL}/payment/create-paypal-payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async processDirectCard(data: any) {
    const res = await fetch(`${API_URL}/payment/process-direct-card`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async verifyUpiPayment(data: any) {
    const res = await fetch(`${API_URL}/payment/verify-upi-payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async submitBankTransfer(data: any) {
    const res = await fetch(`${API_URL}/payment/submit-bank-transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getUpiDetails() {
    const res = await fetch(`${API_URL}/payment/upi-details`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getBillingHistory() {
    const res = await fetch(`${API_URL}/payment/history?t=${new Date().getTime()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getSuperOwnerUsers() {
    const res = await fetch(`${API_URL}/superowner/users?t=${new Date().getTime()}`, {
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

  async updateAdminAttendance(id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/attendance/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
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
  },

  async updateEmployeeTask(id: string, data: any) {
    const res = await fetch(`${API_URL}/employee/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getEmployeeCorrections() {
    const res = await fetch(`${API_URL}/employee/corrections`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createEmployeeCorrection(data: any) {
    const res = await fetch(`${API_URL}/employee/corrections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};
