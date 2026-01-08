package com.sadaqah.sadaqah.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Admin;
import com.sadaqah.sadaqah.repo.IAdmin;

@Service
public class AdminService {
	
	@Autowired
	private IAdmin adminRepo; 
	
	public List<Admin> getAdmins(){
		return adminRepo.findAll();
	}
	
	/**
	 * Connexion admin
	 * @param userName nom d'utilisateur ou email
	 * @param passWord mot de passe
	 * @return ID de l'admin si connexion réussie, 0 sinon
	 */
	public Long connect(String userName, String passWord) {
		Long result = 0L;
		System.out.println("[AdminService] Tentative de connexion admin:");
		System.out.println("  - userName: " + userName);
		System.out.println("  - passWord: " + (passWord != null ? "***" : "null"));
		
		try {
			List<Admin> admins = adminRepo.findAll();
			System.out.println("[AdminService] Nombre d'admins trouvés: " + admins.size());
			
			for (Admin admin : admins) {
				System.out.println("[AdminService] Vérification admin:");
				System.out.println("  - ID: " + admin.getId());
				System.out.println("  - userName: " + admin.getUserName());
				System.out.println("  - mail: " + admin.getMail());
				System.out.println("  - passWord: " + (admin.getPassWord() != null ? "***" : "null"));
				
				// Vérifier userName ET passWord
				if (admin.getUserName() != null && admin.getPassWord() != null) {
					if (admin.getUserName().equals(userName) && admin.getPassWord().equals(passWord)) {
						result = admin.getId();
						System.out.println("[AdminService] ✅ Connexion admin réussie (par userName): " + admin.getMail() + " (ID: " + result + ")");
						break;
					}
				}
				// Si userName est null mais mail existe, utiliser mail comme userName
				if (admin.getMail() != null && admin.getPassWord() != null) {
					if (admin.getMail().equals(userName) && admin.getPassWord().equals(passWord)) {
						result = admin.getId();
						System.out.println("[AdminService] ✅ Connexion admin réussie (par email): " + admin.getMail() + " (ID: " + result + ")");
						break;
					}
				}
			}
			
			if (result == 0L) {
				System.out.println("[AdminService] ❌ Connexion admin échouée pour: " + userName);
				System.out.println("[AdminService] Aucun admin trouvé avec ces identifiants");
			}
		} catch (Exception e) {
			System.err.println("[AdminService] ❌ ERREUR lors de la connexion admin: " + e.getMessage());
			e.printStackTrace();
		}
		
		return result;
	}

}
