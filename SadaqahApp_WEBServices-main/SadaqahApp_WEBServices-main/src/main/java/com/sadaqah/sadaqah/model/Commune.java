package com.sadaqah.sadaqah.model;

import java.io.Serializable;


import javax.persistence.Column;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.geolatte.geom.Geometry;
import org.n52.jackson.datatype.jts.GeometryDeserializer;
import org.n52.jackson.datatype.jts.GeometrySerializer;
import org.locationtech.jts.geom.*;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Entity
@Table(name="Commune")
public class Commune implements Serializable{
	private static final long serialVersionUID = 1L;
	
	public Commune() {
		super();
	}
	
	
	public Commune(Long id, MultiPolygon geom, String libelle, String type) {
		super();
		this.id = id;
		this.geom = geom;
		this.libelle = libelle;
		this.type = type;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public 	MultiPolygon getGeom() {
		return geom;
	}
	public void setGeom(MultiPolygon geom) {
		this.geom = geom;
	}
	public String getLibelle() {
		return libelle;
	}
	public void setLibelle(String libelle) {
		this.libelle = libelle;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}

	@Id
	@GeneratedValue
	@Column(name="id")
	private Long id;
	@Column(name="geom")
	@JsonSerialize(using = GeometrySerializer.class)
	@JsonDeserialize(using = GeometryDeserializer.class)
	private MultiPolygon geom;
	@Column(name="libelle")
	private String libelle; 
	@Column(name="type")
	private String type; 
	

}
