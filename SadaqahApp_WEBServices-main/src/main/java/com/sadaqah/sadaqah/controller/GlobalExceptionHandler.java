package com.sadaqah.sadaqah.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public List<?> handleException(Exception e) {
        System.err.println("========================================");
        System.err.println("[GlobalExceptionHandler] ERREUR CAPTUREE!");
        System.err.println("Message: " + e.getMessage());
        System.err.println("Type: " + e.getClass().getName());
        System.err.println("========================================");
        e.printStackTrace();
        System.err.println("========================================");
        
        // Retourner directement une liste vide (Spring la sérialisera en JSON [])
        return new ArrayList<>();
    }
}

