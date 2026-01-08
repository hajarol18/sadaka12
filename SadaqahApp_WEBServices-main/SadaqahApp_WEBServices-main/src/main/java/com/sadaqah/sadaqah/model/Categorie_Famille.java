package com.sadaqah.sadaqah.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="Categorie_Famille")
public class Categorie_Famille {
	
	
	
	@Id
	@GeneratedValue
	@Column(name="id")
	private Long id;
	public Categorie_Famille(Long id, String name) {
		super();
		this.id = id;
		this.name = name;
	}
	public Categorie_Famille() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	@Column(name="name")
	private String name; 

}
