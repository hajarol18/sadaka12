package com.sadaqah.sadaqah.specification;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.springframework.data.jpa.domain.Specification;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.model.Commune;
import com.sadaqah.sadaqah.model.Utilisateur;

public class AnnonceSpecification {
	
	public static Specification<Annonce> commmuneEqual(Commune commune) {
        return new Specification<Annonce>() {
            @Override
            public Predicate toPredicate(Root<Annonce> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                return criteriaBuilder.equal(root.get("commune"), commune);
            }
        };
    }
	
	
	public static Specification<Annonce> categorieEqual(Category categorie) {
        return new Specification<Annonce>() {
            @Override
            public Predicate toPredicate(Root<Annonce> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                return criteriaBuilder.equal(root.get("categorie"), categorie);
            }
        };
    }
	
	public static Specification<Annonce> donnateurEqual(Utilisateur donnateur) {
        return new Specification<Annonce>() {
            @Override
            public Predicate toPredicate(Root<Annonce> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                return criteriaBuilder.equal(root.get("donnateur"), donnateur);
            }
        };
    }

}
