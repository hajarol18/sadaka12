import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { UserRole, hasPermission } from '../utils/roles';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (userName: string, password: string) => Promise<void>;
  register: (payload: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'sadaka_web_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    
    // Décoder le token simple (userId:email ou admin:adminId:email)
    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      
      // Si c'est un token admin (format: admin:adminId:email)
      if (parts[0] === 'admin') {
        const adminId = parts[1];
        const email = parts[2] || parts[1];
        
        // Récupérer les infos admin
        api.get('/api/v1/admins')
          .then((res) => {
            const admins = Array.isArray(res.data) ? res.data : [];
            const foundAdmin = admins.find((a: any) => a.id?.toString() === adminId);
            
            if (foundAdmin) {
              setUser({
                id: foundAdmin.id?.toString() || adminId,
                firstName: foundAdmin.name || 'Admin',
                lastName: '',
                email: foundAdmin.mail || email,
                role: UserRole.ADMIN
              });
            } else {
              setUser({
                id: adminId,
                firstName: 'Admin',
                lastName: '',
                email: email,
                role: UserRole.ADMIN
              });
            }
          })
          .catch(() => {
            setUser({
              id: adminId,
              firstName: 'Admin',
              lastName: '',
              email: email,
              role: UserRole.ADMIN
            });
          });
        return;
      }
      
      // Token utilisateur normal (format: userId:email)
      const userId = parts[0];
      const email = parts[1];
      
      // Récupérer les infos utilisateur depuis le backend
      api
        .get('/api/v1/utilisateurs')
        .then((res) => {
          const users = Array.isArray(res.data) ? res.data : [];
          const foundUser = users.find((u: any) => 
            u.id?.toString() === userId || u.email === email
          );
          
          if (foundUser) {
            // Déterminer le rôle basé sur l'email
            let role: UserRole = UserRole.USER;
            const userEmail = foundUser.email || email;
            if (userEmail === 'admin@sadaka.ma') {
              role = UserRole.ADMIN;
            } else if (userEmail === 'moderator@sadaka.ma') {
              role = UserRole.MODERATOR;
            }
            
            setUser({
              id: foundUser.id?.toString() || userId,
              firstName: foundUser.prenom || foundUser.firstName || '',
              lastName: foundUser.nom || foundUser.lastName || '',
              email: userEmail,
              role: role
            });
          } else {
            // Utilisateur par défaut
            setUser({
              id: userId,
              firstName: '',
              lastName: '',
              email: email,
              role: UserRole.USER
            });
          }
        })
        .catch(() => {
          // En cas d'erreur, essayer de décoder le token pour avoir au moins l'email
          const decoded = atob(token);
          const [, email] = decoded.split(':');
          setUser({
            id: userId || '0',
            firstName: '',
            lastName: '',
            email: email || '',
            role: UserRole.USER
          });
        });
    } catch (e) {
      console.error('[AuthContext] Erreur décodage token:', e);
      setUser(null);
    }
  }, [token]);

  const loginAdmin = useCallback(async (userName: string, password: string) => {
    try {
      // Connexion admin via /api/v1/admin/connect
      const res = await api.get('/api/v1/admin/connect', {
        params: {
          userName: userName,
          passWord: password
        }
      });
      
      const adminId = res.data;
      
      if (!adminId || adminId === 0) {
        throw new Error('Nom d\'utilisateur ou mot de passe admin incorrect');
      }
      
      // Créer un token simple (base64 adminId:email avec préfixe "admin:")
      const simpleToken = btoa(`admin:${adminId}:${userName}`);
      setToken(simpleToken);
      
      // Récupérer les infos admin
      try {
        const adminsRes = await api.get('/api/v1/admins');
        const admins = Array.isArray(adminsRes.data) ? adminsRes.data : [];
        const foundAdmin = admins.find((a: any) => a.id === adminId || a.id?.toString() === adminId?.toString());
        
        if (foundAdmin) {
          setUser({
            id: foundAdmin.id?.toString() || adminId.toString(),
            firstName: foundAdmin.name || '',
            lastName: '',
            email: foundAdmin.mail || userName,
            role: UserRole.ADMIN
          });
        } else {
          setUser({
            id: adminId.toString(),
            firstName: 'Admin',
            lastName: '',
            email: userName,
            role: UserRole.ADMIN
          });
        }
      } catch (e) {
        console.error('[AuthContext] Erreur récupération admin:', e);
        setUser({
          id: adminId.toString(),
          firstName: 'Admin',
          lastName: '',
          email: userName,
          role: UserRole.ADMIN
        });
      }
    } catch (error: any) {
      console.error('Erreur de connexion admin:', error);
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        throw new Error('Backend non accessible. Veuillez démarrer le backend.');
      } else if (error?.response?.status === 404) {
        throw new Error('Endpoint de connexion admin non trouvé (404).');
      } else {
        throw new Error(error?.response?.data?.message || 'Échec de connexion admin. Vérifiez vos identifiants.');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Le backend utilise GET /api/v1/utilisateur/connect avec userName et passWord
      const res = await api.get('/api/v1/utilisateur/connect', {
        params: {
          userName: email, // Le backend accepte email comme userName
          passWord: password
        }
      });
      
      const userId = res.data;
      
      if (!userId || userId === 0) {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      // Créer un token simple (base64 userId:email)
      const simpleToken = btoa(`${userId}:${email}`);
      setToken(simpleToken);
      
      // Récupérer les infos utilisateur
      try {
        const usersRes = await api.get('/api/v1/utilisateurs');
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const foundUser = users.find((u: any) => u.id === userId || u.id?.toString() === userId?.toString());
        
        if (foundUser) {
          // Déterminer le rôle basé sur l'email
          let role: UserRole = UserRole.USER;
          const userEmail = foundUser.email || email;
          if (userEmail === 'admin@sadaka.ma') {
            role = UserRole.ADMIN;
          } else if (userEmail === 'moderator@sadaka.ma') {
            role = UserRole.MODERATOR;
          }
          
          setUser({
            id: foundUser.id?.toString() || userId.toString(),
            firstName: foundUser.prenom || foundUser.firstName || '',
            lastName: foundUser.nom || foundUser.lastName || '',
            email: userEmail,
            role: role
          });
        } else {
          // Utilisateur par défaut si non trouvé
          setUser({
            id: userId.toString(),
            firstName: '',
            lastName: '',
            email: email,
            role: UserRole.USER
          });
        }
      } catch (e) {
        console.error('[AuthContext] Erreur récupération utilisateur:', e);
        // Utilisateur par défaut
        setUser({
          id: userId.toString(),
          firstName: '',
          lastName: '',
          email: email,
          role: UserRole.USER
        });
      }
    } catch (error: any) {
      console.error('[AuthContext] Erreur login:', error);
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        throw new Error('Backend non accessible. Vérifiez que le serveur est démarré.');
      } else if (error?.response?.status === 404) {
        throw new Error('Endpoint de connexion non trouvé. Vérifiez la configuration du backend.');
      } else {
        throw new Error(error?.response?.data?.message || error?.message || 'Email ou mot de passe incorrect');
      }
    }
  }, []);

  const register = useCallback(
    async (payload: { firstName: string; lastName: string; phone: string; email: string; password: string }) => {
      try {
        // Le backend utilise POST /api/v1/utilisateur avec un body Utilisateur
        const res = await api.post('/api/v1/utilisateur', {
          nom: payload.lastName,
          prenom: payload.firstName,
          email: payload.email,
          userName: payload.email, // Utiliser email comme userName
          passWord: payload.password,
          telephone: payload.phone
        });
        
        if (res.data === true || res.status === 200) {
          // Créer un token simple après inscription
          const simpleToken = btoa(`0:${payload.email}`);
          setToken(simpleToken);
          
          // Se connecter automatiquement après inscription
          await login(payload.email, payload.password);
        } else {
          throw new Error('Échec de l\'inscription');
        }
      } catch (error: any) {
        console.error('[AuthContext] Erreur register:', error);
        if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
          throw new Error('Backend non accessible. Vérifiez que le serveur est démarré.');
        } else {
          throw new Error(error?.response?.data?.message || error?.message || 'Échec de l\'inscription');
        }
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      hasPermission: (permission: string) => user ? hasPermission(user.role, permission) : false,
      isAdmin: user?.role === UserRole.ADMIN,
      isModerator: user?.role === UserRole.MODERATOR,
      isUser: user?.role === UserRole.USER,
      login,
      loginAdmin,
      register,
      logout
    }),
    [user, token, login, loginAdmin, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


