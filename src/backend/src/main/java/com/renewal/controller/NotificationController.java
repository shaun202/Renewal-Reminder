package com.renewal.controller;

import com.renewal.dto.NotificationDto;
import com.renewal.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
/**
 * NotificationController class
 * 
 * @author Claude
 * @version 1.0
 * @since 12/8/2026
 */
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Every item whose reminder window has been reached (name + time left),
     * most urgent first. Poll this to drive the notification bell.
     */
    @GetMapping
    public List<NotificationDto> getActive() {
        return notificationService.getActiveNotifications();
    }
}
