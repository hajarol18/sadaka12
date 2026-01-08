package com.sadaqah.sadaqah.model;

import java.io.Serializable;




import java.util.Date;


import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.n52.jackson.datatype.jts.GeometryDeserializer;
import org.n52.jackson.datatype.jts.GeometrySerializer;
import org.locationtech.jts.geom.Point;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;



@Entity
@Table(name="Annonce")
public class Annonce {
	
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="id")
	private Long id;
	
	
	@Column(name="geom")
	@JsonSerialize(using = GeometrySerializer.class)
	@JsonDeserialize(using = GeometryDeserializer.class) 
	private Point geom;
	
	@ManyToOne
	private Utilisateur donnateur;
	
	@Column(name="titre")
	private String titre;
	
	@Column(name="description")
	private String description;
	
	@Column(name="quantite")
	private Long quatite;
	
	@Column(name="date")
	private Date date;
	
	@Column(name="photo")
	private String photo;
	
	@Column(name="status", columnDefinition = "varchar(100) default 'déclarée'")
	private String status;
	
	
	@ManyToOne
	private Commune commune;

	
	@ManyToOne
	private Category categorie;
	
	
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Point getGeom() {
		return geom;
	}

	public void setGeom(Point geom) {
		this.geom = geom;
	}


	public String getTitre() {
		return titre;
	}

	public void setTitre(String titre) {
		this.titre = titre;
	}

	public String getDesc() {
		return description;
	}

	public void setDesc(String desc) {
		this.description = desc;
	}

	public Long getQuatite() {
		return quatite;
	}

	public void setQuatite(Long quatite) {
		this.quatite = quatite;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public String getPhoto() {
		return photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}


	public Category getCategorie() {
		return categorie;
	}

	@JsonSetter
	public void setCategorie(Category categorie) {
		this.categorie = categorie;
	}

	public Utilisateur getDonnateur() {
		return donnateur;
	}

	@JsonSetter
	public void setDonnateur(Utilisateur donnateur) {
		this.donnateur = donnateur;
	}
	
	public Commune getCommune() {
		return commune;
	}

	@JsonSetter
	public void setCommune(Commune commune) {
		this.commune = commune;
	}
	
	public Annonce() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Annonce(Long id, Point geom, Utilisateur donnateur, String titre, String desc, Long quatite, Date date,
			String photo, Category categorie, String status, Commune commune) {
		super();
		this.id = id;
		this.geom = geom;
		this.donnateur = donnateur;
		this.titre = titre;
		this.description = desc;
		this.quatite = quatite;
		this.date = date;
		this.photo = photo;
		this.categorie = categorie;
		this.status=status;
		this.commune=commune;	}

	

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
	

}
