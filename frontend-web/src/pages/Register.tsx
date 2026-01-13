import { Button, Form, Input, Typography, message, Row, Col, Card, Alert, Space, Upload, Modal } from 'antd';
import type { UploadFile } from 'antd/es/upload';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MAX_UPLOAD_SIZE_MB = 2;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as Blob);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || 'Aperçu de l\'image');
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);
    if (!isAllowedType) {
      message.error('Format non autorisé! Formats acceptés: PNG, JPG, JPEG.');
      return false;
    }
    const isUnderLimit = file.size / 1024 / 1024 < MAX_UPLOAD_SIZE_MB;
    if (!isUnderLimit) {
      message.error(`L'image doit faire moins de ${MAX_UPLOAD_SIZE_MB}MB.`);
      return false;
    }
    return false; // Empêcher l'upload automatique, on gère l'upload manuellement
  };

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const imageFile = fileList[0]?.originFileObj as File | undefined;
      
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        email: values.email,
        password: values.password,
        imageFile: imageFile || null
      });
      
      message.success('Inscription réussie! Vous allez être redirigé vers la page d\'accueil.');
      form.resetFields();
      setFileList([]);
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
                { pattern: /^0\d{9}$/, message: 'Le numéro doit être au format marocain (ex: 0612345678)' }
              ]}
              extra="Format: 0XXXXXXXXX (10 chiffres, commence par 0)"
            >
              <Input placeholder="0612345678" maxLength={10} />
            </Form.Item>
            
            <Form.Item 
              label="Email" 
              name="email" 
              rules={[
                { required: true, message: 'Veuillez saisir votre email' },
                { type: 'email', message: 'Format d\'email invalide' }
              ]}
            >
              <Input placeholder="exemple@email.com" />
            </Form.Item>

            <Form.Item
              label="Confirmer l'email"
              name="confirmEmail"
              dependencies={['email']}
              rules={[
                { required: true, message: 'Veuillez confirmer votre email' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('email') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les emails ne correspondent pas'));
                  }
                })
              ]}
            >
              <Input placeholder="Confirmer votre email" />
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
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  }
                })
              ]}
            >
              <Input.Password placeholder="Confirmer le mot de passe" />
            </Form.Item>

            <Form.Item
              label="Photo de profil (optionnel)"
              name="profileImage"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              extra="Formats acceptés: PNG, JPG, JPEG. Taille maximale: 2MB"
            >
              <Upload
                listType="picture-card"
                accept=".png,.jpg,.jpeg"
                fileList={fileList}
                maxCount={1}
                onPreview={handlePreview}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Ajouter une photo</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={() => setPreviewOpen(false)}
            >
              <img alt="Prévisualisation" style={{ width: '100%' }} src={previewImage} />
            </Modal>
            
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


