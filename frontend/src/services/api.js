import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';
const USE_MOCK_DATA = !process.env.REACT_APP_API_URL; // 백엔드 없을 때 mock 데이터 사용

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data
const mockData = {
  stats: {
    totalPages: 245680,
    colorPages: 88450,
    bwPages: 157230,
    totalCost: 1245800,
  },
  departmentStats: [
    { department: '영업팀', totalPages: 45680, colorPages: 15230, bwPages: 30450, cost: 234500 },
    { department: '개발팀', totalPages: 62340, colorPages: 28450, bwPages: 33890, cost: 345600 },
    { department: '마케팅팀', totalPages: 38920, colorPages: 18760, bwPages: 20160, cost: 198700 },
    { department: '인사팀', totalPages: 28450, colorPages: 9870, bwPages: 18580, cost: 145600 },
    { department: '총무팀', totalPages: 35290, colorPages: 11140, bwPages: 24150, cost: 178400 },
  ],
  monthlyTrend: [
    { month: '7월', pages: 38450 },
    { month: '8월', pages: 42300 },
    { month: '9월', pages: 39800 },
    { month: '10월', pages: 45200 },
    { month: '11월', pages: 41500 },
    { month: '12월', pages: 38430 },
  ],
  printers: [
    { 
      id: 1, name: 'Canon-MFP-001', location: '본사 3층', 
      status: 'online', tonerCyan: 75, tonerMagenta: 68, tonerYellow: 82, tonerBlack: 45,
      paperLevel: 85, totalPages: 125340, model: 'imageRUNNER ADVANCE DX C5760i'
    },
    { 
      id: 2, name: 'Canon-MFP-002', location: '본사 5층', 
      status: 'warning', tonerCyan: 92, tonerMagenta: 88, tonerYellow: 15, tonerBlack: 78,
      paperLevel: 62, totalPages: 98450, model: 'imageRUNNER ADVANCE DX C3730i'
    },
    { 
      id: 3, name: 'Canon-MFP-003', location: '연구동 2층', 
      status: 'online', tonerCyan: 45, tonerMagenta: 52, tonerYellow: 48, tonerBlack: 38,
      paperLevel: 95, totalPages: 78920, model: 'imageRUNNER ADVANCE DX C5760i'
    },
    { 
      id: 4, name: 'Canon-MFP-004', location: '영업동 1층', 
      status: 'error', tonerCyan: 0, tonerMagenta: 12, tonerYellow: 8, tonerBlack: 5,
      paperLevel: 15, totalPages: 156780, model: 'imageRUNNER ADVANCE DX C3730i'
    },
    { 
      id: 5, name: 'Canon-MFP-005', location: '본사 7층', 
      status: 'online', tonerCyan: 88, tonerMagenta: 92, tonerYellow: 85, tonerBlack: 90,
      paperLevel: 78, totalPages: 45290, model: 'imageRUNNER ADVANCE DX C5760i'
    },
  ],
};

// Print Jobs API
export const printJobsAPI = {
  getStats: (startDate, endDate) => 
    USE_MOCK_DATA 
      ? Promise.resolve({ data: mockData.stats })
      : apiClient.get('/print-jobs/stats', { params: { startDate, endDate } }),
  
  getByDepartment: (startDate, endDate) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.departmentStats })
      : apiClient.get('/print-jobs/by-department', { params: { startDate, endDate } }),
  
  getByUser: (departmentId, startDate, endDate) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: [] })
      : apiClient.get('/print-jobs/by-user', { params: { departmentId, startDate, endDate } }),
  
  getByPrinter: (startDate, endDate) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.monthlyTrend })
      : apiClient.get('/print-jobs/by-printer', { params: { startDate, endDate } }),
  
  getCostAnalysis: (departmentId, startDate, endDate) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: { savings: 125000, recommendations: [] } })
      : apiClient.get('/print-jobs/cost-analysis', { params: { departmentId, startDate, endDate } }),
  
  getPrintJobs: (params) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: [] })
      : apiClient.get('/print-jobs', { params }),
};

// Printers API
export const printersAPI = {
  getAll: (activeOnly = true) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.printers })
      : apiClient.get('/printers', { params: { activeOnly } }),
  
  getById: (id) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.printers.find(p => p.id === id) })
      : apiClient.get(`/printers/${id}`),
  
  getStatus: (id) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.printers.find(p => p.id === id) })
      : apiClient.get(`/printers/${id}/status`),
  
  getStatusHistory: (id, startDate, endDate) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: [] })
      : apiClient.get(`/printers/${id}/status-history`, { params: { startDate, endDate } }),
  
  getLowToner: (threshold = 15) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.printers.filter(p => 
          p.tonerCyan <= threshold || p.tonerMagenta <= threshold || 
          p.tonerYellow <= threshold || p.tonerBlack <= threshold
        ) })
      : apiClient.get('/printers/alerts/low-toner', { params: { threshold } }),
  
  getLowPaper: (threshold = 20) =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.printers.filter(p => p.paperLevel <= threshold) })
      : apiClient.get('/printers/alerts/low-paper', { params: { threshold } }),
  
  getErrors: () =>
    USE_MOCK_DATA
      ? Promise.resolve({ data: mockData.printers.filter(p => p.status === 'error') })
      : apiClient.get('/printers/alerts/errors'),
};

export default apiClient;
