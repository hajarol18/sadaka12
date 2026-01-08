package com.sadaqah.sadaqah.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.repo.IUtilisateur;
import com.sadaqah.sadaqah.model.Utilisateur;

@Service
public class UtilisateurService {
	
	@Autowired
	private IUtilisateur utilisateurRepo; 
	
	public List<Utilisateur> getUtilisateurs(){
		
		return utilisateurRepo.findAll();
		
	}
	
	public boolean addUtilisateur(Utilisateur utilisateur) {
		boolean result=true;
		try {
			utilisateurRepo.save(utilisateur);
			
		}
		catch(Exception e) {
			result =false;
		}
		
		return result; 	
	}
	
	public Long connect(String userName, String passWord) {
		Long result = (long) 0;
		try {
			List<Utilisateur> utilisateurs = utilisateurRepo.findAll(); 
			
			for (int i = 0; i < utilisateurs.size(); i++) {
				Utilisateur u = utilisateurs.get(i);
				
				// Vérifier que userName et passWord ne sont pas null
				if (u.getUserName() != null && u.getPassWord() != null) {
					// Vérifier userName ET passWord
					if (u.getUserName().equals(userName) && u.getPassWord().equals(passWord)) {
						result = u.getId();
						break; // Sortir de la boucle dès qu'on trouve
					}
				}
				// Si userName est null mais email existe, utiliser email comme userName
				else if (u.getEmail() != null && u.getPassWord() != null) {
					if (u.getEmail().equals(userName) && u.getPassWord().equals(passWord)) {
						result = u.getId();
						break;
					}
				}
			}
			
		} catch (Exception e) {
			System.err.println("Erreur lors de la connexion: " + e.getMessage());
			e.printStackTrace();
		}
		
		return result;
	}
	
	

}
