package com.sadaqah.sadaqah.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.locationtech.jts.geom.Point;

@Entity
@Table(name="utilisateur")
public class Utilisateur {
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getPrenom() {
		return prenom;
	}

	public void setPrenom(String prenom) {
		this.prenom = prenom;
	}

	public Point getGeom() {
		return geom;
	}

	public void setGeom(Point geom) {
		this.geom = geom;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Long getTelephone() {
		return telephone;
	}

	public void setTelephone(Long telephone) {
		this.telephone = telephone;
	}

	public String getPhoto() {
		return photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}

	public Utilisateur() {
		super();
		// TODO Auto-generated constructor stub
	}

	

	@Id
	@GeneratedValue
	@Column(name="id")
	private Long id;
	
	@Column(name="geom")
	private Point geom;
	
	@Column(name="nom")
	private String nom;
	
	@Column(name="prenom")
	private String prenom;
	
	@Column(name="photo")
	private String photo;
	
	@Column(name="email",unique=true)
	private String email;
	
	@Column(name="telephone")
	private Long telephone;
	
	@Column(name="userName",unique=true)
	private String userName;
	
	@Column(name="passWord")
	private String passWord;
	
	public Utilisateur(Long id, Point geom, String nom, String prenom, String photo, String email, Long telephone,
			String userName, String passWord, String genre) {
		super();
		this.id = id;
		this.geom = geom;
		this.nom = nom;
		this.prenom = prenom;
		this.photo = photo;
		this.email = email;
		this.telephone = telephone;
		this.userName = userName;
		this.passWord = passWord;
		this.genre = genre;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassWord() {
		return passWord;
	}

	public void setPassWord(String passWord) {
		this.passWord = passWord;
	}

	public String getGenre() {
		return genre;
	}

	public void setGenre(String genre) {
		this.genre = genre;
	}

	@Column(name="genre")
	private String genre;
	
	

}
