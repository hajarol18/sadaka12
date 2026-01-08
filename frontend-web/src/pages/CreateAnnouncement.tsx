import { Button, Card, Form, Input, InputNumber, Select, Upload, message, Spin, Typography } from 'antd';
import { UploadOutlined, GiftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { createAnnonce } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { getCommunes } from '../services/communeService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Category, Commune } from '../types/api';

const { Title, Text, Paragraph } = Typography;

export default function CreateAnnouncement() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Charger les catégories et communes depuis le backend
  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('Vous devez être connecté pour créer une annonce');
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, comms] = await Promise.allSettled([
          getCategories().catch(() => []),
          getCommunes().catch(() => [])
        ]);
        
        const catsData = cats.status === 'fulfilled' ? cats.value : [];
        const commsData = comms.status === 'fulfilled' ? comms.value : [];
        
        setCategories(Array.isArray(catsData) ? catsData : []);
        setCommunes(Array.isArray(commsData) ? commsData : []);
      } catch (error: any) {
        console.error('[CreateAnnouncement] Erreur:', error);
        message.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: any) => {
    if (!user?.id) {
      message.error('Vous devez être connecté');
      return;
    }

    try {
      setSubmitting(true);
      
      // Récupérer la commune sélectionnée
      const selectedCommune = communes.find(c => c.gid === values.commune);
      if (!selectedCommune) {
        message.error('Commune invalide');
        return;
      }

      // Créer l'annonce avec le backend réel
      const userId = parseInt(user.id) || 0;
      if (userId === 0) {
        message.error('Erreur: utilisateur non identifié');
        return;
      }
      
      await createAnnonce({
        coordinates: [values.longitude, values.latitude], // [longitude, latitude]
        titre: values.titre,
        desc: values.description || '',
        categorie: values.categorie,
        commune: values.commune,
        donnateur: userId,
        photo: values.photo || '',
        quatite: values.quatite || 1
      });
      
      message.success('Annonce créée avec succès ! Elle sera validée par un administrateur.');
      form.resetFields();
      navigate('/my-announcements');
    } catch (e: any) {
      console.error('[CreateAnnouncement] Erreur:', e);
      message.error(e?.response?.data?.message || e?.message || 'Échec de création de l\'annonce');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GiftOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <Title level={2} style={{ margin: 0 }}>Créer une annonce de don</Title>
          </div>
        }
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#999' }}>Chargement des données...</div>
          </div>
        ) : (
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            style={{ maxWidth: 900 }}
          >
            <Form.Item 
              label={
                <Text strong>
                  Titre de l'annonce <span style={{ color: 'red' }}>*</span>
                </Text>
              } 
              name="titre" 
              rules={[{ required: true, message: 'Le titre est requis' }]}
              tooltip={{ title: 'Donnez un titre clair et descriptif à votre annonce', icon: <InfoCircleOutlined /> }}
            >
              <Input placeholder="Ex: Vêtements pour enfants" size="large" />
            </Form.Item>

            <Form.Item 
              label={
                <Text strong>
                  Catégorie <span style={{ color: 'red' }}>*</span>
                </Text>
              } 
              name="categorie" 
              rules={[{ required: true, message: 'La catégorie est requise' }]}
            >
              <Select
                size="large"
                placeholder="Sélectionnez une catégorie"
                loading={loading}
                options={categories.map((cat) => ({
                  label: cat.nom,
                  value: cat.id,
                }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  categories.length === 0 ? (
                    <div style={{ padding: '8px 0', textAlign: 'center', color: '#ff4d4f' }}>
                      Aucune catégorie disponible
                    </div>
                  ) : null
                }
              />
            </Form.Item>

            <Form.Item 
              label={
                <Text strong>
                  Description <span style={{ color: 'red' }}>*</span>
                </Text>
              } 
              name="description"
              rules={[
                { required: true, message: 'La description est requise' },
                { min: 20, message: 'La description doit contenir au moins 20 caractères' }
              ]}
              tooltip={{ title: 'Décrivez en détail ce que vous souhaitez donner', icon: <InfoCircleOutlined /> }}
            >
              <Input.TextArea 
                rows={6} 
                placeholder="Décrivez votre don en détail..."
                showCount
                maxLength={1000}
                size="large"
              />
            </Form.Item>

            <Form.Item 
              label={
                <Text strong>
                  Quantité <span style={{ color: 'red' }}>*</span>
                </Text>
              } 
              name="quatite" 
              rules={[{ required: true, message: 'La quantité est requise' }]}
              tooltip={{ title: 'Nombre d\'unités disponibles', icon: <InfoCircleOutlined /> }}
            >
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="Ex: 10"
                size="large"
              />
            </Form.Item>

            <Form.Item 
              label={
                <Text strong>
                  Commune <span style={{ color: 'red' }}>*</span>
                </Text>
              } 
              name="commune" 
              rules={[{ required: true, message: 'La commune est requise' }]}
            >
              <Select
                size="large"
                placeholder="Sélectionnez une commune"
                loading={loading}
                options={communes.map((comm) => ({
                  label: comm.nomCommune,
                  value: comm.gid,
                }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  communes.length === 0 ? (
                    <div style={{ padding: '8px 0', textAlign: 'center', color: '#ff4d4f' }}>
                      Aucune commune disponible
                    </div>
                  ) : null
                }
                onChange={(communeId) => {
                  // Trouver la commune sélectionnée
                  const selectedCommune = communes.find(c => c.gid === communeId);
                  if (selectedCommune) {
                    let lat = 0;
                    let lng = 0;
                    let coordsValid = false;
                    
                    // Essayer d'extraire les coordonnées depuis la géométrie
                    if (selectedCommune.geom) {
                      // Si la géométrie est un Point avec coordinates [lng, lat] en WGS84
                      if (selectedCommune.geom.coordinates && Array.isArray(selectedCommune.geom.coordinates)) {
                        const coords = selectedCommune.geom.coordinates;
                        if (coords.length >= 2) {
                          lng = coords[0]; // Longitude
                          lat = coords[1]; // Latitude
                          
                          // Vérifier si les coordonnées sont en degrés (WGS84) ou en mètres (projeté)
                          // WGS84 pour le Maroc: lat entre 20-36, lng entre -17 et -1
                          if (lat >= 20 && lat <= 36 && lng >= -17 && lng <= -1) {
                            coordsValid = true;
                          } else {
                            // Coordonnées invalides (probablement en mètres projetés)
                            console.warn('[CreateAnnouncement] Coordonnées projetées détectées:', { lat, lng });
                            lat = 0;
                            lng = 0;
                          }
                        }
                      }
                      
                      // Si c'est un objet avec x et y
                      if (!coordsValid && (selectedCommune.geom as any).x !== undefined && (selectedCommune.geom as any).y !== undefined) {
                        const x = (selectedCommune.geom as any).x;
                        const y = (selectedCommune.geom as any).y;
                        
                        // Vérifier si c'est en degrés (WGS84) ou en mètres (projeté)
                        if (y >= 20 && y <= 36 && x >= -17 && x <= -1) {
                          // C'est en WGS84 (degrés)
                          lng = x;
                          lat = y;
                          coordsValid = true;
                        } else {
                          // C'est probablement en mètres (système projeté)
                          // On ne peut pas convertir sans connaître le SRID exact
                          console.warn('[CreateAnnouncement] Coordonnées projetées détectées (x/y):', { x, y });
                        }
                      }
                    }
                    
                    // Si on n'a pas de coordonnées valides, utiliser des coordonnées par défaut
                    if (!coordsValid) {
                      // Coordonnées approximatives du centre du Maroc (en degrés WGS84)
                      lat = 28.5;
                      lng = -8.0;
                      form.setFieldsValue({
                        latitude: lat,
                        longitude: lng
                      });
                      message.warning(
                        `Coordonnées par défaut utilisées pour ${selectedCommune.nomCommune}. ` +
                        `Les coordonnées de la géométrie semblent être dans un système projeté. ` +
                        `Veuillez les ajuster manuellement avec des coordonnées GPS (degrés).`
                      );
                    } else {
                      // Coordonnées valides en WGS84
                      form.setFieldsValue({
                        latitude: lat,
                        longitude: lng
                      });
                      message.success(`Coordonnées GPS mises à jour pour ${selectedCommune.nomCommune}`);
                    }
                  }
                }}
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item 
                label={<Text strong>Latitude <span style={{ color: 'red' }}>*</span></Text>} 
                name="latitude" 
                rules={[
                  { required: true, message: 'La latitude est requise' },
                  { type: 'number', min: 20, max: 36, message: 'Latitude invalide pour le Maroc' }
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Ex: 33.5731"
                  step={0.0001}
                  size="large"
                />
              </Form.Item>
              <Form.Item 
                label={<Text strong>Longitude <span style={{ color: 'red' }}>*</span></Text>} 
                name="longitude" 
                rules={[
                  { required: true, message: 'La longitude est requise' },
                  { type: 'number', min: -17, max: -1, message: 'Longitude invalide pour le Maroc' }
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Ex: -7.5898"
                  step={0.0001}
                  size="large"
                />
              </Form.Item>
            </div>

            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              <InfoCircleOutlined /> Les coordonnées GPS se remplissent automatiquement quand vous sélectionnez une commune.
              Vous pouvez aussi les ajuster manuellement si nécessaire.
            </Paragraph>

            <Form.Item 
              label={<Text strong>Photo (optionnel)</Text>} 
              name="photo"
              tooltip={{ 
                title: 'Entrez l\'URL complète de l\'image (ex: https://exemple.com/image.jpg). Vous pouvez aussi laisser vide et ajouter une photo plus tard.', 
                icon: <InfoCircleOutlined /> 
              }}
            >
              <Input 
                placeholder="https://exemple.com/image.jpg" 
                size="large"
                addonBefore="URL"
              />
            </Form.Item>
            <Paragraph type="secondary" style={{ marginTop: -16, marginBottom: 16 }}>
              <InfoCircleOutlined /> <strong>Note :</strong> Pour l'instant, entrez l'URL complète de l'image hébergée en ligne. 
              Le téléchargement direct de fichiers sera disponible prochainement.
            </Paragraph>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting} 
                disabled={submitting}
                size="large"
                icon={<GiftOutlined />}
                style={{ 
                  width: '100%', 
                  height: 50, 
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                {submitting ? 'Publication en cours...' : 'Publier l\'annonce'}
              </Button>
            </Form.Item>

            <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 16 }}>
              Votre annonce sera soumise à validation par un administrateur avant publication.
            </Paragraph>
          </Form>
        )}
      </Card>
    </div>
  );
}
