import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Space, Typography, Spin, Alert } from 'antd';
import {
  PrinterOutlined,
  FileTextOutlined,
  DollarOutlined,
  SaveOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { printJobsAPI, printersAPI } from '../services/api';
import './Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [printerStats, setPrinterStats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock 데이터 사용
      setStats({
        totalJobs: 1245,
        totalPages: 245680,
        colorPages: 88450,
        bwPages: 157230,
        totalCost: 1245800,
        totalSavings: 278000
      });

      setDepartmentStats([
        { departmentName: '영업팀', totalPages: 45680, totalCost: 234500 },
        { departmentName: '개발팀', totalPages: 62340, totalCost: 345600 },
        { departmentName: '마케팅팀', totalPages: 38920, totalCost: 198700 },
        { departmentName: '인사팀', totalPages: 28450, totalCost: 145600 },
        { departmentName: '총무팀', totalPages: 35290, totalCost: 178400 },
        { departmentName: '기획팀', totalPages: 35000, totalCost: 143000 }
      ]);

      setAlerts([
        { id: 1, printerName: 'Canon-MFP-004', type: 'low-toner', message: '토너 부족' },
        { id: 2, printerName: 'Canon-MFP-002', type: 'low-paper', message: '용지 부족' }
      ]);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="오류"
        description={error}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  // 컬러/흑백 비율 데이터
  const colorData = [
    { name: '컬러', value: stats?.colorPages || 0, color: '#CC0000' },
    { name: '흑백', value: stats?.bwPages || 0, color: '#262626' },
  ];

  // 월별 출력량 데이터 (샘플)
  const monthlyData = [
    { month: '10월', impressions: 45000, sheets: 28000 },
    { month: '11월', impressions: 52000, sheets: 31000 },
    { month: '12월', impressions: 52513, sheets: 31680 },
  ];

  return (
    <div className="dashboard">
      <Title level={2} style={{ marginBottom: 24 }}>
        출력 사용량 및 리포트
      </Title>

      {/* 알림 배너 */}
      {alerts.length > 0 && (
        <Alert
          message={`${alerts.length}개의 프린터에 주의가 필요합니다`}
          description="토너 부족, 용지 부족 또는 오류가 발생한 프린터가 있습니다."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 상단 통계 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="출력된 작업"
              value={stats?.totalJobs || 0}
              prefix={<FileTextOutlined className="stat-icon" style={{ color: '#CC0000' }} />}
              suffix="건"
              valueStyle={{ color: '#CC0000' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              이번 달 총 출력 작업 수
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="출력 페이지"
              value={stats?.totalPages || 0}
              prefix={<PrinterOutlined className="stat-icon" style={{ color: '#262626' }} />}
              suffix="장"
              valueStyle={{ color: '#262626' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              총 {stats?.colorPages || 0}장 컬러, {stats?.bwPages || 0}장 흑백
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="총 비용"
              value={stats?.totalCost || 0}
              prefix={<DollarOutlined className="stat-icon" style={{ color: '#8C8C8C' }} />}
              suffix="원"
              precision={0}
              valueStyle={{ color: '#8C8C8C' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              이번 달 출력 비용
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="비용 절감"
              value={stats?.totalSavings || 0}
              prefix={<SaveOutlined className="stat-icon" style={{ color: '#52c41a' }} />}
              suffix="원"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              정책 적용으로 절감된 비용
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 차트 섹션 */}
      <Row gutter={[16, 16]}>
        {/* 작업 출력량 차트 */}
        <Col xs={24} lg={12}>
          <Card title="월별 출력량" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="#CC0000" 
                  name="인쇄물(Impressions)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="sheets" 
                  stroke="#262626" 
                  name="용지(Sheets)"
                  strokeWidth={2}
                />stroke="#52c41a" 
                  name="용지(Sheets)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 컬러 vs 흑백 차트 */}
        <Col xs={24} lg={12}>
          <Card title="컬러 vs 흑백 인쇄" className="chart-card">
            <div style={{ textAlign: 'center' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={colorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name} (${entry.value}장)`}
                  >
                    {colorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 16 }}>
                <Text strong style={{ fontSize: 32, color: '#CC0000' }}>
                  {Math.round((colorData[0].value / (colorData[0].value + colorData[1].value)) * 100)}%
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">컬러 인쇄 비율</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 부서별 출력량 */}
        <Col xs={24}>
          <Card title="부서별 출력 통계" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="departmentName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalPages" fill="#CC0000" name="총 페이지 수" />
                <Bar dataKey="totalCost" fill="#8C8C8C" name="총 비용 (원)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 프린터 상태 요약 */}
        <Col xs={24}>
          <Card title="프린터 상태" className="chart-card">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="총 프린터"
                    value={18}
                    suffix="대"
                    valueStyle={{ color: '#CC0000' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="정상"
                    value={15}
                    suffix="대"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="경고"
                    value={2}
                    suffix="대"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="오류"
                    value={1}
                    suffix="대"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
