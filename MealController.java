package com.example.themealdb.controller;

import com.example.themealdb.service.MealService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    // GET /api/meals/search?name=Arrabiata
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> search(@RequestParam String name) {
        return mealService.searchByName(name);
    }

    // GET /api/meals/categories
    @GetMapping(value = "/categories", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> categories() {
        return mealService.listCategories();
    }

    // GET /api/meals/random
    @GetMapping(value = "/random", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> random() {
        return mealService.randomMeal();
    }

    // GET /api/meals/lookup?id=52772
    @GetMapping(value = "/lookup", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> lookup(@RequestParam String id) {
        return mealService.lookupById(id);
    }
}
