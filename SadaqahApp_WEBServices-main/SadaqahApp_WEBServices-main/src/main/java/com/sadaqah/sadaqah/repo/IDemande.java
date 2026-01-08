package com.sadaqah.sadaqah.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sadaqah.sadaqah.model.Demande;

@Repository
public interface IDemande extends JpaRepository<Demande,Long>{
	
	@Query(value="select * from demande where annonce_id=:idAnnonce",nativeQuery=true)
	List<Demande> demandesParAnnone(Long idAnnonce);
	
	@Query(value="select * from demande where demandeur_id=:idUser",nativeQuery=true)
	List<Demande> demandesParUser(@Param("idUser") Long idUser);
	
	@Query(value="insert into demande(annonce_id, demandeur_id) values (:annonce,:demandeur)",nativeQuery=true)
	Demande savea(@Param("annonce") Long annonce, @Param("demandeur") Long demandeur);
}
