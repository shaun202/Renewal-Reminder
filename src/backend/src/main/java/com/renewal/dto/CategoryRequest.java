package com.renewal.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * CategoryRequest class to represent the request body for creating or updating a category.
 * 
 * @author Shaun
 * @version 1.0
 * @since 12/8/2026
 * Used AI to assist in debugging
 */
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String icon;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
