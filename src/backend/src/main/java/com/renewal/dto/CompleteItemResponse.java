package com.renewal.dto;

/**
 * ResponseDto class to represent the response of completing an item.
 * 
 * @author Shaun
 * @version 1.0
 * @since 15/8/2026
 */
public class CompleteItemResponse {
    private boolean deleted;
    private ItemResponse item;

    public CompleteItemResponse() {
    }

    public CompleteItemResponse(boolean deleted, ItemResponse item) {
        this.deleted = deleted;
        this.item = item;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
    
    public ItemResponse getItem() {
        return item;
    }

    public void setItem(ItemResponse item) {
        this.item = item;
    }
}
