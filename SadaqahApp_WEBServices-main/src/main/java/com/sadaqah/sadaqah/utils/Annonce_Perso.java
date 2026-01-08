package com.sadaqah.sadaqah.utils;

public class Annonce_Perso {
	
	private Long id; 
	private Double lat; 
	private Double longitude; 
	private String commune;
	private String categorie;
	private String f_categorie;
	public Annonce_Perso(Long id, Double lat, Double longitude, String commune, String categorie, String f_categorie) {
		super();
		this.id = id;
		this.lat = lat;
		this.longitude = longitude;
		this.commune = commune;
		this.categorie = categorie;
		this.setF_categorie(f_categorie);
	}
	public Annonce_Perso() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Double getLat() {
		return lat;
	}
	public void setLat(Double lat) {
		this.lat = lat;
	}
	public Double getLongitude() {
		return longitude;
	}
	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}
	public String getCommune() {
		return commune;
	}
	public void setCommune(String commune) {
		this.commune = commune;
	}
	public String getCategorie() {
		return categorie;
	}
	public void setCategorie(String categorie) {
		this.categorie = categorie;
	}
	public String getF_categorie() {
		return f_categorie;
	}
	public void setF_categorie(String f_categorie) {
		this.f_categorie = f_categorie;
	}
	
	

}
