package com.sadaqah.sadaqah.service;

import java.io.IOException;
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
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.model.Utilisateur;
import com.sadaqah.sadaqah.repo.IAnnonce;


import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AnnonceService {
	@Autowired
	private IAnnonce annonceRepo; 
	
	
	
	  public boolean pictureupload(long id,MultipartFile file) {

		    //.out.println(file.getName());
		    //System.out.println(file.getOriginalFilename());
		    //System.out.println(file.getSize());
		    //System.out.println(file.getOriginalFilename().split("\\.")[1]);
		    //System.out.println(id);		    

		    
		    try {
		      Path downloadedFile = Paths.get("images_annonce/"+id+"."+file.getOriginalFilename().split("\\.")[1]);
		      Files.deleteIfExists(downloadedFile);
		      Files.copy(file.getInputStream(), downloadedFile);
		      return true;
		    }
		    
		    catch (IOException e) {
		      LoggerFactory.getLogger(this.getClass()).error("pictureupload", e);
		      return false;
		    }

		  }
	
	
	
	
	//toutes les annonces
	public List<Annonce> findAnnonce() {
        return  annonceRepo.findAnnonces();
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
	public Annonce addAnnonce(List<Double> coordinates, String titre, String desc, Long categorie, Long commune,
			Long donnateur,String photo) {
		
		double userLongitude = coordinates.get(0);
        double userLatitude = coordinates.get(1);
        Long idMax=annonceRepo.maxID();
        Calendar cal = Calendar.getInstance();
        Date date=cal.getTime();
        DateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
        String formattedDate=dateFormat.format(date);
        
        return annonceRepo.addAnnonce(idMax+1,titre, desc,date, categorie,commune, donnateur,userLongitude,userLatitude,photo);
		
		
	}
	
	//modifier une annonce
	public Annonce updateAnnonce(Long id,List<Double> coordinates, String titre, String desc, Long categorie, Long commune,
			String photo) {
			
		double userLongitude = coordinates.get(0);
	    double userLatitude = coordinates.get(1);
	    Calendar cal = Calendar.getInstance();
	    Date date=cal.getTime();
	    DateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
	    String formattedDate=dateFormat.format(date);
	        
	    return annonceRepo.updateAnnonce(id,titre, desc,date, categorie,commune, userLongitude,userLatitude,photo);
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

	
		       
 
 }
	
	
			
	
	
	
	


