package com.renewal.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Item class
 * 
 * @author: Shaun
 * @version 1.0
 * @since 12/8/2026
 */
public class Item{
    private String id;
    private String name;
    private double amount;
    private LocalDate deadline;
    private String categoryId;
    private String description;

    // For setting the reminder offsets
    private List<Integer> reminderOffsets = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // To catch the item's deadline offset

    private String cycleType = "ONE_TIME";

    private int customIntervalValue;
    private String customIntervalUnit;
    
    private LocalDateTime LastCompletedDate;
    // Default constructor for more flexibility in creating an Item object
    public Item(){
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCycleType() {
        return cycleType;
    }

    public void setCycleType(String cycleType) {
        this.cycleType = cycleType;
    }

    public int getCustomIntervalValue() {
        return customIntervalValue;
    }

    public void setCustomIntervalValue(int customIntervalValue) {
        this.customIntervalValue = customIntervalValue;
    }

    public String getCustomIntervalUnit() {
        return customIntervalUnit;
    }

    public void setCustomIntervalUnit(String customIntervalUnit) {
        this.customIntervalUnit = customIntervalUnit;
    }

    public LocalDateTime getLastCompletedDate() {
        return LastCompletedDate;
    }

    public void setLastCompletedDate(LocalDateTime lastCompletedDate) {
        LastCompletedDate = lastCompletedDate;
    }
}
