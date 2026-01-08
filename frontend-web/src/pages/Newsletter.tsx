import { Button, Card, Form, Input, Typography, message } from 'antd';
import { api } from '../utils/api';

export default function Newsletter() {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      await api.post('/newsletter/subscribe', { email: values.email });
      message.success('Inscription à la newsletter réussie');
      form.resetFields();
    } catch (e: any) {
      message.error(e?.message || 'Échec de l’inscription');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Typography.Title level={3}>Newsletter</Typography.Title>
        <Typography.Paragraph>Recevez les mises à jour et statistiques des dons.</Typography.Paragraph>
        <Form form={form} layout="inline" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email valide requis' }]}>
            <Input placeholder="Votre email" style={{ width: 320 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit">S’inscrire</Button>
        </Form>
      </Card>
    </div>
  );
}


