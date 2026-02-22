# Data Model: Bug Fixes & Improvements

**Feature**: 003-bug-fixes-improvements
**Date**: 2026-02-22
**Scope**: Data structures for new functionality and enhancements

## Entity: Review

**Purpose**: Represents customer testimonials for the reviews carousel on homepage and PDP
**Source**: Spec requirement for customer reviews carousel
**Constraints**:
- Must support 5-star rating system
- Must include reviewer name, text content, and date
- Must be compatible with fake/generated data for initial implementation

### Fields:
```
id: string | number (unique identifier)
name: string (reviewer's name)
rating: number (1-5 stars)
text: string (review content)
date: string | Date (review date)
avatar?: string (optional reviewer avatar URL)
verified?: boolean (whether reviewer verified purchase)
```

### Validation Rules:
- rating must be between 1 and 5 (inclusive)
- name must be 1-50 characters
- text must be 10-500 characters
- required fields: id, name, rating, text, date

## Entity: SearchQuery

**Purpose**: Represents user input for product search functionality
**Source**: Spec requirement to fix search product functionality
**Constraints**:
- Must support partial matching
- Must handle empty queries gracefully
- Must maintain existing search behavior while fixing the backend connection

### Fields:
```
query: string (search term)
limit?: number (optional result limit)
offset?: number (optional pagination offset)
category?: string (optional category filter)
```

### Validation Rules:
- query must be 1-100 characters
- limit must be 1-100 if provided
- offset must be >= 0 if provided

## Entity: CategoryParams

**Purpose**: Represents parameters for dynamic category routing
**Source**: Spec requirement to fix dynamic routing on categories page
**Constraints**:
- Must handle URL slugs properly
- Must support special characters in category names
- Must maintain backward compatibility with existing category system

### Fields:
```
slug: string (category URL identifier)
page?: number (pagination page)
sort?: string (sorting option)
filters?: Record<string, string> (additional filters)
```

### Validation Rules:
- slug must match /^[a-zA-Z0-9-]+$/ pattern
- page must be >= 1 if provided
- sort must be one of allowed values (e.g., 'name-asc', 'name-desc', 'price-asc', 'price-desc')

## Updated Product Entity

**Purpose**: Extend existing Product entity with additional fields needed for improvements
**Source**: Existing Product entity from previous specs with enhancements
**Constraints**:
- Maintain compatibility with existing Product structure
- Add only fields necessary for new functionality

### Additional Fields:
```
currency: string (currency code, now fixed as USD)
showInCarousel: boolean (whether to show in reviews carousel)
relatedProducts: Product[] (products to display in related products section)
```

## Component State: CarouselState

**Purpose**: Track carousel state for reviews carousel component
**Source**: Spec requirement for auto-rotating reviews carousel
**Constraints**:
- Must support manual navigation
- Must support auto-rotation
- Must work responsively across devices

### Fields:
```
currentIndex: number (currently visible slide)
autoRotate: boolean (whether auto-rotation is enabled)
rotationInterval: number (auto-rotation interval in ms)
isHovered: boolean (whether carousel is currently hovered)
transitionDuration: number (slide transition duration in ms)