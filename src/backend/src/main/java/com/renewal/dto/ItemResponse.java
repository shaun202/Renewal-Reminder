package com.renewal.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * ItemResponse class to represent the response body for an item.
 * 
 * @author Shaun
 * @version 1.0
 * @since 12/8/2026
 * Used AI to assist in debugging
 */
public class ItemResponse {

    private String id;
    private String title;
    private double amount;
    private LocalDate deadline;
    private String categoryId;
    private String categoryName;   // resolved for convenience, null if no category
    private String categoryIcon;
    private String description;
    private List<Integer> reminderOffsets;

    private long daysLeft;         // negative once the deadline has passed
    private String timeLeftLabel;  // human readable, e.g. "3 days left", "Due today", "Overdue by 2 days"

    // Populated by the "safe check" - null when the reminder setup is fine
    private String warning;
    private List<Integer> suggestedAdditionalOffsets;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryIcon() {
        return categoryIcon;
    }

    public void setCategoryIcon(String categoryIcon) {
        this.categoryIcon = categoryIcon;
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

    public long getDaysLeft() {
        return daysLeft;
    }

    public void setDaysLeft(long daysLeft) {
        this.daysLeft = daysLeft;
    }

    public String getTimeLeftLabel() {
        return timeLeftLabel;
    }

    public void setTimeLeftLabel(String timeLeftLabel) {
        this.timeLeftLabel = timeLeftLabel;
    }

    public String getWarning() {
        return warning;
    }

    public void setWarning(String warning) {
        this.warning = warning;
    }

    public List<Integer> getSuggestedAdditionalOffsets() {
        return suggestedAdditionalOffsets;
    }

    public void setSuggestedAdditionalOffsets(List<Integer> suggestedAdditionalOffsets) {
        this.suggestedAdditionalOffsets = suggestedAdditionalOffsets;
    }
}
