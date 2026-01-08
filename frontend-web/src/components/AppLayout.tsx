import { Avatar, Dropdown, Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HomeOutlined, GlobalOutlined, BarChartOutlined, SettingOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../utils/roles';

const { Header, Content, Footer } = Layout;

const baseItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">Accueil</Link> },
  { key: '/announcements', icon: <GlobalOutlined />, label: <Link to="/announcements">Annonces</Link> },
  { key: '/map', icon: <GlobalOutlined />, label: <Link to="/map">Carte</Link> },
  { key: '/dashboard', icon: <BarChartOutlined />, label: <Link to="/dashboard">Dashboard</Link> }
];

export default function AppLayout() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const navItems = [
    ...baseItems,
    ...(isAuthenticated ? [{ key: '/my-announcements', icon: <SettingOutlined />, label: <Link to="/my-announcements">Mes annonces</Link> }] : []),
    ...(isAuthenticated ? [{ key: '/create-announcement', icon: <SettingOutlined />, label: <Link to="/create-announcement">Créer</Link> }] : []),
    ...(user?.role === UserRole.ADMIN ? [{ key: '/admin', icon: <SettingOutlined />, label: <Link to="/admin">Admin</Link> }] : [])
  ];
  const selectedKey = navItems.find(i => location.pathname === i.key)?.key ?? '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>SADAKA</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navItems}
          style={{ flex: 1 }}
        />
        {isAuthenticated ? (
          <Dropdown
            menu={{
              items: [
                { key: 'email', label: user?.email, disabled: true },
                { type: 'divider' as any },
                { key: 'logout', label: 'Se déconnecter', onClick: logout }
              ] as any
            }}
          >
            <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size={28} icon={<UserOutlined />} />
              <span>{user?.firstName}</span>
            </div>
          </Dropdown>
        ) : (
          <Link to="/login" style={{ color: '#fff' }}>
            <LoginOutlined /> Connexion
          </Link>
        )}
      </Header>
      <Content style={{ height: '100%' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>SADAKA © {new Date().getFullYear()}</Footer>
    </Layout>
  );
}
