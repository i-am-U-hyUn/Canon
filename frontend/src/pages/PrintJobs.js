import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, DatePicker, Select, Input, Statistic, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { printJobsAPI } from '../services/api';
import dayjs from 'dayjs';
import '../styles/PrintJobs.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PrintJobs = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalPages: 0,
    totalCost: 0,
    avgPagesPerJob: 0
  });

  // Mock data for print jobs
  const mockPrintJobs = [
    {
      id: 1,
      jobName: '2024_연간보고서.pdf',
      userName: '김철수',
      department: '영업팀',
      printerName: 'Canon-MFP-001',
      timestamp: '2024-11-30 14:23:15',
      pages: 45,
      colorPages: 12,
      bwPages: 33,
      copies: 3,
      duplex: true,
      paperSize: 'A4',
      cost: 2850,
      status: 'completed'
    },
    {
      id: 2,
      jobName: '계약서_초안_v3.docx',
      userName: '이영희',
      department: '개발팀',
      printerName: 'Canon-MFP-002',
      timestamp: '2024-11-30 14:18:42',
      pages: 8,
      colorPages: 0,
      bwPages: 8,
      copies: 1,
      duplex: false,
      paperSize: 'A4',
      cost: 240,
      status: 'completed'
    },
    {
      id: 3,
      jobName: '마케팅_기획안_최종.pptx',
      userName: '박민수',
      department: '마케팅팀',
      printerName: 'Canon-MFP-003',
      timestamp: '2024-11-30 13:45:20',
      pages: 32,
      colorPages: 28,
      bwPages: 4,
      copies: 5,
      duplex: false,
      paperSize: 'A4',
      cost: 8960,
      status: 'completed'
    },
    {
      id: 4,
      jobName: '인사평가_양식.xlsx',
      userName: '정수현',
      department: '인사팀',
      printerName: 'Canon-MFP-001',
      timestamp: '2024-11-30 13:12:08',
      pages: 5,
      colorPages: 0,
      bwPages: 5,
      copies: 20,
      duplex: true,
      paperSize: 'A4',
      cost: 750,
      status: 'completed'
    },
    {
      id: 5,
      jobName: '견적서_2024Q4.pdf',
      userName: '최동욱',
      department: '영업팀',
      printerName: 'Canon-MFP-004',
      timestamp: '2024-11-30 12:58:33',
      pages: 12,
      colorPages: 4,
      bwPages: 8,
      copies: 2,
      duplex: false,
      paperSize: 'A4',
      cost: 1040,
      status: 'completed'
    },
    {
      id: 6,
      jobName: '프로젝트_일정표.pdf',
      userName: '강지은',
      department: '개발팀',
      printerName: 'Canon-MFP-002',
      timestamp: '2024-11-30 11:34:15',
      pages: 3,
      colorPages: 3,
      bwPages: 0,
      copies: 1,
      duplex: false,
      paperSize: 'A4',
      cost: 240,
      status: 'completed'
    },
    {
      id: 7,
      jobName: '월간_실적_보고.xlsx',
      userName: '윤태희',
      department: '총무팀',
      printerName: 'Canon-MFP-005',
      timestamp: '2024-11-30 11:05:47',
      pages: 18,
      colorPages: 6,
      bwPages: 12,
      copies: 1,
      duplex: true,
      paperSize: 'A4',
      cost: 900,
      status: 'completed'
    },
    {
      id: 8,
      jobName: '사업계획서_2025.pptx',
      userName: '임서연',
      department: '기획팀',
      printerName: 'Canon-MFP-001',
      timestamp: '2024-11-30 10:22:19',
      pages: 56,
      colorPages: 48,
      bwPages: 8,
      copies: 10,
      duplex: false,
      paperSize: 'A4',
      cost: 30400,
      status: 'completed'
    },
    {
      id: 9,
      jobName: '회의록_2024-11-29.docx',
      userName: '송민재',
      department: '개발팀',
      printerName: 'Canon-MFP-003',
      timestamp: '2024-11-30 09:47:52',
      pages: 4,
      colorPages: 0,
      bwPages: 4,
      copies: 8,
      duplex: true,
      paperSize: 'A4',
      cost: 240,
      status: 'completed'
    },
    {
      id: 10,
      jobName: '교육자료_신입사원.pdf',
      userName: '한지우',
      department: '인사팀',
      printerName: 'Canon-MFP-002',
      timestamp: '2024-11-30 09:15:30',
      pages: 24,
      colorPages: 12,
      bwPages: 12,
      copies: 15,
      duplex: false,
      paperSize: 'A4',
      cost: 10800,
      status: 'completed'
    }
  ];

  useEffect(() => {
    fetchPrintJobs();
  }, [dateRange, selectedDepartment]);

  const fetchPrintJobs = async () => {
    setLoading(true);
    try {
      // Mock data 사용
      const filteredJobs = mockPrintJobs.filter(job => {
        if (selectedDepartment && job.department !== selectedDepartment) {
          return false;
        }
        if (searchText) {
          return job.jobName.toLowerCase().includes(searchText.toLowerCase()) ||
                 job.userName.toLowerCase().includes(searchText.toLowerCase());
        }
        return true;
      });

      setPrintJobs(filteredJobs);

      // 통계 계산
      const totalJobs = filteredJobs.length;
      const totalPages = filteredJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
      const totalCost = filteredJobs.reduce((sum, job) => sum + job.cost, 0);
      const avgPagesPerJob = totalJobs > 0 ? Math.round(totalPages / totalJobs) : 0;

      setStats({ totalJobs, totalPages, totalCost, avgPagesPerJob });
    } catch (error) {
      console.error('Failed to fetch print jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '출력 문서명',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 250,
      ellipsis: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="문서명 검색"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.jobName.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '사용자',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
    },
    {
      title: '부서',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      filters: [
        { text: '영업팀', value: '영업팀' },
        { text: '개발팀', value: '개발팀' },
        { text: '마케팅팀', value: '마케팅팀' },
        { text: '인사팀', value: '인사팀' },
        { text: '총무팀', value: '총무팀' },
        { text: '기획팀', value: '기획팀' },
      ],
      onFilter: (value, record) => record.department === value,
    },
    {
      title: '프린터',
      dataIndex: 'printerName',
      key: 'printerName',
      width: 140,
    },
    {
      title: '출력 시간',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: '페이지',
      key: 'pages',
      width: 120,
      render: (_, record) => (
        <span>
          {record.pages * record.copies}
          {record.copies > 1 && <span style={{ color: '#999' }}> ({record.copies}부)</span>}
        </span>
      ),
      sorter: (a, b) => (a.pages * a.copies) - (b.pages * b.copies),
    },
    {
      title: '컬러/흑백',
      key: 'color',
      width: 100,
      render: (_, record) => (
        <Space size={4} direction="vertical">
          <span style={{ color: '#1890ff' }}>컬러: {record.colorPages * record.copies}</span>
          <span style={{ color: '#666' }}>흑백: {record.bwPages * record.copies}</span>
        </Space>
      ),
    },
    {
      title: '옵션',
      key: 'options',
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.duplex && <Tag color="green">양면</Tag>}
          <Tag>{record.paperSize}</Tag>
        </Space>
      ),
    },
    {
      title: '비용',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost) => `₩${cost.toLocaleString()}`,
      sorter: (a, b) => a.cost - b.cost,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          completed: { color: 'success', text: '완료' },
          pending: { color: 'processing', text: '대기중' },
          printing: { color: 'processing', text: '출력중' },
          failed: { color: 'error', text: '실패' },
          cancelled: { color: 'default', text: '취소' }
        };
        const config = statusConfig[status] || statusConfig.completed;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  return (
    <div className="print-jobs-page">
      <div className="page-header">
        <h2>출력 작업 내역</h2>
        <Space>
          <Button icon={<DownloadOutlined />}>Excel 내보내기</Button>
          <Button type="primary" icon={<ReloadOutlined />} onClick={fetchPrintJobs}>
            새로고침
          </Button>
        </Space>
      </div>

      {/* 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 출력 작업"
              value={stats.totalJobs}
              suffix="건"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 출력 페이지"
              value={stats.totalPages}
              suffix="페이지"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="평균 페이지/작업"
              value={stats.avgPagesPerJob}
              suffix="페이지"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 비용"
              value={stats.totalCost}
              prefix="₩"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 필터 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="YYYY-MM-DD"
            style={{ width: 260 }}
          />
          <Select
            placeholder="부서 선택"
            allowClear
            style={{ width: 150 }}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
          >
            <Option value="영업팀">영업팀</Option>
            <Option value="개발팀">개발팀</Option>
            <Option value="마케팅팀">마케팅팀</Option>
            <Option value="인사팀">인사팀</Option>
            <Option value="총무팀">총무팀</Option>
            <Option value="기획팀">기획팀</Option>
          </Select>
          <Input
            placeholder="문서명 또는 사용자 검색"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={fetchPrintJobs}
          />
          <Button icon={<FilterOutlined />} onClick={fetchPrintJobs}>
            필터 적용
          </Button>
        </Space>
      </Card>

      {/* 출력 작업 테이블 */}
      <Card>
        <Table
          columns={columns}
          dataSource={printJobs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default PrintJobs;
