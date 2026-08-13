package com.renewal.service;

import com.renewal.dto.NotificationDto;
import com.renewal.model.Item;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * NotificationService class to handle notification-related operations.
 * 
 * @author Claude
 * @version 1.0
 * @since 12/8/2026
 */
@Service
public class NotificationService {

    private static final int URGENT_WITHIN_DAYS = 2;

    private final ItemService itemService;

    public NotificationService(ItemService itemService) {
        this.itemService = itemService;
    }

    public List<NotificationDto> getActiveNotifications() {
        LocalDate today = LocalDate.now();

        return itemService.getAllRaw().stream()
                .map(item -> toNotification(item, today))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted(Comparator.comparingLong(NotificationDto::getDaysLeft))
                .toList();
    }

    private Optional<NotificationDto> toNotification(Item item, LocalDate today) {
        long daysLeft = ChronoUnit.DAYS.between(today, item.getDeadline());

        // Among the offsets that have already been reached, the smallest one is
        // the most recent/relevant reminder to surface.
        Optional<Integer> triggeredOffset = item.getReminderOffsets().stream()
                .filter(offset -> daysLeft <= offset)
                .min(Integer::compareTo);

        if (triggeredOffset.isEmpty()) {
            return Optional.empty();
        }

        NotificationDto dto = new NotificationDto();
        dto.setItemId(item.getId());
        dto.setTitle(item.getName());
        dto.setDeadline(item.getDeadline());
        dto.setDaysLeft(daysLeft);
        dto.setTimeLeftLabel(formatTimeLeft(daysLeft));
        dto.setTriggeredOffset(triggeredOffset.get());
        dto.setUrgency(urgencyFor(daysLeft));
        return Optional.of(dto);
    }

    private String urgencyFor(long daysLeft) {
        if (daysLeft < 0) {
            return "overdue";
        }
        if (daysLeft <= URGENT_WITHIN_DAYS) {
            return "urgent";
        }
        return "upcoming";
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
}
