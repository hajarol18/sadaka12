package com.sadaqah.sadaqah.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Demande;
import com.sadaqah.sadaqah.repo.IDemande;
@Service
public class DemandeService {
	@Autowired
	private IDemande demandeRepo;
	
	//demandes par annonce
	public List<Demande>demandesParAnnonce(Long idAnnonce) {
		return demandeRepo.demandesParAnnone(idAnnonce);
	};
	
	//demandes par utilisateur 
	public List<Demande>demandesParUser(Long idUser) {
		return demandeRepo.demandesParUser(idUser);
	};
	
	
	//demandes findAll
	public List<Demande>findAll() {
		return demandeRepo.findAll();
	};
		

	
	//ajouter une demande 
		public boolean save_annonce(Long annonce, Long demandeur) {
			boolean result=true;
			try {
				demandeRepo.savea(annonce, demandeur);
	        	return result; 
	        } catch(Exception e){
	        	
	        	result = false;
	        	return result;
	        	
	        }
			  
		};
	
	//supprimer une demande 
	public void delete(Long id) {
			 demandeRepo.deleteById(id);
	};
	
	
//	//ajouter une demande 
//	public Demande save(Demande demande) {
//		 return demandeRepo.save(demande);
//	};

}
