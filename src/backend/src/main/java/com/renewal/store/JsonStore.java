package com.renewal.store;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

/**
 * JsonStore class to handle JSON storage of objects.
 * 
 * @author Claude
 * @version 1.0
 * @since 12/8/2026
 * @param <T>
 */
public class JsonStore<T> {

    private final Path filePath;
    private final TypeReference<List<T>> typeRef;
    private final ObjectMapper mapper;
    private final ReentrantLock lock = new ReentrantLock();

    public JsonStore(Path filePath, TypeReference<List<T>> typeRef) {
        this.filePath = filePath;
        this.typeRef = typeRef;
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .enable(SerializationFeature.INDENT_OUTPUT);
    }

    public List<T> readAll() {
        lock.lock();
        try {
            if (!Files.exists(filePath) || Files.size(filePath) == 0) {
                return new ArrayList<>();
            }
            return new ArrayList<>(mapper.readValue(filePath.toFile(), typeRef));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read " + filePath, e);
        } finally {
            lock.unlock();
        }
    }

    public void writeAll(List<T> items) {
        lock.lock();
        try {
            if (filePath.getParent() != null) {
                Files.createDirectories(filePath.getParent());
            }
            mapper.writeValue(filePath.toFile(), items);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to write " + filePath, e);
        } finally {
            lock.unlock();
        }
    }
}
