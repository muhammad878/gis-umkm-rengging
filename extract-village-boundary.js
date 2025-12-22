const shapefile = require('shapefile');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script to extract Desa Rengging boundary from Kabupaten Jepara shapefile
 * and convert it to GeoJSON format for web mapping
 */

const SHAPEFILE_PATH = 'C:/sisitem informasi gis/JEPARA/ADMINISTRASIDESA_AR_25K.shp';
const OUTPUT_PATH = './public/data/village_boundaries.geojson';

async function extractDesaRengging() {
  console.log('🔍 Reading shapefile:', SHAPEFILE_PATH);

  try {
    const source = await shapefile.open(SHAPEFILE_PATH);
    const features = [];

    let result;
    let count = 0;

    // Read all features
    while (!(result = await source.read()).done) {
      count++;
      const feature = result.value;

      // Log first few features to understand the structure
      if (count <= 3) {
        console.log(`\nFeature ${count} properties:`, feature.properties);
      }

      // Try to find Desa Rengging - check various possible field names
      const props = feature.properties;
      const namaDesa = props.NAMOBJ || props.DESA || props.NAMA_DESA || props.WADMDES || '';
      const kecamatan = props.WADMKC || props.KECAMATAN || props.NAMA_KEC || '';

      // Filter for Desa Rengging in Kecamatan Pecangaan
      if (namaDesa.toLowerCase().includes('rengging') ||
        (namaDesa.toLowerCase().includes('rengging') && kecamatan.toLowerCase().includes('pecangaan'))) {
        console.log('\n✅ FOUND Desa Rengging!');
        console.log('Properties:', feature.properties);
        features.push(feature);
      }
    }

    console.log(`\n📊 Total features scanned: ${count}`);
    console.log(`📍 Desa Rengging features found: ${features.length}`);

    if (features.length === 0) {
      console.log('\n⚠️  Desa Rengging not found. Listing all unique village names:');

      // Re-read to list all villages
      const source2 = await shapefile.open(SHAPEFILE_PATH);
      const villages = new Set();

      while (!(result = await source2.read()).done) {
        const props = result.value.properties;
        const name = props.NAMOBJ || props.DESA || props.NAMA_DESA || props.WADMDES || 'Unknown';
        villages.add(name);
      }

      const sortedVillages = Array.from(villages).sort();
      console.log('\nAll villages in shapefile:');
      sortedVillages.forEach((v, i) => console.log(`${i + 1}. ${v}`));

      return;
    }

    // Create GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    // Save to file
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(geojson, null, 2));
    console.log('\n✅ GeoJSON saved to:', OUTPUT_PATH);
    console.log('🎉 Village boundary extraction complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Shapefile path is incorrect');
    console.error('2. Shapefile is corrupted');
    console.error('3. Missing .shx or .dbf files (shapefiles need all components)');
  }
}

// Run the extraction
extractDesaRengging();
