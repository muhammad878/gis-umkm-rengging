const shapefile = require('shapefile');
const fs = require('fs').promises;

/**
 * Script to extract government facilities (Pemerintahan) within Desa Rengging
 */

const FACILITIES_SHAPEFILE = 'C:/sisitem informasi gis/JEPARA/PEMERINTAHAN_PT_25K.shp';
const BOUNDARY_FILE = './public/data/village_boundaries.geojson';
const OUTPUT_PATH = './public/data/government_facilities.geojson';

// Simple point-in-polygon check
function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

async function extractGovernmentFacilities() {
    console.log('🔍 Reading village boundary...');

    try {
        // Read village boundary
        const boundaryData = JSON.parse(await fs.readFile(BOUNDARY_FILE, 'utf-8'));
        const villageBoundary = boundaryData.features[0].geometry.coordinates[0];

        console.log('✅ Village boundary loaded');
        console.log('📍 Boundary has', villageBoundary.length, 'points');

        // Read facilities shapefile
        console.log('\n🔍 Reading government facilities shapefile:', FACILITIES_SHAPEFILE);
        const source = await shapefile.open(FACILITIES_SHAPEFILE);

        const facilitiesInVillage = [];
        let totalFacilities = 0;

        let result;
        while (!(result = await source.read()).done) {
            totalFacilities++;
            const feature = result.value;

            // Log first few features to understand structure
            if (totalFacilities <= 3) {
                console.log(`\nFacility ${totalFacilities} properties:`, feature.properties);
            }

            // Check if facility is within village boundary
            if (feature.geometry && feature.geometry.type === 'Point') {
                const coords = feature.geometry.coordinates;

                if (pointInPolygon(coords, villageBoundary)) {
                    facilitiesInVillage.push(feature);
                    console.log(`\n✅ FOUND: ${feature.properties.NAMOBJ || 'Unknown'}`);
                }
            }
        }

        console.log(`\n📊 Total facilities scanned: ${totalFacilities}`);
        console.log(`🏛️  Government facilities in Desa Rengging: ${facilitiesInVillage.length}`);

        if (facilitiesInVillage.length === 0) {
            console.log('\n⚠️  No government facilities found within village boundary');
            return;
        }

        // Create GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: facilitiesInVillage
        };

        // Save to file
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(geojson, null, 2));
        console.log('\n✅ Government facilities GeoJSON saved to:', OUTPUT_PATH);
        console.log('🎉 Extraction complete!');

        // Show facility details
        console.log('\n📋 Facilities found:');
        facilitiesInVillage.forEach((facility, i) => {
            const name = facility.properties.NAMOBJ || facility.properties.REMARK || 'Unknown';
            console.log(`  ${i + 1}. ${name}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

// Run extraction
extractGovernmentFacilities();
