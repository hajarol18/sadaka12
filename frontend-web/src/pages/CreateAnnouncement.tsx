import { Button, Card, Form, Input, InputNumber, Select, Upload, message, Spin, Typography, Modal, Radio } from 'antd';
import type { UploadFile } from 'antd/es/upload';
import { UploadOutlined, GiftOutlined, InfoCircleOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { createAnnonce } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { getCommunes } from '../services/communeService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import type { Category, Commune } from '../types/api';

const { Title, Text, Paragraph } = Typography;

const MAX_UPLOAD_SIZE_MB = 5; // Plus grand pour les photos d'annonces
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function CreateAnnouncement() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [photoInputType, setPhotoInputType] = useState<'url' | 'upload'>('url');

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
    console.log('[CreateAnnouncement] ========================================');
    console.log('[CreateAnnouncement] Début de la création d\'annonce');
    console.log('[CreateAnnouncement] Valeurs du formulaire:', values);
    
    if (!user?.id) {
      console.error('[CreateAnnouncement] ❌ Utilisateur non connecté');
      message.error('Vous devez être connecté');
      return;
    }

    try {
      setSubmitting(true);
      
      // Vérifier que tous les champs requis sont présents
      if (!values.titre) {
        console.error('[CreateAnnouncement] ❌ Titre manquant');
        message.error('Le titre est requis');
        return;
      }
      if (!values.categorie) {
        console.error('[CreateAnnouncement] ❌ Catégorie manquante');
        message.error('La catégorie est requise');
        return;
      }
      if (!values.commune) {
        console.error('[CreateAnnouncement] ❌ Commune manquante');
        message.error('La commune est requise');
        return;
      }
      if (!values.longitude || !values.latitude) {
        console.error('[CreateAnnouncement] ❌ Coordonnées manquantes:', {
          longitude: values.longitude,
          latitude: values.latitude
        });
        message.error('Les coordonnées GPS sont requises');
        return;
      }
      
      // Récupérer la commune sélectionnée
      const selectedCommune = communes.find(c => c.gid === values.commune);
      if (!selectedCommune) {
        console.error('[CreateAnnouncement] ❌ Commune invalide:', values.commune);
        console.error('[CreateAnnouncement] Communes disponibles:', communes.map(c => ({ gid: c.gid, nom: c.nomCommune })));
        message.error('Commune invalide. Veuillez sélectionner une commune dans la liste.');
        return;
      }

      // Créer l'annonce avec le backend réel
      const userId = parseInt(user.id) || 0;
      if (userId === 0) {
        console.error('[CreateAnnouncement] ❌ UserId invalide:', user.id);
        message.error('Erreur: utilisateur non identifié');
        return;
      }
      
      console.log('[CreateAnnouncement] ✅ Données validées:');
      console.log('  - userId:', userId);
      console.log('  - titre:', values.titre);
      console.log('  - categorie:', values.categorie);
      console.log('  - commune:', values.commune, '(', selectedCommune.nomCommune, ')');
      console.log('  - longitude:', values.longitude);
      console.log('  - latitude:', values.latitude);
      console.log('  - quatite:', values.quatite || 1);
      console.log('  - description:', values.description?.substring(0, 50) + '...');
      
      // Déterminer la photo (URL ou vide si upload)
      let photoUrl = '';
      if (photoInputType === 'url') {
        photoUrl = values.photo || '';
      }
      
      console.log('[CreateAnnouncement] Appel createAnnonce...');
      let result;
      try {
        result = await createAnnonce({
          coordinates: [values.longitude, values.latitude], // [longitude, latitude]
          titre: values.titre,
          desc: values.description || '',
          categorie: values.categorie,
          commune: values.commune,
          donnateur: userId,
          photo: photoUrl, // URL ou vide si upload direct
          quatite: values.quatite || 1
        });
        console.log('[CreateAnnouncement] ✅ Annonce créée, résultat:', result);
      } catch (error: any) {
        // Gérer les erreurs de cooldown (429)
        if (error?.status === 429 || error?.response?.status === 429) {
          const errorMessage = error?.message || error?.response?.data?.message || 'Vous êtes en cooldown. Réessayez plus tard.';
          message.error(errorMessage);
          setSubmitting(false);
          return;
        }
        // Relancer les autres erreurs
        throw error;
      }
      
      // Si une image a été uploadée, l'uploader séparément après création
      const imageFile = fileList[0]?.originFileObj as File | undefined;
      if (photoInputType === 'upload' && imageFile && result) {
        try {
          // Attendre plus longtemps pour que le backend finalise l'enregistrement
          console.log('[CreateAnnouncement] Attente de 1.5s avant récupération de l\'ID...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Le backend retourne 1 (boolean converti en int), pas l'ID
          // Il faut récupérer l'ID depuis la dernière annonce de l'utilisateur
          let annonceId: number | null = null;
          
          try {
            const { getAnnoncesByUser } = await import('../services/annonceService');
            console.log('[CreateAnnouncement] Récupération des annonces de l\'utilisateur pour trouver l\'ID...');
            const userAnnonces = await getAnnoncesByUser(userId);
            
            if (userAnnonces && userAnnonces.length > 0) {
              // Trier par ID décroissant pour obtenir la plus récente
              // Filtrer aussi par titre pour être sûr que c'est la bonne annonce
              const matchingAnnonces = userAnnonces.filter(a => 
                a.titre === values.titre && 
                a.categorie?.id === values.categorie
              );
              
              if (matchingAnnonces.length > 0) {
                // Prendre la plus récente parmi celles qui matchent
                const sorted = [...matchingAnnonces].sort((a, b) => (b.id || 0) - (a.id || 0));
                annonceId = sorted[0]?.id || null;
                console.log('[CreateAnnouncement] ✅ ID trouvé par matching:', annonceId);
              } else {
                // Si aucun match exact, prendre simplement la plus récente
                const sorted = [...userAnnonces].sort((a, b) => (b.id || 0) - (a.id || 0));
                annonceId = sorted[0]?.id || null;
                console.log('[CreateAnnouncement] ⚠️ Aucun match exact, utilisation de la plus récente:', annonceId);
              }
            } else {
              console.warn('[CreateAnnouncement] ⚠️ Aucune annonce trouvée pour l\'utilisateur après création');
            }
          } catch (e) {
            console.error('[CreateAnnouncement] ❌ Erreur lors de la récupération de l\'ID:', e);
          }
          
          if (annonceId && annonceId > 0) {
            console.log('[CreateAnnouncement] Tentative d\'upload de l\'image pour annonce ID:', annonceId);
            
            // Uploader l'image avec l'ID de l'annonce
            const formData = new FormData();
            formData.append('id', annonceId.toString());
            formData.append('file', imageFile);
            
            // Tester plusieurs endpoints possibles
            // Note: Le contrôleur a @RequestMapping("/api/v1/") donc l'endpoint est /api/v1/upload_annonce_image
            const endpointsToTry = [
              '/api/v1/upload_annonce_image', // Avec préfixe (probablement le bon)
              '/upload_annonce_image', // Direct (si le contrôleur n'a pas de préfixe)
              '/api/upload_annonce_image' // Alternatif
            ];
            
            let uploadSuccess = false;
            let lastError: any = null;
            
            for (const endpoint of endpointsToTry) {
              try {
                console.log(`[CreateAnnouncement] Essai endpoint: ${endpoint}`);
                console.log(`[CreateAnnouncement] ID annonce: ${annonceId}, Taille fichier: ${imageFile.size} bytes`);
                const response = await api.post(endpoint, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                });
                console.log(`[CreateAnnouncement] ✅ Réponse upload:`, response.data);
                console.log(`[CreateAnnouncement] ✅ Image uploadée avec succès via ${endpoint}`);
                uploadSuccess = true;
                message.success('Annonce et image créées avec succès !');
                break;
              } catch (uploadError: any) {
                console.error(`[CreateAnnouncement] ❌ Échec endpoint ${endpoint}:`, {
                  status: uploadError?.response?.status,
                  statusText: uploadError?.response?.statusText,
                  data: uploadError?.response?.data,
                  message: uploadError?.message,
                  code: uploadError?.code,
                  config: {
                    url: uploadError?.config?.url,
                    method: uploadError?.config?.method,
                    baseURL: uploadError?.config?.baseURL
                  }
                });
                lastError = uploadError;
                // Continuer avec le prochain endpoint
              }
            }
            
            if (!uploadSuccess) {
              console.error('[CreateAnnouncement] ❌ Tous les endpoints ont échoué. Dernière erreur:', lastError);
              message.warning('L\'annonce a été créée, mais l\'upload de l\'image a échoué. Vous pourrez l\'ajouter plus tard.');
            }
          } else {
            console.warn('[CreateAnnouncement] ⚠️ Impossible de déterminer l\'ID de l\'annonce pour l\'upload d\'image');
            message.warning('L\'annonce a été créée, mais l\'upload de l\'image n\'a pas pu être effectué (ID introuvable). Vous pourrez l\'ajouter plus tard.');
          }
        } catch (uploadError: any) {
          console.error('[CreateAnnouncement] ❌ Erreur globale lors de l\'upload de l\'image:', uploadError);
          message.warning('L\'annonce a été créée, mais l\'upload de l\'image a échoué. Vous pourrez l\'ajouter plus tard.');
        }
      } else {
        // Pas d'upload d'image, message de succès normal
        message.success('Annonce créée avec succès ! Elle sera validée par un administrateur.');
      }
      form.resetFields();
      setFileList([]);
      setPhotoInputType('url');
      
      // Attendre un peu pour que le backend finalise l'enregistrement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rediriger vers Mes annonces avec un paramètre pour forcer le rechargement
      navigate('/my-announcements', { 
        replace: true,
        state: { refresh: true, timestamp: Date.now() }
      });
    } catch (e: any) {
      console.error('[CreateAnnouncement] ❌ ERREUR lors de la création:', e);
      console.error('[CreateAnnouncement] Détails erreur:', {
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status,
        url: e?.config?.url
      });
      const errorMessage = e?.response?.data?.message || e?.message || 'Échec de création de l\'annonce';
      console.error('[CreateAnnouncement] Message d\'erreur:', errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
      console.log('[CreateAnnouncement] ========================================');
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
              rules={[
                { required: true, message: 'La quantité est requise' },
                { 
                  type: 'number', 
                  min: 1, 
                  message: 'La quantité doit être au moins 1' 
                },
                {
                  validator: (_, value) => {
                    if (!value || value <= 0) {
                      return Promise.reject(new Error('La quantité doit être supérieure à 0'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
              tooltip={{ title: 'Nombre d\'unités disponibles (minimum 1)', icon: <InfoCircleOutlined /> }}
            >
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="Ex: 10"
                size="large"
                parser={(value) => {
                  // Empêcher la saisie de 0
                  const parsed = parseInt(value?.replace(/\D/g, '') || '0', 10);
                  return parsed <= 0 ? 1 : parsed;
                }}
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
                      // Ajouter un petit décalage aléatoire pour éviter les coordonnées exactement identiques
                      // Si plusieurs annonces existent déjà pour cette commune, on décale légèrement
                      const randomOffset = (Math.random() - 0.5) * 0.001; // ~50 mètres max de décalage
                      const offsetLat = lat + randomOffset * 0.5;
                      const offsetLng = lng + randomOffset;
                      
                      // Vérifier que les coordonnées décalées sont toujours dans le Maroc
                      if (offsetLat >= 20 && offsetLat <= 36 && offsetLng >= -17 && offsetLng <= -1) {
                        form.setFieldsValue({
                          latitude: Number(offsetLat.toFixed(6)),
                          longitude: Number(offsetLng.toFixed(6))
                        });
                      } else {
                        // Si le décalage sort du Maroc, utiliser les coordonnées originales
                        form.setFieldsValue({
                          latitude: Number(lat.toFixed(6)),
                          longitude: Number(lng.toFixed(6))
                        });
                      }
                      
                      message.success(`Coordonnées GPS mises à jour pour ${selectedCommune.nomCommune} (avec petit décalage pour éviter la superposition)`);
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
              label={
                <Text strong>
                  Photo (optionnel)
                </Text>
              }
              tooltip={{ 
                title: 'Ajoutez une photo pour illustrer votre annonce. Vous pouvez utiliser une URL ou uploader directement une image.', 
                icon: <InfoCircleOutlined /> 
              }}
            >
              <Radio.Group 
                value={photoInputType} 
                onChange={(e) => {
                  setPhotoInputType(e.target.value);
                  if (e.target.value === 'url') {
                    setFileList([]);
                  } else {
                    form.setFieldsValue({ photo: '' });
                  }
                }}
                style={{ marginBottom: 12 }}
              >
                <Radio value="url">URL</Radio>
                <Radio value="upload">Upload direct</Radio>
              </Radio.Group>
              
              {photoInputType === 'url' ? (
                <Form.Item 
                  name="photo"
                  rules={[
                    {
                      type: 'url',
                      message: 'Veuillez entrer une URL valide (ex: https://exemple.com/image.jpg)'
                    }
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input 
                    placeholder="https://exemple.com/image.jpg" 
                    size="large"
                    addonBefore="URL"
                    allowClear
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="profileImage"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  style={{ marginBottom: 0 }}
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
              )}
            </Form.Item>
            
            <Paragraph type="secondary" style={{ marginTop: -8, marginBottom: 16 }}>
              <InfoCircleOutlined /> 
              {photoInputType === 'url' 
                ? ' Entrez l\'URL complète de l\'image hébergée en ligne (ex: https://exemple.com/image.jpg).'
                : ` Formats acceptés: PNG, JPG, JPEG. Taille maximale: ${MAX_UPLOAD_SIZE_MB}MB.`
              }
            </Paragraph>

            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={() => setPreviewOpen(false)}
            >
              <img alt="Prévisualisation" style={{ width: '100%' }} src={previewImage} />
            </Modal>

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
