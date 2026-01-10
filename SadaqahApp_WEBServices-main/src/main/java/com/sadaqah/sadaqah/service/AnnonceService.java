package com.sadaqah.sadaqah.service;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Categorie_Famille;
import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.model.Utilisateur;
import com.sadaqah.sadaqah.repo.IAnnonce;
import com.sadaqah.sadaqah.repo.IFamilleRepo;
import com.sadaqah.sadaqah.utils.Annonce_Fcategorie;
import com.sadaqah.sadaqah.utils.Annonce_Perso;

@Service
public class AnnonceService {
	@Autowired
	private IAnnonce annonceRepo; 
	@Autowired
	private IFamilleRepo Ifc;
	
	
	
	//toutes les annonces approuvées 
	public List<Annonce> findAnnonce() {
        return  annonceRepo.findAnnonces();
    }
	
	//toutes les annonces en cours de traitement  
		public List<Annonce> findAnnonces_en_cours_traitement() {
	        return  annonceRepo.findAnnonces_en_cours_traitement();
	    }
	
	//toutes les annonces (tous statuts) - vue admin
	public List<Annonce> findAllAnnonces() {
		return annonceRepo.findAll();
	}
	
	//toutes les annonces pour filtre
	public List<Annonce_Perso> findAnnoncesForFilter() {
		
		List<Annonce_Perso> listAnnonces=new ArrayList<Annonce_Perso>();
		List<Annonce> list=annonceRepo.findAnnonces();
		for(int i=0;i<list.size();i++) {
			//get gategorie globale
			Long id_famille=list.get(i).getCategorie().getFamille();
			Categorie_Famille famille=Ifc.getById(id_famille);
			
			Annonce_Perso annonce=new Annonce_Perso(list.get(i).getId(),list.get(i).getGeom().getX(),list.get(i).getGeom().getY(),
					list.get(i).getCommune().getNomCommune(),list.get(i).getCategorie().getName(),famille.getName());
			listAnnonces.add(annonce);
		}
		
	     
	     return listAnnonces;
	}
	
	//annonce by id
	public Optional<Annonce> findAnnonceById(Long id) {
	      return  annonceRepo.findById(id);
	}
	
	//Annonces par utilisateur
		public List<Annonce> findAnnoncesParUser(Long id) {
			
	        return  annonceRepo.findMesAnnonces(id);
	   
	    }
		
	//anonce within a commune
	public List<Annonce> findAnnonceWithinCommune(Long id) {
        return annonceRepo.findAnnoncesWithinCommune(id);
    }
	
	//anonce within a category
	public List<Annonce> findAnnonceWithinCategorie(Long id) {
	    return annonceRepo.findAnnoncesWithinCategorie(id);
	}
	

	//ajouter une nouvelle annonce service
	public boolean addAnnonce(List<Double> coordinates, String titre, String desc, Long categorie, Long commune,
			Long donnateur,String photo) {
		boolean result=true; 
		double userLongitude = coordinates.get(0);
        double userLatitude = coordinates.get(1);
        Long idMax=annonceRepo.maxID();
        if (idMax == null) {
        	idMax = 0L;
        }
        Calendar cal = Calendar.getInstance();
        Date date=cal.getTime();
        DateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
        String formattedDate=dateFormat.format(date);
        
        System.out.println("[AnnonceService] Création annonce:");
        System.out.println("  - idMax: " + idMax);
        System.out.println("  - Nouvel ID: " + (idMax + 1));
        System.out.println("  - titre: " + titre);
        System.out.println("  - desc: " + desc);
        System.out.println("  - categorie: " + categorie);
        System.out.println("  - commune: " + commune);
        System.out.println("  - donnateur: " + donnateur);
        System.out.println("  - longitude: " + userLongitude);
        System.out.println("  - latitude: " + userLatitude);
        System.out.println("  - photo: " + photo);
        
        try {
        	int insertResult = annonceRepo.addAnnonce(idMax+1,titre, desc,date, categorie,commune, donnateur,userLongitude,userLatitude,photo);
        	System.out.println("[AnnonceService] Résultat INSERT (rows affected): " + insertResult);
        	
        	if (insertResult > 0) {
        		// Vérifier que l'annonce a bien été créée
        		List<Annonce> annonces = annonceRepo.findMesAnnonces(donnateur);
        		System.out.println("[AnnonceService] Nombre d'annonces après création: " + annonces.size());
        		result = true;
        	} else {
        		System.err.println("[AnnonceService] ERREUR: Aucune ligne insérée (insertResult = 0)");
        		result = false;
        	}
        	
        	return result; 
        } catch(Exception e){
        	System.err.println("[AnnonceService] ERREUR lors de la création de l'annonce:");
        	e.printStackTrace();
        	result = false;
        	return result;
        	
        }
		
		
	}
	
	//modifier une annonce
	public boolean updateAnnonce(Long id,List<Double> coordinates, String titre, String desc, Long categorie, Long commune,
			String photo) {

		boolean result=true;
		double userLongitude = coordinates.get(0);
	    double userLatitude = coordinates.get(1);
	    Calendar cal = Calendar.getInstance();
	    Date date=cal.getTime();
	    DateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
	    String formattedDate=dateFormat.format(date);
	    try {
	    	annonceRepo.updateAnnonce(id,titre, desc,date, categorie,commune, userLongitude,userLatitude,photo);
        	return result; 
        } catch(Exception e){
        	
        	result = false;
        	return result;
        	
        }
	};
	
	//supprimer une annonce par user
	public void deleteAnnonce(Long id) {
	         annonceRepo.deleteAnnonce(id);
	};
	
	//approuver une annonce par admin
	public void approuverAnnonce(Long id) {
	        annonceRepo.approuverAnnonce(id);
	};
	
	//rejeter une annonce par admin
	public void rejeterAnnonce(Long id) {
		 annonceRepo.rejeterAnnonce(id);
	};
	
	//don deja attribué (masquer du file de publication)
	public void masquerAnnonce(Long id) {
			annonceRepo.masquerAnnonce(id);
	};
	  
		
		
	
	
	
	
	
	
	//******************///
	//annonces les plus proches d'un utilisateur
	//Annonces par utilisateur
	public List<Annonce> findAnnoncesNearUser(Double userLongitude, Double userLatitude) {
		 return  annonceRepo.findAnnoncesNearUser(userLongitude, userLatitude);
	}
	
	//annonces par date 
	public List annonces_par_date() {
		return annonceRepo.annoncesParDate();
	}
	
	//annonce par famille 
	public List<Annonce_Fcategorie> annonce_par_famille(){
		
		return annonceRepo.annonces_par_famille();
	}

	
		       
 
 }
	
	
			
	
	
	
	


