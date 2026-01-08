package com.sadaqah.sadaqah.repo;

import java.util.Collection;

import java.util.Date;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.utils.Annonce_Fcategorie;
import com.sadaqah.sadaqah.utils.Annonce_Perso;

@Repository
public interface IAnnonce extends JpaRepository<Annonce, Long>,JpaSpecificationExecutor<Annonce> {
	
	
	 
	//Trouver toutes les annonces appouvées 
	@Query(value = "SELECT * "+" FROM Annonce a where status= 'approuvée'" , nativeQuery = true)
	List<Annonce> findAnnonces();
	
	//Trouver toutes les annonces en cours de traitement 
		@Query(value = "SELECT * "+" FROM Annonce a where status= 'déclarée' or status='modifiée'" , nativeQuery = true)
		List<Annonce> findAnnonces_en_cours_traitement();
	
	//Trouver les annonces par id_user 
	@Query(value = "SELECT * FROM Annonce a"+ " where a.donnateur_id="+" :id_user" , nativeQuery = true)
	List<Annonce> findMesAnnonces(@Param("id_user") Long id_user);
	
	
	
	//Filtrer par id de categorie 
	@Query(value = "SELECT * FROM Annonce a"+" WHERE a.categorie_id=:categorie", nativeQuery = true)
	List<Annonce> findAnnoncesWithinCategorie(@Param("categorie")  Long categorie);
	
	//Filtrer par id de commune 
	@Query(value = "SELECT * FROM Annonce a"+" WHERE a.commune_id=:commune", nativeQuery = true)
	List<Annonce> findAnnoncesWithinCommune(@Param("commune")  Long commune);
	
	
	//ajout d'une nouvelle annonce 
	@Query(value = "INSERT INTO Annonce (id,titre, donnateur_id,categorie_id, commune_id,geom)"
			+ " VALUES (12,:titre, 1, 1, 1, ST_SetSRID(ST_Point(:userLongitude,:userLatitude),4326))", nativeQuery = true)
	void insert(@Param("titre") String titre,@Param("userLongitude") Double userLongitude,@Param("userLatitude")  Double userLatitude);
	
	
	
		
	//nouvelle annonce 
	@Query(value = "INSERT INTO Annonce (id, titre,description,date,status,categorie_id,commune_id,donnateur_id,geom,photo)"
				+ " VALUES (:id, :titre, :desc,:date, 'déclarée',:categorie,:commune,:donnateur,  ST_SetSRID(ST_Point(:longitude,:latitude),4326),:photo)", nativeQuery = true)
	boolean addAnnonce( @Param("id") Long id,@Param("titre") String titre, @Param("desc")  String desc,@Param("date")  Date date,
			@Param("categorie") Long categorie,
			@Param("commune")  Long commune,  @Param("donnateur") Long donnateur,  @Param("longitude") double longitude,
				@Param("latitude") double latitude,@Param("photo") String photo);
	
		
	//to just solve hibernate inserting data with pk constraint problem 
	@Query(value="select max(id) from annonce",nativeQuery=true)
	Long maxID();
	
	//nouvelle annonce 
		@Query(value = "UPDATE Annonce set titre=:titre,description= :desc,date=:date,status='modifiée',categorie_id=:categorie,"
				+ "commune_id=:commune,geom=ST_SetSRID(ST_Point(:longitude,:latitude),4326),photo=:photo "
					+ "where id=:id", nativeQuery = true)
		int updateAnnonce( @Param("id") Long id,@Param("titre") String titre, @Param("desc")  String desc,@Param("date")  Date date,
				@Param("categorie") Long categorie,
				@Param("commune")  Long commune,    @Param("longitude") double longitude,
					@Param("latitude") double latitude,@Param("photo") String photo);
		
	
	//suppression d'annonce par l'utilisateur
	@Transactional
	@Modifying 
	@Query(value = "update Annonce set status = 'annulée' "+ "where id=:id", nativeQuery = true)
	void deleteAnnonce(@Param("id") Long id);
	
	//approuver annonce par admin 
	@Transactional
	@Modifying 
	@Query(value = "update Annonce set status = 'approuvée' "+ "where id=:id", nativeQuery = true)
	void approuverAnnonce(@Param("id") Long id);
	
	//rejeter annonce par admin 
	@Transactional
	@Modifying 
	@Query(value = "update Annonce set status = 'rejetée' "+ "where id=:id", nativeQuery = true)
	void rejeterAnnonce(@Param("id") Long id);
	
	//don attribué 
	@Transactional
	@Modifying 
	@Query(value = "update Annonce set status = 'attribuée' "+ "where id=:id", nativeQuery = true)
	void masquerAnnonce(@Param("id") Long id);
	
	
	//les annonces les plus proches d'un point (position de l'utilisateur)//utilité si la position de annonce est random
	@Query(value = "SELECT a.id, a.donnateur,a.categorie,a.geom,a.date,a.titre,a.desc, a.status,a.photo,a.quantite, ST_Distance(a.geom,ST_SetSRID(ST_Point(:userLongitude,:userLatitude),4326)) AS distance "
		          + "FROM Annonce a "
		          + "ORDER BY a.geom  <-> ST_SetSRID(ST_Point(:userLongitude,:userLatitude),4326) "
		          + "LIMIT 1"
		            , nativeQuery = true)
	List<Annonce> findAnnoncesNearUser(@Param("userLongitude") Double userLongitude,@Param("userLatitude")  Double userLatitude);
	
	//nombre des annonces par date 
	@Query(value = "select count(*) as count, to_char(date,'dd-mon-yy') as date_ from annonce group by date_"
	            , nativeQuery = true)
	List annoncesParDate();
	
	//nombre des annonces par famille de categorie 
	@Query(value="select f.name as fcategorie,count(a) as nbr_annonce from annonce a, categorie c, "
			+ "categorie_famille f where a.categorie_id = c.id and c.famille=f.id group by f.name ", nativeQuery = true)
	
	List annonces_par_famille();
	
	
	

}
