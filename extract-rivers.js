const shapefile = require('shapefile');
const fs = require('fs').promises;

/**
 * Script to extract rivers (Sungai) within Desa Rengging boundary
 */

const RIVERS_SHAPEFILE = 'C:/sisitem informasi gis/JEPARA/SUNGAI_LN_25K.shp';
const BOUNDARY_FILE = './public/data/village_boundaries.geojson';
const OUTPUT_PATH = './public/data/rivers.geojson';

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

// Check if a line intersects or is within the polygon
function lineIntersectsPolygon(lineCoords, polygonCoords) {
    // Check if any point of the line is inside the polygon
    for (const point of lineCoords) {
        if (pointInPolygon(point, polygonCoords)) {
            return true;
        }
    }
    return false;
}

async function extractRivers() {
    console.log('🔍 Reading village boundary...');

    try {
        // Read village boundary
        const boundaryData = JSON.parse(await fs.readFile(BOUNDARY_FILE, 'utf-8'));
        const villageBoundary = boundaryData.features[0].geometry.coordinates[0];

        console.log('✅ Village boundary loaded');
        console.log('📍 Boundary has', villageBoundary.length, 'points');

        // Read rivers shapefile
        console.log('\n🔍 Reading rivers shapefile:', RIVERS_SHAPEFILE);
        const source = await shapefile.open(RIVERS_SHAPEFILE);

        const riversInVillage = [];
        let totalRivers = 0;

        let result;
        while (!(result = await source.read()).done) {
            totalRivers++;
            const feature = result.value;

            // Log first few features to understand structure
            if (totalRivers <= 2) {
                console.log(`\nRiver ${totalRivers} properties:`, feature.properties);
            }

            // Check if river intersects with village boundary
            if (feature.geometry && feature.geometry.type === 'LineString') {
                const riverCoords = feature.geometry.coordinates;

                if (lineIntersectsPolygon(riverCoords, villageBoundary)) {
                    riversInVillage.push(feature);
                }
            } else if (feature.geometry && feature.geometry.type === 'MultiLineString') {
                // Handle MultiLineString
                let hasIntersection = false;
                for (const lineCoords of feature.geometry.coordinates) {
                    if (lineIntersectsPolygon(lineCoords, villageBoundary)) {
                        hasIntersection = true;
                        break;
                    }
                }
                if (hasIntersection) {
                    riversInVillage.push(feature);
                }
            }
        }

        console.log(`\n📊 Total rivers scanned: ${totalRivers}`);
        console.log(`🌊 Rivers in Desa Rengging: ${riversInVillage.length}`);

        if (riversInVillage.length === 0) {
            console.log('\n⚠️  No rivers found within village boundary');
            return;
        }

        // Create GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: riversInVillage
        };

        // Save to file
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(geojson, null, 2));
        console.log('\n✅ Rivers GeoJSON saved to:', OUTPUT_PATH);
        console.log('🎉 River extraction complete!');

        // Show river names
        const riverNames = new Set();
        riversInVillage.forEach(river => {
            const name = river.properties.NAMOBJ || river.properties.REMARK || 'Unknown';
            riverNames.add(name);
        });

        console.log('\n📋 Rivers found:');
        Array.from(riverNames).forEach(name => console.log(`  - ${name}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

// Run extraction
extractRivers();
