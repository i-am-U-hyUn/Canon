import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  PrinterOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: '/print-jobs',
      icon: <FileTextOutlined />,
      label: '출력 작업',
    },
    {
      key: '/printers',
      icon: <PrinterOutlined />,
      label: '프린터 관리',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '리포트',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '설정',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <Layout className="main-layout">
      <Header className="header">
        <div className="logo">
          <img src="/canon-logo.svg" alt="Canon" style={{ height: 40 }} />
          <span className="logo-text">Print Management</span>
        </div>
        <div className="header-right">
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <Space className="user-menu">
              <Avatar icon={<UserOutlined />} />
              <span>관리자</span>
            </Space>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          width={240}
          className="sider"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout className="content-layout">
          <Content className="content">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
