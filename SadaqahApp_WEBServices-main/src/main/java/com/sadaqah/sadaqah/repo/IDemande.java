package com.sadaqah.sadaqah.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.sadaqah.sadaqah.model.Demande;

@Repository
public interface IDemande extends JpaRepository<Demande,Long>{
	
	@Query(value="select * from demande where annonce_id=:idAnnonce",nativeQuery=true)
	List<Demande> demandesParAnnone(Long idAnnonce);
	
	@Query(value="select * from demande where demandeur_id=:idUser",nativeQuery=true)
	List<Demande> demandesParUser(@Param("idUser") Long idUser);
	
	// Insérer une demande avec date et status par défaut
	@Modifying
	@Transactional
	@Query(value="insert into demande(annonce_id, demandeur_id, date, status) values (:annonce,:demandeur, NOW(), 'PENDING')",nativeQuery=true)
	int savea(@Param("annonce") Long annonce, @Param("demandeur") Long demandeur);
	
	// Assigner une quantité à une demande (mise à jour du statut et de la quantité assignée)
	@Modifying
	@Transactional
	@Query(value="update demande set status='APPROVED', quantite_assignee=:quantite where id=:idDemande",nativeQuery=true)
	int assignerQuantite(@Param("idDemande") Long idDemande, @Param("quantite") Long quantite);
}
