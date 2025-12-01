import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import PrintJobs from './pages/PrintJobs';
import Printers from './pages/Printers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <ConfigProvider locale={koKR}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/print-jobs" element={<PrintJobs />} />
            <Route path="/printers" element={<Printers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainLayout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
