// Définition des rôles et des permissions dans l'application SADAKA

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR'
}

// Définition des permissions pour chaque rôle
export const RolePermissions = {
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_announcements',
    'approve_announcements',
    'reject_announcements',
    'manage_newsletter',
    'view_statistics',
    'view_dashboard',
    'access_admin_panel'
  ],
  [UserRole.MODERATOR]: [
    'approve_announcements',
    'reject_announcements',
    'view_statistics',
    'view_dashboard'
  ],
  [UserRole.USER]: [
    'create_announcement',
    'delete_own_announcement',
    'express_interest',
    'view_announcements',
    'filter_announcements'
  ]
};

// Fonction pour vérifier si un utilisateur a une permission spécifique
export function hasPermission(userRole: UserRole | string, permission: string): boolean {
  if (!userRole || !permission) return false;
  
  const role = userRole as UserRole;
  return RolePermissions[role]?.includes(permission) || false;
}

// Fonction pour obtenir toutes les permissions d'un rôle
export function getRolePermissions(role: UserRole | string): string[] {
  if (!role) return [];
  return RolePermissions[role as UserRole] || [];
}

// Fonction pour vérifier si un utilisateur est administrateur
export function isAdmin(role: UserRole | string): boolean {
  return role === UserRole.ADMIN;
}

// Fonction pour vérifier si un utilisateur est modérateur
export function isModerator(role: UserRole | string): boolean {
  return role === UserRole.MODERATOR;
}

// Fonction pour vérifier si un utilisateur est un utilisateur standard
export function isUser(role: UserRole | string): boolean {
  return role === UserRole.USER;
}