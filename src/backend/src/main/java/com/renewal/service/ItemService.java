package com.renewal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.renewal.dto.ItemRequest;
import com.renewal.dto.ItemResponse;
import com.renewal.dto.NotFoundException;
import com.renewal.model.Category;
import com.renewal.model.Item;
import com.renewal.store.JsonStore;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * ItemService class to handle item-related operations.
 * 
 * @author Shaun
 * @version 1.0
 * @since 12/8/2026
 * Used AI to assist in debugging
 */
@Service
public class ItemService {

    // If the earliest-firing reminder is fewer than this many days before the
    // deadline, we warn the user that they're cutting it close.
    private static final int CLOSE_THRESHOLD_DAYS = 3;
    private static final List<Integer> SUGGESTION_POOL = List.of(14, 7, 3, 1);

    @Value("${app.data.dir}")
    private String dataDir;

    private JsonStore<Item> store;
    private final CategoryService categoryService;

    public ItemService(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostConstruct
    void init() {
        store = new JsonStore<>(Path.of(dataDir, "items.json"), new TypeReference<>() {
        });
    }

    public List<ItemResponse> getAll() {
        List<Item> items = store.readAll();
        items.sort(Comparator.comparing(Item::getDeadline));
        return items.stream().map(this::toResponse).toList();
    }

    public ItemResponse getById(String id) {
        return toResponse(findOrThrow(id));
    }

    public ItemResponse create(ItemRequest request) {
        validateBusinessRules(request);

        Item item = new Item();
        item.setId(UUID.randomUUID().toString());
        applyRequest(item, request);
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        List<Item> all = store.readAll();
        all.add(item);
        store.writeAll(all);
        return toResponse(item);
    }

    public ItemResponse update(String id, ItemRequest request) {
        validateBusinessRules(request);

        List<Item> all = store.readAll();
        Item item = all.stream()
                .filter(i -> i.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Item not found: " + id));

        applyRequest(item, request);
        item.setUpdatedAt(LocalDateTime.now());
        store.writeAll(all);
        return toResponse(item);
    }

    public void delete(String id) {
        List<Item> all = store.readAll();
        boolean removed = all.removeIf(i -> i.getId().equals(id));
        if (!removed) {
            throw new NotFoundException("Item not found: " + id);
        }
        store.writeAll(all);
    }

    // package-private so NotificationService can reuse the same read path
    List<Item> getAllRaw() {
        return store.readAll();
    }

    private Item findOrThrow(String id) {
        return store.readAll().stream()
                .filter(i -> i.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Item not found: " + id));
    }

    private void applyRequest(Item item, ItemRequest request) {
        item.setTitle(request.getTitle().trim());
        item.setAmount(request.getAmount());
        item.setDeadline(request.getDeadline());
        item.setCategoryId(blankToNull(request.getCategoryId()));
        item.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());

        List<Integer> offsets = request.getReminderOffsets() == null
                ? new ArrayList<>()
                : new ArrayList<>(request.getReminderOffsets());
        offsets.removeIf(o -> o == null || o < 0);
        offsets.sort(Comparator.reverseOrder());
        item.setReminderOffsets(offsets);
    }

    private void validateBusinessRules(ItemRequest request) {
        if (request.getCategoryId() != null && !request.getCategoryId().isBlank()) {
            categoryService.getById(request.getCategoryId()); // throws NotFoundException if invalid
        }
    }

    private ItemResponse toResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setTitle(item.getTitle());
        response.setAmount(item.getAmount());
        response.setDeadline(item.getDeadline());
        response.setCategoryId(item.getCategoryId());
        response.setDescription(item.getDescription());
        response.setReminderOffsets(item.getReminderOffsets());

        if (item.getCategoryId() != null) {
            try {
                Category category = categoryService.getById(item.getCategoryId());
                response.setCategoryName(category.getName());
                response.setCategoryIcon(category.getIcon());
            } catch (NotFoundException ignored) {
                // category was deleted after this item was tagged with it - just omit it
            }
        }

        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), item.getDeadline());
        response.setDaysLeft(daysLeft);
        response.setTimeLeftLabel(formatTimeLeft(daysLeft));

        applySafetyCheck(response, item.getReminderOffsets());
        return response;
    }

    private String formatTimeLeft(long daysLeft) {
        if (daysLeft == 0) {
            return "Due today";
        }
        if (daysLeft < 0) {
            long overdue = Math.abs(daysLeft);
            return "Overdue by " + overdue + (overdue == 1 ? " day" : " days");
        }
        return daysLeft + (daysLeft == 1 ? " day left" : " days left");
    }

    /**
     * The "safe check": warns when the reminders set for an item won't give the
     * user much of a heads-up before the renewal is due, and suggests earlier
     * offsets to add.
     */
    private void applySafetyCheck(ItemResponse response, List<Integer> offsets) {
        if (offsets == null || offsets.isEmpty()) {
            response.setWarning("No reminder is set for this item - you won't get any advance notice before it renews.");
            response.setSuggestedAdditionalOffsets(List.of(7, 3, 1));
            return;
        }

        int earliestLeadTime = offsets.stream().mapToInt(Integer::intValue).max().orElse(0);

        if (earliestLeadTime < CLOSE_THRESHOLD_DAYS) {
            response.setWarning("Your closest reminder only fires " + earliestLeadTime
                    + (earliestLeadTime == 1 ? " day" : " days")
                    + " before the deadline. Consider adding an earlier reminder too, so you have more time to act.");
            response.setSuggestedAdditionalOffsets(suggestionsAbove(earliestLeadTime, offsets));
            return;
        }

        if (offsets.size() == 1) {
            response.setWarning("You only have one reminder set. Adding a second, earlier reminder gives you a backup in case you miss the first.");
            response.setSuggestedAdditionalOffsets(suggestionsAbove(earliestLeadTime, offsets));
        }
    }

    private List<Integer> suggestionsAbove(int currentMax, List<Integer> existing) {
        return SUGGESTION_POOL.stream()
                .filter(candidate -> candidate > currentMax && !existing.contains(candidate))
                .toList();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
