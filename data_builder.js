const fs = require("fs");
const csv = require("csv-parser");
const { resolve } = require("path");
const { json } = require("body-parser");

const dailyDataFile = "./data/worldometer_coronavirus_daily_data.csv";
const summaryDataFile = "./data/worldometer_coronavirus_summary_data.csv";
const globalMapPreprotionDataOutputfileName = "./src/global_map_data.json";

// Prepare preprotion data for global map
const globalMapPreprotionData = async() => {
    const countryData = {};
    const resultData = {};

    await new Promise((resolve) => {
        fs.createReadStream(summaryDataFile).pipe(csv()).on("data", (row) => {
            const country = row["country"];
            const population = parseFloat(row["population"]);
            countryData[country] = population;
        })
        .on("end", resolve);
    });

    await new Promise((resolve) => {
        fs.createReadStream(dailyDataFile).pipe(csv()).on("data", (row) => {
            const date = row["date"];
            const country = row["country"];
            const activeCases = parseFloat(row["cumulative_total_cases"] || 0);
            const population = countryData[country] || 1;

            const fraction = activeCases / population;

            if (!resultData[date]) {
                resultData[date] = {};
            }
            resultData[date][country] = fraction.toFixed(10);
        })
        .on("end", resolve);
    });

    fs.writeFileSync(outputFileName, JSON.stringify(globalMapPreprotionDataOutputfileName, null, 2));
    console.log("Global data prepared succesfully");
}

// Country name conflict solve
const countryNameConflict = async () => {
    // Load the GeoJSON file
    const geoData = JSON.parse(fs.readFileSync('./src/GeoChart.world.geo.json', 'utf8'));

    // Load the COVID-19 data file
    const covidData = JSON.parse(fs.readFileSync(globalMapPreprotionDataOutputfileName, 'utf8'));

    // Extract country names from GeoJSON
    const geoCountryNames = geoData.features.map(
    (feature) => feature.properties.name
    );

    // Mapping for mismatched country names
    const countryNameMapping = {
    "USA": "United States",
    "UK": "United Kingdom",
    "South Korea": "Republic of Korea",
    "Czech Republic": "Czechia",
    "Russia": "Russian Federation",
    "China Hong Kong Sar": "Hong Kong",
    "China Macao Sar": "Macao",
    "State Of Palestine": "Palestine",
    "Viet Nam": "Vietnam",
    "Cote D Ivoire": "Ivory Coast",
    "Swaziland": "Eswatini",
    // Add more mappings as needed
    };

    // Reverse mapping for lookup
    const geoCountryNameLookup = geoCountryNames.reduce((acc, name) => {
    acc[name] = name;
    return acc;
    }, {});

    // Update COVID data to match GeoJSON countries
    const updatedCovidData = {};

    for (const [date, data] of Object.entries(covidData)) {
    const filteredData = {};
    for (const [country, value] of Object.entries(data)) {
        // Standardize country name
        const mappedName = countryNameMapping[country] || country;
        if (geoCountryNameLookup[mappedName]) {
        filteredData[mappedName] = value;
        }
    }
    updatedCovidData[date] = filteredData;
    }

    // Save the updated COVID data
    fs.writeFileSync(
    globalMapPreprotionDataOutputfileName,
    JSON.stringify(updatedCovidData, null, 2),
    'utf8'
    );

    console.log('Updated COVID data saved to updated_covid_data.json');
}

// Invoke data funtions from here as needed
(async () => {
    // Prepare global fraction data
    // await globalMapPreprotionData();

    // Solve country name conflict in data
    await countryNameConflict();
})()