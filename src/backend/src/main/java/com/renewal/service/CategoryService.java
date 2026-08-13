package com.renewal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.renewal.dto.CategoryRequest;
import com.renewal.dto.NotFoundException;
import com.renewal.model.Category;
import com.renewal.store.JsonStore;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Service
/**
 * CategoryService class to handle category-related operations.
 * 
 * @author Claude
 * @version 1.0
 * @since 12/8/2026
 */
public class CategoryService {

    @Value("${app.data.dir}")
    private String dataDir;

    private JsonStore<Category> store;

    @PostConstruct
    void init() {
        store = new JsonStore<>(Path.of(dataDir, "categories.json"), new TypeReference<>() {
        });
        seedDefaultsIfEmpty();
    }

    // Sample categories a renewal-tracking app is likely to need out of the box.
    private void seedDefaultsIfEmpty() {
        List<Category> existing = store.readAll();
        if (!existing.isEmpty()) {
            return;
        }
        List<Category> defaults = List.of(
                new Category(UUID.randomUUID().toString(), "Subscription", "\uD83D\uDCFA", true),
                new Category(UUID.randomUUID().toString(), "Insurance", "\uD83D\uDEE1\uFE0F", true),
                new Category(UUID.randomUUID().toString(), "License", "\uD83D\uDCC4", true),
                new Category(UUID.randomUUID().toString(), "Domain / Hosting", "\uD83C\uDF10", true),
                new Category(UUID.randomUUID().toString(), "Membership", "\uD83C\uDFAB", true),
                new Category(UUID.randomUUID().toString(), "Utility Bill", "\uD83D\uDCA1", true),
                new Category(UUID.randomUUID().toString(), "Other", "\uD83D\uDCCC", true)
        );
        store.writeAll(defaults);
    }

    public List<Category> getAll() {
        return store.readAll();
    }

    public Category getById(String id) {
        return store.readAll().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));
    }

    public Category create(CategoryRequest request) {
        List<Category> all = store.readAll();
        assertNameNotTaken(all, request.getName(), null);

        Category category = new Category();
        category.setId(UUID.randomUUID().toString());
        category.setName(request.getName().trim());
        category.setIcon(blankToDefault(request.getIcon()));
        category.setBuiltIn(false);

        all.add(category);
        store.writeAll(all);
        return category;
    }

    public Category update(String id, CategoryRequest request) {
        List<Category> all = store.readAll();
        Category category = all.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));

        assertNameNotTaken(all, request.getName(), id);

        category.setName(request.getName().trim());
        category.setIcon(blankToDefault(request.getIcon()));
        store.writeAll(all);
        return category;
    }

    public void delete(String id) {
        List<Category> all = store.readAll();
        boolean removed = all.removeIf(c -> c.getId().equals(id));
        if (!removed) {
            throw new NotFoundException("Category not found: " + id);
        }
        store.writeAll(all);
    }

    private void assertNameNotTaken(List<Category> all, String name, String ignoreId) {
        if (name == null || name.isBlank()) {
            return; // caught separately by bean validation
        }
        boolean taken = all.stream().anyMatch(c ->
                c.getName().equalsIgnoreCase(name.trim()) && !c.getId().equals(ignoreId));
        if (taken) {
            throw new IllegalArgumentException("A category named \"" + name.trim() + "\" already exists");
        }
    }

    private String blankToDefault(String icon) {
        return (icon == null || icon.isBlank()) ? "\uD83D\uDCCC" : icon.trim();
    }
}
