const shapefile = require('shapefile');
const fs = require('fs').promises;

/**
 * Script to extract all facilities within Desa Rengging
 */

const BOUNDARY_FILE = './public/data/village_boundaries.geojson';

const FACILITIES = [
    {
        name: 'Pendidikan',
        shapefile: 'C:/sisitem informasi gis/JEPARA/PENDIDIKAN_PT_25K.shp',
        output: './public/data/education_facilities.geojson',
        icon: '🏫'
    },
    {
        name: 'Kesehatan',
        shapefile: 'C:/sisitem informasi gis/JEPARA/KESEHATAN_PT_25K.shp',
        output: './public/data/health_facilities.geojson',
        icon: '🏥'
    },
    {
        name: 'Tempat Ibadah',
        shapefile: 'C:/sisitem informasi gis/JEPARA/SARANAIBADAH_PT_25K.shp',
        output: './public/data/worship_facilities.geojson',
        icon: '🕌'
    }
];

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

async function extractFacilities() {
    console.log('🔍 Reading village boundary...');

    try {
        const boundaryData = JSON.parse(await fs.readFile(BOUNDARY_FILE, 'utf-8'));
        const villageBoundary = boundaryData.features[0].geometry.coordinates[0];
        console.log('✅ Village boundary loaded\n');

        for (const facility of FACILITIES) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`${facility.icon} Extracting ${facility.name}...`);
            console.log(`${'='.repeat(60)}`);

            const source = await shapefile.open(facility.shapefile);
            const facilitiesInVillage = [];
            let total = 0;

            let result;
            while (!(result = await source.read()).done) {
                total++;
                const feature = result.value;

                if (feature.geometry && feature.geometry.type === 'Point') {
                    const coords = feature.geometry.coordinates;

                    if (pointInPolygon(coords, villageBoundary)) {
                        facilitiesInVillage.push(feature);
                        const name = feature.properties.NAMOBJ || feature.properties.REMARK || 'Unknown';
                        console.log(`  ✅ ${name}`);
                    }
                }
            }

            console.log(`\n📊 Total scanned: ${total}`);
            console.log(`${facility.icon} Found in Desa Rengging: ${facilitiesInVillage.length}`);

            if (facilitiesInVillage.length > 0) {
                const geojson = {
                    type: 'FeatureCollection',
                    features: facilitiesInVillage
                };

                await fs.writeFile(facility.output, JSON.stringify(geojson, null, 2));
                console.log(`✅ Saved to: ${facility.output}`);
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('🎉 All facilities extracted successfully!');
        console.log(`${'='.repeat(60)}\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

extractFacilities();
