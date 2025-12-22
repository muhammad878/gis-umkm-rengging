const shapefile = require('shapefile');
const fs = require('fs').promises;

/**
 * Script to extract road infrastructure within Desa Rengging boundary
 */

const ROADS_SHAPEFILE = 'C:/sisitem informasi gis/JEPARA/JALAN_LN_25K.shp';
const BOUNDARY_FILE = './public/data/village_boundaries.geojson';
const OUTPUT_PATH = './public/data/roads.geojson';

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

async function extractRoads() {
    console.log('🔍 Reading village boundary...');

    try {
        // Read village boundary
        const boundaryData = JSON.parse(await fs.readFile(BOUNDARY_FILE, 'utf-8'));
        const villageBoundary = boundaryData.features[0].geometry.coordinates[0];

        console.log('✅ Village boundary loaded');
        console.log('📍 Boundary has', villageBoundary.length, 'points');

        // Read roads shapefile
        console.log('\n🔍 Reading roads shapefile:', ROADS_SHAPEFILE);
        const source = await shapefile.open(ROADS_SHAPEFILE);

        const roadsInVillage = [];
        let totalRoads = 0;

        let result;
        while (!(result = await source.read()).done) {
            totalRoads++;
            const feature = result.value;

            // Log first few features to understand structure
            if (totalRoads <= 2) {
                console.log(`\nRoad ${totalRoads} properties:`, feature.properties);
            }

            // Check if road intersects with village boundary
            if (feature.geometry && feature.geometry.type === 'LineString') {
                const roadCoords = feature.geometry.coordinates;

                if (lineIntersectsPolygon(roadCoords, villageBoundary)) {
                    roadsInVillage.push(feature);
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
                    roadsInVillage.push(feature);
                }
            }
        }

        console.log(`\n📊 Total roads scanned: ${totalRoads}`);
        console.log(`🛣️  Roads in Desa Rengging: ${roadsInVillage.length}`);

        if (roadsInVillage.length === 0) {
            console.log('\n⚠️  No roads found within village boundary');
            console.log('This might indicate:');
            console.log('1. The boundary coordinates are in different projection');
            console.log('2. The road data uses different coordinate system');
            return;
        }

        // Create GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: roadsInVillage
        };

        // Save to file
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(geojson, null, 2));
        console.log('\n✅ Roads GeoJSON saved to:', OUTPUT_PATH);
        console.log('🎉 Road extraction complete!');

        // Show road types found
        const roadTypes = new Set();
        roadsInVillage.forEach(road => {
            const type = road.properties.NAMOBJ || road.properties.REMARK || road.properties.JALAN || 'Unknown';
            roadTypes.add(type);
        });

        console.log('\n📋 Road types found:');
        Array.from(roadTypes).forEach(type => console.log(`  - ${type}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

// Run extraction
extractRoads();
