import { Card, Col, Row, Statistic, Typography, Button, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { HeartOutlined, GlobalOutlined, BarChartOutlined, GiftOutlined, TeamOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero Section - Sans le grand titre SADAKA */}
      <div style={{ textAlign: 'center', marginBottom: 64, padding: '40px 20px' }}>
        <Title level={1} style={{ color: '#52c41a', fontSize: 48, marginBottom: 24 }}>
          Plateforme de Gestion des Dons
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#666', maxWidth: 800, margin: '0 auto', lineHeight: 1.8 }}>
          <strong>SADAKA</strong> est une application collaborative qui connecte les généreux donateurs
          avec ceux qui en ont besoin. Grâce à la géolocalisation, trouvez facilement les dons disponibles
          près de chez vous ou publiez vos propres annonces de don.
        </Paragraph>
      </div>

      {/* Section : À qui s'adresse cette application */}
      <Card style={{ marginBottom: 32 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          À qui s'adresse cette application ?
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
              <Title level={4}>Pour les Donateurs</Title>
              <Paragraph>
                Vous avez des objets, vêtements, nourriture ou autres biens à donner ?
                Publiez une annonce et mettez-vous en relation avec ceux qui en ont besoin.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
              <Title level={4}>Pour les Bénéficiaires</Title>
              <Paragraph>
                Vous recherchez des dons ? Parcourez les annonces disponibles près de chez vous
                et contactez directement les donateurs.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
              <Title level={4}>Pour les Associations</Title>
              <Paragraph>
                Organisations caritatives, vous pouvez utiliser cette plateforme pour
                gérer vos dons et aider votre communauté de manière efficace.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Section : Comment ça fonctionne */}
      <Card style={{ marginBottom: 32 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Comment ça fonctionne ?
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32,
                color: 'white',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <Title level={4}>Créez une annonce</Title>
              <Paragraph>
                Déposez une annonce de don avec les détails de ce que vous souhaitez donner.
                Indiquez la catégorie, la quantité et votre localisation.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32,
                color: 'white',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <Title level={4}>Validation</Title>
              <Paragraph>
                Notre équipe vérifie et valide votre annonce pour garantir la qualité
                et la sécurité des transactions.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32,
                color: 'white',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <Title level={4}>Mise en relation</Title>
              <Paragraph>
                Les personnes intéressées peuvent vous contacter et récupérer le don.
                Vous gérez les demandes directement depuis votre espace.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32,
                color: 'white',
                fontWeight: 'bold'
              }}>
                4
              </div>
              <Title level={4}>Don effectué</Title>
              <Paragraph>
                Une fois le don récupéré, vous pouvez marquer l'annonce comme complétée.
                Vous avez fait une différence dans votre communauté !
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dons Actifs"
              value={15}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Communes Couvertes"
              value={88}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Familles Aidées"
              value={128}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Catégories"
              value={9}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Actions principales - BOUTONS TRÈS VISIBLES */}
      <Card 
        style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={2} style={{ marginBottom: 32 }}>
            Prêt à commencer ?
          </Title>
          <Space size="large" wrap style={{ justifyContent: 'center' }}>
            <Link to="/announcements">
              <Button 
                type="primary" 
                size="large" 
                icon={<GlobalOutlined />}
                style={{ 
                  minWidth: 220, 
                  height: 60, 
                  fontSize: 18,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                }}
              >
                Voir les annonces
              </Button>
            </Link>
            <Link to="/create-announcement">
              <Button 
                type="default"
                size="large" 
                icon={<GiftOutlined />}
                style={{ 
                  minWidth: 220, 
                  height: 60, 
                  fontSize: 18,
                  fontWeight: 'bold',
                  background: '#fff',
                  border: '2px solid #52c41a',
                  color: '#52c41a',
                  boxShadow: '0 4px 12px rgba(82, 196, 26, 0.2)'
                }}
              >
                Publier une annonce
              </Button>
            </Link>
            <Link to="/map">
              <Button 
                size="large" 
                icon={<GlobalOutlined />}
                style={{ 
                  minWidth: 220, 
                  height: 60, 
                  fontSize: 18,
                  fontWeight: 'bold'
                }}
              >
                Voir sur la carte
              </Button>
            </Link>
          </Space>
        </div>
      </Card>

      {/* Section Avantages */}
      <Card style={{ marginTop: 32 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          Pourquoi choisir SADAKA ?
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', gap: 16 }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Title level={4}>Gratuit et Accessible</Title>
                <Paragraph>
                  La plateforme est entièrement gratuite pour tous les utilisateurs.
                  Aucun frais caché, aucune commission.
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', gap: 16 }}>
              <SafetyOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Title level={4}>Sécurisé et Validé</Title>
                <Paragraph>
                  Toutes les annonces sont vérifiées par notre équipe avant publication
                  pour garantir la qualité et la sécurité.
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', gap: 16 }}>
              <GlobalOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Title level={4}>Géolocalisation</Title>
                <Paragraph>
                  Trouvez les dons disponibles près de chez vous grâce à notre système
                  de géolocalisation SIG (Système d'Information Géographique).
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', gap: 16 }}>
              <TeamOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Title level={4}>Communauté Solidaire</Title>
                <Paragraph>
                  Rejoignez une communauté de personnes généreuses qui souhaitent
                  faire une différence positive dans leur environnement.
                </Paragraph>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
