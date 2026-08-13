package com.renewal.dto;

/**
 * NotFoundException class to represent a custom exception for when an item is not found.
 *
 * @author Claude
 * @version 1.0
 * @since 12/8/2026
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
