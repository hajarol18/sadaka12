package com.sadaqah.sadaqah.model;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.locationtech.jts.geom.Point;
import org.n52.jackson.datatype.jts.GeometryDeserializer;
import org.n52.jackson.datatype.jts.GeometrySerializer;
import org.locationtech.jts.geom.Point;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Entity
@Table(name = "commune") // Correspond à votre table en base de données
public class Commune implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gid") // Correspond à la clé primaire
    private Long gid;

    @Column(name = "codecommun")
    private String codeCommune;

    @Column(name = "nomcommune") // Correspond à "nomcommune" dans la BDD
    private String nomCommune;

    @Column(name = "typecommun")
    private String typeCommun;

    // Définition spatiale pour PostGIS (SRID 4326 est le standard GPS/Web)
    @Column(name = "geom", columnDefinition = "geometry(Point, 4326)")
    @JsonSerialize(using = GeometrySerializer.class)
    @JsonDeserialize(using = GeometryDeserializer.class)
    private Point geom;

    // Constructeur vide (Obligatoire pour JPA)
    public Commune() {
        super();
    }

    // Constructeur complet
    public Commune(Long gid, String codeCommune, String nomCommune, String typeCommun, Point geom) {
        super();
        this.gid = gid;
        this.codeCommune = codeCommune;
        this.nomCommune = nomCommune;
        this.typeCommun = typeCommun;
        this.geom = geom;
    }

    // --- Getters et Setters ---

    public Long getGid() {
        return gid;
    }

    public void setGid(Long gid) {
        this.gid = gid;
    }

    public String getCodeCommune() {
        return codeCommune;
    }

    public void setCodeCommune(String codeCommune) {
        this.codeCommune = codeCommune;
    }

    public String getNomCommune() {
        return nomCommune;
    }

    public void setNomCommune(String nomCommune) {
        this.nomCommune = nomCommune;
    }

    public String getTypeCommun() {
        return typeCommun;
    }

    public void setTypeCommun(String typeCommun) {
        this.typeCommun = typeCommun;
    }

    public Point getGeom() {
        return geom;
    }

    public void setGeom(Point geom) {
        this.geom = geom;
    }
}