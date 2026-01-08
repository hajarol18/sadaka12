package com.sadaqah.sadaqah.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.locationtech.jts.geom.Point;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Utilisateur;
import com.sadaqah.sadaqah.repo.IAnnonce;
import com.sadaqah.sadaqah.repo.IUtilisateur;
@Service
public class UtilisateurService {
	
	@Autowired
	private IUtilisateur utilisateurRepo; 
	
	public boolean pictureuploadUser(long id,MultipartFile file) {

	    System.out.println(file.getName());
	    System.out.println(file.getOriginalFilename());
	    System.out.println(file.getSize());
	    System.out.println(file.getOriginalFilename().split("\\.")[1]);
	    System.out.println(id);		    

	    
	    try {
	      Path downloadedFile = Paths.get("images_user/"+id+"."+file.getOriginalFilename().split("\\.")[1]);
	      Files.deleteIfExists(downloadedFile);
	      Files.copy(file.getInputStream(), downloadedFile);
	      return true;
	    }
	    
	    catch (IOException e) {
	      LoggerFactory.getLogger(this.getClass()).error("pictureupload", e);
	      return false;
	    }

	  }
	
	
	
	public String findUser(String email,String password) {
		
		List<Utilisateur> Utilisateur_list=utilisateurRepo.findUserlogin(email,password);
		int l=Utilisateur_list.size();
		if(l>0){
	      return  Utilisateur_list.get(0).getId().toString();
		}
		else {
			return "false";
		}
	      
	}
	
	
	public Boolean addUser(String nom,String prenom,String email,String password,long telephone,String photo,double Longitude,double Latitude) {
        try {
		utilisateurRepo.AddUser(nom,prenom,email, password, telephone,photo,Longitude,Latitude);
        return true;
        }
        catch(Exception e){
        	 return true;
        }
		
	}

}
