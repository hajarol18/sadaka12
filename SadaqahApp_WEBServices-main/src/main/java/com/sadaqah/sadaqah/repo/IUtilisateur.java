package com.sadaqah.sadaqah.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sadaqah.sadaqah.model.Utilisateur;

@Repository
public interface IUtilisateur extends  JpaRepository<Utilisateur, Long> {
	
	

}
