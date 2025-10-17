#!/usr/bin/env node

/**
 * Script to debug search functionality
 */

// Load environment variables
require('dotenv').config();

// Simulate the search process
function debugSearchFilters() {
    console.log('🔍 Debugging Search Filters\n');

    // Simulate URL parameters from: http://localhost:3000/search?type=properties&propertyType=apartamento&bathrooms=4
    const urlParams = {
        type: 'properties',
        propertyType: 'apartamento',
        bathrooms: '4'
    };

    console.log('📋 URL Parameters:');
    console.log(JSON.stringify(urlParams, null, 2));

    // Simulate how OptimizedSearchPage processes these
    const currentFilters = {};

    const location = urlParams.location;
    const propertyType = urlParams.propertyType;
    const status = urlParams.status;
    const minPrice = urlParams.minPrice;
    const maxPrice = urlParams.maxPrice;
    const bedrooms = urlParams.bedrooms;
    const bathrooms = urlParams.bathrooms;
    const minArea = urlParams.minArea;
    const maxArea = urlParams.maxArea;
    const amenities = urlParams.amenities;
    const sortBy = urlParams.sortBy;

    if (location) currentFilters.location = location;
    if (propertyType) currentFilters.propertyType = propertyType;
    if (status) currentFilters.status = status;
    if (minPrice) currentFilters.minPrice = parseInt(minPrice);
    if (maxPrice) currentFilters.maxPrice = parseInt(maxPrice);
    if (bedrooms) currentFilters.bedrooms = bedrooms;
    if (bathrooms) currentFilters.bathrooms = bathrooms;
    if (minArea) currentFilters.minArea = parseInt(minArea);
    if (maxArea) currentFilters.maxArea = parseInt(maxArea);
    if (amenities) currentFilters.amenities = amenities.split(",");
    if (sortBy) currentFilters.sortBy = sortBy;

    console.log('\n🔄 Processed Filters (OptimizedSearchPage):');
    console.log(JSON.stringify(currentFilters, null, 2));

    // Simulate FormData creation
    const formDataEntries = [];
    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
                value.forEach((item) => formDataEntries.push([key, item]));
            } else {
                formDataEntries.push([key, value.toString()]);
            }
        }
    });

    console.log('\n📤 FormData Entries:');
    formDataEntries.forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });

    // Simulate SearchPropertiesInput.fromFormData processing
    const searchInputData = {};

    // What fromFormData expects vs what we're sending
    console.log('\n❌ Mapping Issues:');

    if (currentFilters.propertyType) {
        console.log(`  - Sending: propertyType="${currentFilters.propertyType}"`);
        console.log(`  - Expected: propertyTypes (array)`);
        console.log(`  - Fix: Map propertyType -> propertyTypes`);
    }

    if (currentFilters.bathrooms) {
        console.log(`  - Sending: bathrooms="${currentFilters.bathrooms}"`);
        console.log(`  - Expected: minBathrooms or maxBathrooms`);
        console.log(`  - Fix: Map bathrooms -> minBathrooms`);
    }

    if (currentFilters.bedrooms) {
        console.log(`  - Sending: bedrooms="${currentFilters.bedrooms}"`);
        console.log(`  - Expected: minBedrooms or maxBedrooms`);
        console.log(`  - Fix: Map bedrooms -> minBedrooms`);
    }

    console.log('\n✅ Suggested Fixes:');
    console.log('1. Update SearchPropertiesInput.fromFormData to handle single values');
    console.log('2. Or update OptimizedSearchPage to send correct parameter names');
    console.log('3. Add proper type mapping (apartamento -> apartment)');
}

debugSearchFilters();