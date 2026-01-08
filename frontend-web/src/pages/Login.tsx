import { Button, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      await login(values.email, values.password);
      message.success('Connecté');
      navigate('/');
    } catch (e: any) {
      message.error(e?.message || 'Échec de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ 
          width: 100, 
          height: 100, 
          margin: '0 auto 24px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
        }}>
          🎁
        </div>
        <Typography.Title level={2} style={{ color: '#52c41a' }}>Connexion</Typography.Title>
        <Typography.Text type="secondary">
          Connectez-vous pour accéder à votre espace personnel
        </Typography.Text>
      </div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item 
          label="Email" 
          name="email" 
          rules={[{ required: true, type: 'email', message: 'Email valide requis' }]}
        >
          <Input placeholder="votre@email.com" size="large" />
        </Form.Item>
        <Form.Item 
          label="Mot de passe" 
          name="password" 
          rules={[{ required: true, message: 'Mot de passe requis' }]}
        >
          <Input.Password placeholder="Votre mot de passe" size="large" />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitting} 
            disabled={submitting}
            block
            size="large"
          >
            Se connecter
          </Button>
        </Form.Item>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text>
            Vous n'avez pas de compte ? <Link to="/register">Créer un compte</Link>
          </Typography.Text>
        </div>
        <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            <strong>Comptes de test :</strong><br />
            Admin: admin@sadaka.ma<br />
            Modérateur: moderator@sadaka.ma<br />
            Utilisateur: user@sadaka.ma
          </Typography.Text>
        </div>
      </Form>
    </div>
  );
}
