package com.sadaqah.sadaqah.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;
import org.locationtech.jts.geom.Point;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
	private static final int COOLDOWN_HOURS = 24;
	
	@Autowired
	private IAnnonce annonceRepo; 
	@Autowired
	private IFamilleRepo Ifc;
	
	//upload image annonce
	public boolean pictureupload(long id, MultipartFile file) {
		try {
			System.out.println("========================================");
			System.out.println("[AnnonceService] Upload image annonce");
			System.out.println("========================================");
			System.out.println("[AnnonceService] ID annonce: " + id);
			
			if (file == null) {
				System.err.println("[AnnonceService] ERREUR: MultipartFile est null");
				return false;
			}
			
			System.out.println("[AnnonceService] Nom fichier: " + file.getOriginalFilename());
			System.out.println("[AnnonceService] Taille: " + file.getSize() + " bytes");
			System.out.println("[AnnonceService] Content-Type: " + file.getContentType());
			System.out.println("[AnnonceService] Vide: " + file.isEmpty());
			
			if (file.isEmpty()) {
				System.err.println("[AnnonceService] ERREUR: Fichier vide");
				return false;
			}
			
			if (file.getOriginalFilename() == null || file.getOriginalFilename().isEmpty()) {
				System.err.println("[AnnonceService] ERREUR: Nom de fichier vide");
				return false;
			}
			
			// Extraire l'extension du fichier
			String originalFilename = file.getOriginalFilename();
			int lastDotIndex = originalFilename.lastIndexOf(".");
			if (lastDotIndex == -1 || lastDotIndex == originalFilename.length() - 1) {
				System.err.println("[AnnonceService] ERREUR: Extension non trouvée dans le nom de fichier");
				return false;
			}
			
			String extension = originalFilename.substring(lastDotIndex + 1);
			System.out.println("[AnnonceService] Extension détectée: " + extension);
			
			// Créer le chemin du fichier
			String fileName = id + "." + extension;
			Path targetDir = Paths.get("images_annonce");
			Path downloadedFile = targetDir.resolve(fileName);
			
			System.out.println("[AnnonceService] Répertoire cible: " + targetDir.toAbsolutePath());
			System.out.println("[AnnonceService] Fichier cible: " + downloadedFile.toAbsolutePath());
			
			// Créer le répertoire s'il n'existe pas
			try {
				Files.createDirectories(targetDir);
				System.out.println("[AnnonceService] ✅ Répertoire créé/vérifié: " + targetDir.toAbsolutePath());
			} catch (IOException e) {
				System.err.println("[AnnonceService] ERREUR création répertoire: " + e.getMessage());
				e.printStackTrace();
				return false;
			}
			
			// Supprimer l'ancien fichier s'il existe
			try {
				boolean deleted = Files.deleteIfExists(downloadedFile);
				if (deleted) {
					System.out.println("[AnnonceService] Ancien fichier supprimé: " + downloadedFile);
				}
			} catch (IOException e) {
				System.err.println("[AnnonceService] ⚠️ Impossible de supprimer l'ancien fichier: " + e.getMessage());
			}
			
			// Copier le nouveau fichier
			try {
				Files.copy(file.getInputStream(), downloadedFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
				System.out.println("[AnnonceService] ✅ Image uploadée avec succès: " + downloadedFile.toAbsolutePath());
				
				// Vérifier que le fichier existe vraiment
				if (Files.exists(downloadedFile)) {
					long fileSize = Files.size(downloadedFile);
					System.out.println("[AnnonceService] ✅ Fichier vérifié - Taille: " + fileSize + " bytes");
					
					// Mettre à jour le champ photo dans la base de données avec l'URL de l'endpoint
					String photoUrl = "/api/v1/annonce/" + id + "/image";
					int updateResult = annonceRepo.updateAnnoncePhoto(id, photoUrl);
					if (updateResult > 0) {
						System.out.println("[AnnonceService] ✅ Champ photo mis à jour dans la base: " + photoUrl);
					} else {
						System.err.println("[AnnonceService] ⚠️ Aucune ligne mise à jour pour le champ photo (ID: " + id + ")");
					}
				} else {
					System.err.println("[AnnonceService] ⚠️ Fichier créé mais non trouvé après écriture!");
				}
				
				return true;
			} catch (IOException e) {
				System.err.println("[AnnonceService] ERREUR copie fichier: " + e.getMessage());
				e.printStackTrace();
				return false;
			}
			
		} catch (Exception e) {
			LoggerFactory.getLogger(this.getClass()).error("[AnnonceService] ERREUR upload image annonce (générale)", e);
			System.err.println("[AnnonceService] ERREUR upload image (générale): " + e.getMessage());
			e.printStackTrace();
			return false;
		}
	}
	
	// Récupérer le chemin de l'image d'une annonce
	public Path getAnnonceImagePath(Long id) {
		try {
			Path targetDir = Paths.get("images_annonce");
			// Chercher les extensions possibles
			String[] extensions = {"jpg", "jpeg", "png", "gif"};
			for (String ext : extensions) {
				Path imagePath = targetDir.resolve(id + "." + ext);
				if (Files.exists(imagePath)) {
					return imagePath;
				}
			}
			return null;
		} catch (Exception e) {
			System.err.println("[AnnonceService] ERREUR récupération chemin image: " + e.getMessage());
			return null;
		}
	}
	
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
	

	// Valider le cooldown pour la création d'annonces
	private void validateAnnonceCooldown(Long donnateur) {
		Date lastAnnonceDate = annonceRepo.findLastAnnonceDateByDonnateur(donnateur);
		if (lastAnnonceDate == null) {
			return;
		}
		Instant lastInstant = lastAnnonceDate.toInstant();
		Instant now = Instant.now();
		Duration sinceLast = Duration.between(lastInstant, now);
		if (sinceLast.toHours() < COOLDOWN_HOURS) {
			Duration remaining = Duration.ofHours(COOLDOWN_HOURS).minus(sinceLast);
			long hours = remaining.toHours();
			long minutes = remaining.minusHours(hours).toMinutes();
			String message = String.format(
				"Vous êtes en cooldown: une annonce par jour. Réessayez dans %dh%02dm.",
				hours,
				minutes
			);
			throw new IllegalStateException(message);
		}
	}
	
	//ajouter une nouvelle annonce service
	public boolean addAnnonce(List<Double> coordinates, String titre, String desc, Long categorie, Long commune,
			Long donnateur,String photo, Long quatite) {
		// Valider le cooldown avant de créer l'annonce
		validateAnnonceCooldown(donnateur);
		
		boolean result=true; 
		double userLongitude = coordinates.get(0);
        double userLatitude = coordinates.get(1);
        Long idMax=annonceRepo.maxID();
        if (idMax == null) {
        	idMax = 0L;
        }
        // Valeur par défaut si quatite est null ou <= 0
        if (quatite == null || quatite <= 0) {
        	quatite = 1L;
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
        System.out.println("  - quatite: " + quatite);
        System.out.println("  - longitude: " + userLongitude);
        System.out.println("  - latitude: " + userLatitude);
        System.out.println("  - photo: " + photo);
        
        try {
        	int insertResult = annonceRepo.addAnnonce(idMax+1,titre, desc,date, categorie,commune, donnateur,userLongitude,userLatitude,photo,quatite);
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
	
	
			
	
	
	
	


