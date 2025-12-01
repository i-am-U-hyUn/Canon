import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Progress, Space, Typography, Button, Tooltip, Badge } from 'antd';
import {
  PrinterOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { printersAPI } from '../services/api';

const { Title } = Typography;

const Printers = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrinters();
    const interval = setInterval(fetchPrinters, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await printersAPI.getAll();
      setPrinters(response.data);
    } catch (error) {
      console.error('Failed to fetch printers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'WARNING':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'ERROR':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <SyncOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getStatusTag = (status) => {
    const colors = {
      ONLINE: 'success',
      WARNING: 'warning',
      ERROR: 'error',
      OFFLINE: 'default',
    };
    return <Tag color={colors[status] || 'default'}>{status}</Tag>;
  };

  const columns = [
    {
      title: '프린터',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          {getStatusIcon(record.status)}
          <div>
            <div><strong>{name}</strong></div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.location}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'IP 주소',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: '토너 잔량',
      key: 'toner',
      render: (record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <span style={{ fontSize: 12 }}>블랙:</span>
            <Progress 
              percent={record.tonerLevelBlack || 0} 
              size="small" 
              status={record.tonerLevelBlack <= 15 ? 'exception' : 'normal'}
            />
          </div>
          {record.isColor && (
            <>
              <div>
                <span style={{ fontSize: 12 }}>시안:</span>
                <Progress percent={record.tonerLevelCyan || 0} size="small" strokeColor="#00bcd4" />
              </div>
              <div>
                <span style={{ fontSize: 12 }}>마젠타:</span>
                <Progress percent={record.tonerLevelMagenta || 0} size="small" strokeColor="#e91e63" />
              </div>
              <div>
                <span style={{ fontSize: 12 }}>옐로우:</span>
                <Progress percent={record.tonerLevelYellow || 0} size="small" strokeColor="#ffc107" />
              </div>
            </>
          )}
        </Space>
      ),
    },
    {
      title: '용지',
      dataIndex: 'paperLevel',
      key: 'paperLevel',
      render: (paperLevel) => (
        <Progress 
          percent={paperLevel || 0} 
          size="small"
          status={paperLevel <= 20 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: '출력량',
      dataIndex: 'totalPageCount',
      key: 'totalPageCount',
      render: (count) => count?.toLocaleString() || 0,
    },
  ];

  // 샘플 데이터 (API 연동 전)
  const sampleData = [
    {
      key: '1',
      name: '본사-복합기-1F',
      location: '본사 1층 로비',
      status: 'ONLINE',
      ipAddress: '192.168.1.101',
      tonerLevelBlack: 78,
      tonerLevelCyan: 45,
      tonerLevelMagenta: 52,
      tonerLevelYellow: 61,
      paperLevel: 85,
      totalPageCount: 156234,
      isColor: true,
    },
    {
      key: '2',
      name: '본사-복합기-3F-개발팀',
      location: '본사 3층 개발실',
      status: 'WARNING',
      ipAddress: '192.168.1.103',
      tonerLevelBlack: 12,
      tonerLevelCyan: 8,
      tonerLevelMagenta: 15,
      tonerLevelYellow: 10,
      paperLevel: 45,
      totalPageCount: 234567,
      isColor: true,
    },
    {
      key: '3',
      name: '본사-복합기-4F-마케팅',
      location: '본사 4층 마케팅실',
      status: 'ONLINE',
      ipAddress: '192.168.1.104',
      tonerLevelBlack: 65,
      tonerLevelCyan: 72,
      tonerLevelMagenta: 68,
      tonerLevelYellow: 70,
      paperLevel: 90,
      totalPageCount: 189432,
      isColor: true,
    },
    {
      key: '4',
      name: '본사-복합기-5F-영업팀',
      location: '본사 5층 영업실',
      status: 'ERROR',
      ipAddress: '192.168.1.105',
      tonerLevelBlack: 45,
      paperLevel: 15,
      totalPageCount: 145678,
      isColor: false,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>프린터 관리</Title>
        <Button type="primary" icon={<SyncOutlined />} onClick={fetchPrinters}>
          새로고침
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={sampleData}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Printers;
