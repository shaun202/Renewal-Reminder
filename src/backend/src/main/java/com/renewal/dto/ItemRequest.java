package com.renewal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;
import java.util.List;

/**
 * ItemRequest class to represent the request body for creating or updating an item.
 * 
 * @author Shaun
 * @version 1.0
 * @since 12/8/2026
 * Used AI to assist in debugging
 */
public class ItemRequest {

    @NotBlank(message = "Name/Title is required")
    private String title;

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount can't be negative")
    private Double amount;

    @NotNull(message = "Date/deadline is required")
    private LocalDate deadline;

    private String categoryId;       // optional
    private String description;      // optional
    private List<Integer> reminderOffsets; // days-before values, e.g. [7, 1]

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Integer> getReminderOffsets() {
        return reminderOffsets;
    }

    public void setReminderOffsets(List<Integer> reminderOffsets) {
        this.reminderOffsets = reminderOffsets;
    }
}
