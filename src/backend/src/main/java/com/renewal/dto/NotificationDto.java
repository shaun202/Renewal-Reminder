package com.renewal.dto;

import java.time.LocalDate;

/**
 * NotificationDto class to represent a single in-app notification.
 * 
 * @author Claude
 * @version 1.0
 * @since 12/8/2026
 * Used AI to assist in debugging
 */
public class NotificationDto {

    private String itemId;
    private String title;           // item name
    private LocalDate deadline;
    private long daysLeft;          // negative once overdue
    private String timeLeftLabel;   // "3 days left", "Due today", "Overdue by 2 days"
    private String urgency;         // "overdue" | "urgent" | "upcoming"
    private int triggeredOffset;    // which reminder offset (days-before) caused this to fire

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
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

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public int getTriggeredOffset() {
        return triggeredOffset;
    }

    public void setTriggeredOffset(int triggeredOffset) {
        this.triggeredOffset = triggeredOffset;
    }
}
