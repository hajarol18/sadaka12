package com.sadaqah.sadaqah.repo;
import org.springframework.stereotype.Repository;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Utilisateur;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface IUtilisateur extends JpaRepository <Utilisateur, Long> {
	
	
	//Trouver les annonces par id_user 
	@Query(value = "SELECT * FROM Utilisateur u"+ " where u.email="+" :email and u.password="+" :password" , nativeQuery = true)
	List<Utilisateur> findUserlogin(@Param("email") String email,@Param("password") String password);
	
	
	
	
	@Query(value = "INSERT INTO utilisateur (id,nom,prenom,email, password, telephone,photo,geom)"
			+ " VALUES (1456,:nom, :prenom, :email,:password,:telephone,:photo,ST_SetSRID(ST_Point(:Longitude,:Latitude),4326))" , nativeQuery = true)
	List<Utilisateur> AddUser(@Param("nom") String nom,
			@Param("prenom") String prenom,
			@Param("email") String email,
			@Param("password") String password,
			@Param("telephone") long telephone,
			@Param("photo") String photo,
			@Param("Longitude") double Longitude,
			@Param("Latitude") double Latitude);	

}






