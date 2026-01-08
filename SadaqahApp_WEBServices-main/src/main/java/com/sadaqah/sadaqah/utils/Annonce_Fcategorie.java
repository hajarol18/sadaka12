package com.sadaqah.sadaqah.utils;

public class Annonce_Fcategorie {
	private String fcategorie; 
	public String getFcategorie() {
		return fcategorie;
	}
	public void setFcategorie(String fcategorie) {
		this.fcategorie = fcategorie;
	}
	public Long getNbr_annonce() {
		return nbr_annonce;
	}
	public void setNbr_annonce(Long nbr_annonce) {
		this.nbr_annonce = nbr_annonce;
	}
	private Long nbr_annonce;
	public Annonce_Fcategorie(String fcategorie, Long nbr_annonce) {
		super();
		this.fcategorie = fcategorie;
		this.nbr_annonce = nbr_annonce;
	}
	public Annonce_Fcategorie() {
		super();
		// TODO Auto-generated constructor stub
	}

}
