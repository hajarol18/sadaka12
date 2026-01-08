import { Button, Form, Input, Typography, message, Row, Col, Card, Alert, Space } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      setError(null);
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        email: values.email,
        password: values.password
      });
      message.success('Inscription réussie! Vous allez être redirigé vers la page d\'accueil.');
      form.resetFields();
      // Redirection après un court délai pour que l'utilisateur puisse voir le message
      setTimeout(() => navigate('/'), 1500);
    } catch (e: any) {
      setError(e?.message || "Échec de l'inscription. Veuillez réessayer.");
      message.error(e?.message || "Échec de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '80vh' }}>
      <Col xs={22} sm={20} md={16} lg={12} xl={8}>
        <Card variant="outlined" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
            Créer un compte
          </Typography.Title>
          
          {error && (
            <Alert 
              message="Erreur" 
              description={error} 
              type="error" 
              showIcon 
              closable 
              style={{ marginBottom: 24 }}
              onClose={() => setError(null)}
            />
          )}
          
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            requiredMark="optional"
            validateTrigger={['onBlur', 'onChange']}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="Nom" 
                  name="lastName" 
                  rules={[
                    { required: true, message: 'Veuillez saisir votre nom' },
                    { min: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                  ]}
                >
                  <Input placeholder="Nom" maxLength={50} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="Prénom" 
                  name="firstName" 
                  rules={[
                    { required: true, message: 'Veuillez saisir votre prénom' },
                    { min: 2, message: 'Le prénom doit contenir au moins 2 caractères' }
                  ]}
                >
                  <Input placeholder="Prénom" maxLength={50} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item 
              label="Téléphone" 
              name="phone" 
              rules={[
                { required: true, message: 'Veuillez saisir votre numéro de téléphone' },
                { pattern: /^[0-9+\s()-]{8,15}$/, message: 'Format de téléphone invalide' }
              ]}
            >
              <Input placeholder="Téléphone" maxLength={15} />
            </Form.Item>
            
            <Form.Item 
              label="Email" 
              name="email" 
              rules={[
                { required: true, message: 'Veuillez saisir votre email' },
                { type: 'email', message: 'Format d\'email invalide' }
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            
            <Form.Item 
              label="Mot de passe" 
              name="password" 
              rules={[
                { required: true, message: 'Veuillez saisir un mot de passe' },
                { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
                { 
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, 
                  message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' 
                }
              ]}
              extra="Minimum 8 caractères, avec au moins une majuscule, une minuscule et un chiffre"
            >
              <Input.Password placeholder="Mot de passe" />
            </Form.Item>
            
            <Form.Item
              label="Confirmer mot de passe"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Veuillez confirmer votre mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  }
                })
              ]}
            >
              <Input.Password placeholder="Confirmer le mot de passe" />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 12 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting} 
                disabled={submitting}
                block
                size="large"
              >
                Créer mon compte
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center' }}>
              <Typography.Text>
                Vous avez déjà un compte? <Link to="/login">Se connecter</Link>
              </Typography.Text>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}


