package com.sadaqah.sadaqah.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="Categorie")
public class Category {
	
	public Category(Long id, String nom, Long famille) {
		super();
		this.id = id;
		this.nom = nom;
		this.famille=famille;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return nom;
	}
	public void setName(String nom) {
		this.nom = nom;
	}
	public Long getFamille() {
		return famille;
	}
	public void setFamille(Long famille) {
		this.famille = famille;
	}
	public Category() {
		super();
	}
	
	@Id
	@GeneratedValue
	@Column(name="id")
	private Long id;
	@Column(name="nom")
	private String nom; 
	@Column(name="famille")
	private Long famille; 
}
