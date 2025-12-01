import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Space, Tabs, Divider, message, Row, Col } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import '../styles/Settings.css';

const { Option } = Select;
const { TextArea } = Input;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 비용 설정
  const [costSettings, setCostSettings] = useState({
    colorPageCost: 80,
    bwPageCost: 30,
    duplexDiscount: 50,
    currency: 'KRW'
  });

  // 정책 설정
  const [policySettings, setPolicySettings] = useState({
    autoColorToBw: true,
    colorThreshold: 10,
    autoDuplex: true,
    quotaEnabled: false,
    monthlyQuota: 1000
  });

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    slackEnabled: false,
    tonerThreshold: 15,
    paperThreshold: 20,
    emailRecipients: 'admin@company.com'
  });

  // SNMP 설정
  const [snmpSettings, setSnmpSettings] = useState({
    enabled: true,
    version: 'v2c',
    community: 'public',
    port: 161,
    timeout: 5000,
    retries: 3,
    scanInterval: 5
  });

  const handleSaveCostSettings = () => {
    setLoading(true);
    setTimeout(() => {
      message.success('비용 설정이 저장되었습니다.');
      setLoading(false);
    }, 1000);
  };

  const handleSavePolicySettings = () => {
    setLoading(true);
    setTimeout(() => {
      message.success('정책 설정이 저장되었습니다.');
      setLoading(false);
    }, 1000);
  };

  const handleSaveNotificationSettings = () => {
    setLoading(true);
    setTimeout(() => {
      message.success('알림 설정이 저장되었습니다.');
      setLoading(false);
    }, 1000);
  };

  const handleSaveSnmpSettings = () => {
    setLoading(true);
    setTimeout(() => {
      message.success('SNMP 설정이 저장되었습니다.');
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    form.resetFields();
    message.info('설정이 초기화되었습니다.');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>시스템 설정</h2>
      </div>

      <Tabs defaultActiveKey="1">
        {/* 비용 설정 */}
        <Tabs.TabPane tab="비용 설정" key="1">
          <Card>
            <h3>출력 비용 설정</h3>
            <Divider />
            <Form
              form={form}
              layout="vertical"
              initialValues={costSettings}
              onValuesChange={(changedValues, allValues) => setCostSettings(allValues)}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="컬러 페이지 단가"
                    name="colorPageCost"
                    rules={[{ required: true, message: '컬러 페이지 단가를 입력하세요' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      addonAfter="원"
                      placeholder="80"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="흑백 페이지 단가"
                    name="bwPageCost"
                    rules={[{ required: true, message: '흑백 페이지 단가를 입력하세요' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      addonAfter="원"
                      placeholder="30"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="양면 인쇄 할인율"
                    name="duplexDiscount"
                    tooltip="양면 인쇄 시 적용되는 할인 비율"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={100}
                      addonAfter="%"
                      placeholder="50"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="통화"
                    name="currency"
                  >
                    <Select>
                      <Option value="KRW">KRW (원)</Option>
                      <Option value="USD">USD ($)</Option>
                      <Option value="EUR">EUR (€)</Option>
                      <Option value="JPY">JPY (¥)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveCostSettings} loading={loading}>
                    저장
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    초기화
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Tabs.TabPane>

        {/* 출력 정책 */}
        <Tabs.TabPane tab="출력 정책" key="2">
          <Card>
            <h3>자동 비용 절감 정책</h3>
            <Divider />
            <Form layout="vertical" initialValues={policySettings}>
              <Form.Item
                label="컬러 → 흑백 자동 변환"
                name="autoColorToBw"
                valuePropName="checked"
                tooltip="컬러 비율이 낮은 문서를 자동으로 흑백으로 변환"
              >
                <Switch
                  checked={policySettings.autoColorToBw}
                  onChange={(checked) => setPolicySettings({ ...policySettings, autoColorToBw: checked })}
                />
              </Form.Item>
              {policySettings.autoColorToBw && (
                <Form.Item
                  label="컬러 비율 임계값"
                  name="colorThreshold"
                  tooltip="이 비율 이하의 컬러 사용 시 흑백으로 변환"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    value={policySettings.colorThreshold}
                    onChange={(value) => setPolicySettings({ ...policySettings, colorThreshold: value })}
                    addonAfter="%"
                  />
                </Form.Item>
              )}
              <Form.Item
                label="양면 인쇄 자동 설정"
                name="autoDuplex"
                valuePropName="checked"
                tooltip="모든 출력 작업에 자동으로 양면 인쇄 적용"
              >
                <Switch
                  checked={policySettings.autoDuplex}
                  onChange={(checked) => setPolicySettings({ ...policySettings, autoDuplex: checked })}
                />
              </Form.Item>
              <Divider />
              <h3>출력 할당량 관리</h3>
              <Form.Item
                label="할당량 제한 사용"
                name="quotaEnabled"
                valuePropName="checked"
              >
                <Switch
                  checked={policySettings.quotaEnabled}
                  onChange={(checked) => setPolicySettings({ ...policySettings, quotaEnabled: checked })}
                />
              </Form.Item>
              {policySettings.quotaEnabled && (
                <Form.Item
                  label="월별 기본 할당량"
                  name="monthlyQuota"
                  tooltip="사용자당 기본 월별 출력 페이지 수"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    value={policySettings.monthlyQuota}
                    onChange={(value) => setPolicySettings({ ...policySettings, monthlyQuota: value })}
                    addonAfter="페이지"
                  />
                </Form.Item>
              )}
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSavePolicySettings} loading={loading}>
                    저장
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    초기화
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Tabs.TabPane>

        {/* 알림 설정 */}
        <Tabs.TabPane tab="알림 설정" key="3">
          <Card>
            <h3>알림 채널 설정</h3>
            <Divider />
            <Form layout="vertical" initialValues={notificationSettings}>
              <Form.Item
                label="이메일 알림"
                name="emailEnabled"
                valuePropName="checked"
              >
                <Switch
                  checked={notificationSettings.emailEnabled}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, emailEnabled: checked })}
                />
              </Form.Item>
              {notificationSettings.emailEnabled && (
                <Form.Item
                  label="수신자 이메일"
                  name="emailRecipients"
                  rules={[{ type: 'email', message: '올바른 이메일 주소를 입력하세요' }]}
                >
                  <Input
                    value={notificationSettings.emailRecipients}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailRecipients: e.target.value })}
                    placeholder="admin@company.com"
                  />
                </Form.Item>
              )}
              <Form.Item
                label="Slack 알림"
                name="slackEnabled"
                valuePropName="checked"
              >
                <Switch
                  checked={notificationSettings.slackEnabled}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, slackEnabled: checked })}
                />
              </Form.Item>
              {notificationSettings.slackEnabled && (
                <Form.Item
                  label="Slack Webhook URL"
                  name="slackWebhook"
                >
                  <Input placeholder="https://hooks.slack.com/services/..." />
                </Form.Item>
              )}
              <Divider />
              <h3>알림 임계값</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="토너 부족 임계값"
                    name="tonerThreshold"
                    tooltip="이 비율 이하로 토너가 남으면 알림"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={100}
                      value={notificationSettings.tonerThreshold}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, tonerThreshold: value })}
                      addonAfter="%"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="용지 부족 임계값"
                    name="paperThreshold"
                    tooltip="이 비율 이하로 용지가 남으면 알림"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={100}
                      value={notificationSettings.paperThreshold}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, paperThreshold: value })}
                      addonAfter="%"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveNotificationSettings} loading={loading}>
                    저장
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    초기화
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Tabs.TabPane>

        {/* SNMP 설정 */}
        <Tabs.TabPane tab="SNMP 설정" key="4">
          <Card>
            <h3>SNMP 프로토콜 설정</h3>
            <Divider />
            <Form layout="vertical" initialValues={snmpSettings}>
              <Form.Item
                label="SNMP 모니터링 사용"
                name="enabled"
                valuePropName="checked"
              >
                <Switch
                  checked={snmpSettings.enabled}
                  onChange={(checked) => setSnmpSettings({ ...snmpSettings, enabled: checked })}
                />
              </Form.Item>
              {snmpSettings.enabled && (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="SNMP 버전"
                        name="version"
                      >
                        <Select
                          value={snmpSettings.version}
                          onChange={(value) => setSnmpSettings({ ...snmpSettings, version: value })}
                        >
                          <Option value="v1">SNMP v1</Option>
                          <Option value="v2c">SNMP v2c</Option>
                          <Option value="v3">SNMP v3</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="커뮤니티 문자열"
                        name="community"
                      >
                        <Input
                          value={snmpSettings.community}
                          onChange={(e) => setSnmpSettings({ ...snmpSettings, community: e.target.value })}
                          placeholder="public"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="포트"
                        name="port"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={1}
                          max={65535}
                          value={snmpSettings.port}
                          onChange={(value) => setSnmpSettings({ ...snmpSettings, port: value })}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="타임아웃"
                        name="timeout"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={1000}
                          max={30000}
                          value={snmpSettings.timeout}
                          onChange={(value) => setSnmpSettings({ ...snmpSettings, timeout: value })}
                          addonAfter="ms"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="재시도 횟수"
                        name="retries"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          max={10}
                          value={snmpSettings.retries}
                          onChange={(value) => setSnmpSettings({ ...snmpSettings, retries: value })}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    label="스캔 주기"
                    name="scanInterval"
                    tooltip="프린터 상태를 확인하는 주기 (분)"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      max={60}
                      value={snmpSettings.scanInterval}
                      onChange={(value) => setSnmpSettings({ ...snmpSettings, scanInterval: value })}
                      addonAfter="분"
                    />
                  </Form.Item>
                </>
              )}
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveSnmpSettings} loading={loading}>
                    저장
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    초기화
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Tabs.TabPane>

        {/* 시스템 정보 */}
        <Tabs.TabPane tab="시스템 정보" key="5">
          <Card>
            <h3>시스템 정보</h3>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <p><strong>시스템 버전:</strong> 1.0.0</p>
                  <p><strong>빌드 날짜:</strong> 2024-12-01</p>
                  <p><strong>데이터베이스:</strong> PostgreSQL 16 + TimescaleDB</p>
                  <p><strong>캐시:</strong> Redis 7</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <p><strong>백엔드:</strong> Spring Boot 3.2 + .NET 8.0</p>
                  <p><strong>프론트엔드:</strong> React 18.2</p>
                  <p><strong>UI 라이브러리:</strong> Ant Design 5.12</p>
                  <p><strong>차트:</strong> Recharts 2.10</p>
                </Card>
              </Col>
            </Row>
            <Divider />
            <h3>라이선스</h3>
            <Card>
              <p><strong>제품명:</strong> Canon Print Management System</p>
              <p><strong>라이선스 타입:</strong> Enterprise</p>
              <p><strong>유효 기간:</strong> 2024-01-01 ~ 2025-12-31</p>
              <p><strong>최대 프린터 수:</strong> 무제한</p>
            </Card>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
