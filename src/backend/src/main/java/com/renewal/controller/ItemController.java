package com.renewal.controller;

import com.renewal.dto.ItemRequest;
import com.renewal.dto.ItemResponse;
import com.renewal.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
/**
 * ItemController class
 * 
 * @author Claude
 * @version 1.0
 * @since 12/8/2026
 */
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<ItemResponse> getAll() {
        return itemService.getAll();
    }

    @GetMapping("/{id}")
    public ItemResponse getOne(@PathVariable String id) {
        return itemService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse create(@Valid @RequestBody ItemRequest request) {
        return itemService.create(request);
    }

    @PutMapping("/{id}")
    public ItemResponse update(@PathVariable String id, @Valid @RequestBody ItemRequest request) {
        return itemService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
