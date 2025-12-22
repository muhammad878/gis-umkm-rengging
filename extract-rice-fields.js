const shapefile = require('shapefile');
const fs = require('fs').promises;
const turf = require('@turf/turf');

/**
 * Script to extract rice fields (Sawah) strictly within Desa Rengging boundary
 */

const SAWAH_SHAPEFILE = 'C:/sisitem informasi gis/JEPARA/AGRISAWAH_AR_25K.shp';
const BOUNDARY_FILE = './public/data/village_boundaries.geojson';
const OUTPUT_PATH = './public/data/rice_fields.geojson';

async function extractRiceFields() {
    console.log('🔍 Reading village boundary...');

    try {
        // Read village boundary
        const boundaryData = JSON.parse(await fs.readFile(BOUNDARY_FILE, 'utf-8'));
        const villageFeature = boundaryData.features[0];

        console.log('✅ Village boundary loaded');

        // Read sawah shapefile
        console.log('\n🔍 Reading rice fields shapefile:', SAWAH_SHAPEFILE);
        const source = await shapefile.open(SAWAH_SHAPEFILE);

        const clippedSawah = [];
        let totalSawah = 0;

        let result;
        while (!(result = await source.read()).done) {
            totalSawah++;
            const sawahFeature = result.value;

            try {
                // Precise intersection using Turf.js
                // This will clip the sawah polygon to only the part inside the village boundary
                const intersection = turf.intersect(turf.featureCollection([villageFeature, sawahFeature]));

                if (intersection) {
                    // Preserve properties from the original sawah feature
                    intersection.properties = sawahFeature.properties;
                    clippedSawah.push(intersection);
                }
            } catch (err) {
                // Skip features with invalid geometries
                continue;
            }
        }

        console.log(`\n📊 Total areas scanned: ${totalSawah}`);
        console.log(`🌾 Clipped rice field areas in Desa Rengging: ${clippedSawah.length}`);

        if (clippedSawah.length === 0) {
            console.log('\n⚠️  No rice fields found within village boundary');
            return;
        }

        // Create GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: clippedSawah
        };

        // Save to file
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(geojson, null, 2));
        console.log('\n✅ Clipped Rice Fields GeoJSON saved to:', OUTPUT_PATH);
        console.log('🎉 Rice field extraction complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

// Run extraction
extractRiceFields();
