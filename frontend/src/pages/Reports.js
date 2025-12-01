import React, { useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Space, Tabs, Table, Statistic } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, BarChartOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import '../styles/Reports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [reportType, setReportType] = useState('summary');

  // Mock data
  const departmentCostData = [
    { department: '영업팀', cost: 234500, pages: 45680, colorRatio: 33 },
    { department: '개발팀', cost: 345600, pages: 62340, colorRatio: 46 },
    { department: '마케팅팀', cost: 198700, pages: 38920, colorRatio: 48 },
    { department: '인사팀', cost: 145600, pages: 28450, colorRatio: 35 },
    { department: '총무팀', cost: 178400, pages: 35290, colorRatio: 32 },
    { department: '기획팀', cost: 289300, pages: 51420, colorRatio: 55 },
  ];

  const dailyTrendData = [
    { date: '11-24', pages: 8450, cost: 42300 },
    { date: '11-25', pages: 9200, cost: 48500 },
    { date: '11-26', pages: 7800, cost: 39200 },
    { date: '11-27', pages: 9500, cost: 51800 },
    { date: '11-28', pages: 8900, cost: 45600 },
    { date: '11-29', pages: 10200, cost: 56700 },
    { date: '11-30', pages: 9100, cost: 47200 },
  ];

  const printerUsageData = [
    { printer: 'Canon-MFP-001', pages: 125340, utilization: 85, avgCostPerPage: 5.2 },
    { printer: 'Canon-MFP-002', pages: 98450, utilization: 72, avgCostPerPage: 4.8 },
    { printer: 'Canon-MFP-003', pages: 78920, utilization: 58, avgCostPerPage: 5.0 },
    { printer: 'Canon-MFP-004', pages: 156780, utilization: 95, avgCostPerPage: 5.4 },
    { printer: 'Canon-MFP-005', pages: 45290, utilization: 42, avgCostPerPage: 4.6 },
  ];

  const colorUsageData = [
    { name: '컬러', value: 88450, percentage: 36 },
    { name: '흑백', value: 157230, percentage: 64 },
  ];

  const topUsersData = [
    { rank: 1, name: '김철수', department: '영업팀', pages: 12450, cost: 68500 },
    { rank: 2, name: '이영희', department: '개발팀', pages: 11280, cost: 62300 },
    { rank: 3, name: '박민수', department: '마케팅팀', pages: 10890, cost: 71200 },
    { rank: 4, name: '정수현', department: '인사팀', pages: 9540, cost: 48700 },
    { rank: 5, name: '최동욱', department: '영업팀', pages: 9120, cost: 52400 },
    { rank: 6, name: '강지은', department: '개발팀', pages: 8760, cost: 45900 },
    { rank: 7, name: '윤태희', department: '총무팀', pages: 8340, cost: 42100 },
    { rank: 8, name: '임서연', department: '기획팀', pages: 7980, cost: 51600 },
    { rank: 9, name: '송민재', department: '개발팀', pages: 7520, cost: 38200 },
    { rank: 10, name: '한지우', department: '인사팀', pages: 7210, cost: 36800 },
  ];

  const costSavingsData = [
    { category: '컬러→흑백 자동변환', savings: 125000, percentage: 45 },
    { category: '양면 출력 자동설정', savings: 87000, percentage: 31 },
    { category: '불필요한 출력 감소', savings: 52000, percentage: 19 },
    { category: '용지 절약', savings: 14000, percentage: 5 },
  ];

  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

  const userColumns = [
    {
      title: '순위',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank) => {
        const medalColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
        return (
          <span style={{ fontWeight: 'bold', color: medalColors[rank] || '#666' }}>
            {rank}
          </span>
        );
      }
    },
    { title: '이름', dataIndex: 'name', key: 'name', width: 100 },
    { title: '부서', dataIndex: 'department', key: 'department', width: 100 },
    { 
      title: '출력 페이지', 
      dataIndex: 'pages', 
      key: 'pages', 
      width: 120,
      render: (pages) => pages.toLocaleString(),
      sorter: (a, b) => a.pages - b.pages,
    },
    { 
      title: '비용', 
      dataIndex: 'cost', 
      key: 'cost', 
      width: 120,
      render: (cost) => `₩${cost.toLocaleString()}`,
      sorter: (a, b) => a.cost - b.cost,
    },
  ];

  const printerColumns = [
    { title: '프린터명', dataIndex: 'printer', key: 'printer', width: 150 },
    { 
      title: '총 출력 페이지', 
      dataIndex: 'pages', 
      key: 'pages', 
      width: 130,
      render: (pages) => pages.toLocaleString(),
      sorter: (a, b) => a.pages - b.pages,
    },
    { 
      title: '가동률', 
      dataIndex: 'utilization', 
      key: 'utilization', 
      width: 100,
      render: (util) => `${util}%`,
      sorter: (a, b) => a.utilization - b.utilization,
    },
    { 
      title: '페이지당 비용', 
      dataIndex: 'avgCostPerPage', 
      key: 'avgCostPerPage', 
      width: 130,
      render: (cost) => `₩${cost.toFixed(1)}`,
      sorter: (a, b) => a.avgCostPerPage - b.avgCostPerPage,
    },
  ];

  const handleExport = (format) => {
    console.log(`Exporting report as ${format}`);
    // 실제로는 백엔드 API를 호출하여 파일 생성
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h2>출력 리포트</h2>
        <Space>
          <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
            Excel 내보내기
          </Button>
          <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
            PDF 내보내기
          </Button>
        </Space>
      </div>

      {/* 필터 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="YYYY-MM-DD"
            style={{ width: 260 }}
          />
          <Select
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            style={{ width: 150 }}
          >
            <Option value="all">전체 부서</Option>
            <Option value="영업팀">영업팀</Option>
            <Option value="개발팀">개발팀</Option>
            <Option value="마케팅팀">마케팅팀</Option>
            <Option value="인사팀">인사팀</Option>
            <Option value="총무팀">총무팀</Option>
            <Option value="기획팀">기획팀</Option>
          </Select>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 150 }}
          >
            <Option value="summary">종합 리포트</Option>
            <Option value="department">부서별 분석</Option>
            <Option value="printer">프린터별 분석</Option>
            <Option value="user">사용자별 분석</Option>
          </Select>
          <Button type="primary" icon={<BarChartOutlined />}>
            리포트 생성
          </Button>
        </Space>
      </Card>

      {/* 주요 지표 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 출력 페이지"
              value={245680}
              suffix="페이지"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              전월 대비 +12.5%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 출력 비용"
              value={1245800}
              prefix="₩"
              valueStyle={{ color: '#f5222d' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              전월 대비 +8.3%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="비용 절감액"
              value={278000}
              prefix="₩"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              자동 정책으로 절감
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="평균 페이지 단가"
              value={5.07}
              prefix="₩"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              전월 대비 -3.2%
            </div>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" style={{ marginBottom: 24 }}>
        <Tabs.TabPane tab="일별 추이" key="1">
          <Card>
            <h3>일별 출력량 및 비용 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="pages" stroke="#1890ff" name="출력 페이지" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#f5222d" name="비용 (₩)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="부서별 분석" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <h3>부서별 출력 비용</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentCostData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cost" fill="#1890ff" name="비용 (₩)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <h3>부서별 출력 페이지</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentCostData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pages" fill="#52c41a" name="페이지" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="컬러 사용 분석" key="3">
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <h3>컬러/흑백 출력 비율</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={colorUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {colorUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Space size="large">
                    <div>
                      <div style={{ color: COLORS[0], fontWeight: 'bold', fontSize: 20 }}>
                        {colorUsageData[0].value.toLocaleString()}
                      </div>
                      <div style={{ color: '#999' }}>컬러 페이지</div>
                    </div>
                    <div>
                      <div style={{ color: COLORS[1], fontWeight: 'bold', fontSize: 20 }}>
                        {colorUsageData[1].value.toLocaleString()}
                      </div>
                      <div style={{ color: '#999' }}>흑백 페이지</div>
                    </div>
                  </Space>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <h3>비용 절감 현황</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costSavingsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="savings" fill="#52c41a" name="절감액 (₩)" />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Statistic
                    title="총 절감액"
                    value={costSavingsData.reduce((sum, item) => sum + item.savings, 0)}
                    prefix="₩"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="사용자 순위" key="4">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="출력량 TOP 10 사용자">
                <Table
                  columns={userColumns}
                  dataSource={topUsersData}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="프린터 가동 현황">
                <Table
                  columns={printerColumns}
                  dataSource={printerUsageData}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Reports;
