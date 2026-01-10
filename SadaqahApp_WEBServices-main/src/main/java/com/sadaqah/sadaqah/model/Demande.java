package com.sadaqah.sadaqah.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name="demande")
public class Demande {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; 
	
	@ManyToOne
	private Annonce annonce; 
	
	@ManyToOne
	private Utilisateur demandeur;
	
	@Column(name="date")
	private Date date;
	
	@Column(name="status", columnDefinition = "varchar(50) default 'PENDING'")
	private String status; // PENDING, APPROVED, REJECTED
	
	@Column(name="quantite_assignee")
	private Long quantiteAssignee; // Quantité assignée par le donateur
	
	public Demande() {
		super();
	}
	
	public Demande(Long id, Annonce annonce, Utilisateur demandeur) {
		super();
		this.id = id;
		this.annonce = annonce;
		this.demandeur = demandeur;
		this.date = new Date(); // Date par défaut = maintenant
		this.status = "PENDING"; // Statut par défaut = en attente
	}
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Annonce getAnnonce() {
		return annonce;
	}
	public void setAnnonce(Annonce annonce) {
		this.annonce = annonce;
	}
	public Utilisateur getDemandeur() {
		return demandeur;
	}
	public void setDemandeur(Utilisateur demandeur) {
		this.demandeur = demandeur;
	}
	
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
	public Long getQuantiteAssignee() {
		return quantiteAssignee;
	}
	public void setQuantiteAssignee(Long quantiteAssignee) {
		this.quantiteAssignee = quantiteAssignee;
	}
}
