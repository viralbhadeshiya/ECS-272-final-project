const fs = require("fs");
const csv = require("csv-parser");
const { resolve } = require("path");
const { json } = require("body-parser");

const dailyDataFile = "./data/worldometer_coronavirus_daily_data.csv";
const summaryDataFile = "./data/worldometer_coronavirus_summary_data.csv";
const globalMapProportionDataOutputfileName = "./src/global_map_data.json";

// Prepare preprotion data for global map
const globalMapPreprotionData = async() => {
    const countryData = {};
    const resultData = {};

    await new Promise((resolve) => {
        fs.createReadStream(summaryDataFile).pipe(csv()).on("data", (row) => {
            const country = row["country"];
            const totalConfirmed = parseFloat(row["total_confirmed"]);
            countryData[country] = totalConfirmed;
        })
        .on("end", resolve);
    });

    await new Promise((resolve) => {
        fs.createReadStream(dailyDataFile).pipe(csv()).on("data", (row) => {
            const date = row["date"];
            const country = row["country"];
            const confirmedCases = parseFloat(row["cumulative_total_cases"] || 0);
            const totalConfirmed = countryData[country] || 1;

            const fraction = confirmedCases / totalConfirmed;

            if (!resultData[date]) {
                resultData[date] = {};
            }
            resultData[date][country] = fraction.toFixed(10);
        })
        .on("end", resolve);
    });

    fs.writeFileSync(globalMapProportionDataOutputfileName, JSON.stringify(resultData, null, 2));
    console.log("Global data prepared successfully");
}

// Country name conflict solve
const countryNameConflict = async () => {
    // Load the GeoJSON file
    const geoData = JSON.parse(fs.readFileSync('./src/GeoChart.world.geo.json', 'utf8'));

    // Load the COVID-19 data file
    const covidData = JSON.parse(fs.readFileSync(globalMapProportionDataOutputfileName, 'utf8'));

    // Extract country names from GeoJSON
    const geoCountryNames = geoData.features.map(
    (feature) => feature.properties.name
    );

    const geo_covid_mapping_name_field = {
        "Afghanistan": "Afghanistan",
        "Albania": "Albania",
        "Algeria": "Algeria",
        "Angola": "Angola",
        "Argentina": "Argentina",
        "Armenia": "Armenia",
        "Australia": "Australia",
        "Austria": "Austria",
        "Azerbaijan": "Azerbaijan",
        "Bahamas": "Bahamas",
        "Bangladesh": "Bangladesh",
        "Belarus": "Belarus",
        "Belgium": "Belgium",
        "Belize": "Belize",
        "Benin": "Benin",
        "Bhutan": "Bhutan",
        "Bolivia": "Bolivia",
        "Botswana": "Botswana",
        "Brazil": "Brazil",
        "Bulgaria": "Bulgaria",
        "Burkina Faso": "Burkina Faso",
        "Burundi": "Burundi",
        "Cambodia": "Cambodia",
        "Cameroon": "Cameroon",
        "Canada": "Canada",
        "Central African Republic": "Central African Republic",
        "Chad": "Chad",
        "Chile": "Chile",
        "China": "China",
        "Colombia": "Colombia",
        "Congo": "Congo",
        "Costa Rica": "Costa Rica",
        "Croatia": "Croatia",
        "Cuba": "Cuba",
        "Cyprus": "Cyprus",
        "Czech Republic": "Czechia",
        "Denmark": "Denmark",
        "Djibouti": "Djibouti",
        "Dominican Republic": "Dominican Republic",
        "Ecuador": "Ecuador",
        "Egypt": "Egypt",
        "El Salvador": "El Salvador",
        "Equatorial Guinea": "Equatorial Guinea",
        "Eritrea": "Eritrea",
        "Estonia": "Estonia",
        "Eswatini": "Eswatini",
        "Ethiopia": "Ethiopia",
        "Fiji": "Fiji",
        "Finland": "Finland",
        "France": "France",
        "Gabon": "Gabon",
        "Gambia": "Gambia",
        "Georgia": "Georgia",
        "Germany": "Germany",
        "Ghana": "Ghana",
        "Greece": "Greece",
        "Guatemala": "Guatemala",
        "Guinea": "Guinea",
        "Guyana": "Guyana",
        "Haiti": "Haiti",
        "Honduras": "Honduras",
        "Hungary": "Hungary",
        "Iceland": "Iceland",
        "India": "India",
        "Indonesia": "Indonesia",
        "Iran": "Iran",
        "Iraq": "Iraq",
        "Ireland": "Ireland",
        "Israel": "Israel",
        "Italy": "Italy",
        "Jamaica": "Jamaica",
        "Japan": "Japan",
        "Jordan": "Jordan",
        "Kazakhstan": "Kazakhstan",
        "Kenya": "Kenya",
        "South Korea": "South Korea",
        "Kuwait": "Kuwait",
        "Kyrgyzstan": "Kyrgyzstan",
        "Lao PDR": "Laos",
        "Latvia": "Latvia",
        "Lebanon": "Lebanon",
        "Lesotho": "Lesotho",
        "Liberia": "Liberia",
        "Libya": "Libya",
        "Lithuania": "Lithuania",
        "Luxembourg": "Luxembourg",
        "Madagascar": "Madagascar",
        "Malawi": "Malawi",
        "Malaysia": "Malaysia",
        "Mali": "Mali",
        "Malta": "Malta",
        "Mauritania": "Mauritania",
        "Mauritius": "Mauritius",
        "Mexico": "Mexico",
        "Moldova": "Moldova",
        "Mongolia": "Mongolia",
        "Montenegro": "Montenegro",
        "Morocco": "Morocco",
        "Mozambique": "Mozambique",
        "Myanmar": "Myanmar",
        "Namibia": "Namibia",
        "Nepal": "Nepal",
        "Netherlands": "Netherlands",
        "New Zealand": "New Zealand",
        "Nicaragua": "Nicaragua",
        "Niger": "Niger",
        "Nigeria": "Nigeria",
        "North Macedonia": "North Macedonia",
        "Norway": "Norway",
        "Oman": "Oman",
        "Pakistan": "Pakistan",
        "Panama": "Panama",
        "Papua New Guinea": "Papua New Guinea",
        "Paraguay": "Paraguay",
        "Peru": "Peru",
        "Philippines": "Philippines",
        "Poland": "Poland",
        "Portugal": "Portugal",
        "Qatar": "Qatar",
        "Romania": "Romania",
        "Russia": "Russia",
        "Rwanda": "Rwanda",
        "Saudi Arabia": "Saudi Arabia",
        "Senegal": "Senegal",
        "Serbia": "Serbia",
        "Sierra Leone": "Sierra Leone",
        "Singapore": "Singapore",
        "Slovakia": "Slovakia",
        "Slovenia": "Slovenia",
        "Somalia": "Somalia",
        "South Africa": "South Africa",
        "Spain": "Spain",
        "Sri Lanka": "Sri Lanka",
        "Sudan": "Sudan",
        "Suriname": "Suriname",
        "Sweden": "Sweden",
        "Switzerland": "Switzerland",
        "Syria": "Syria",
        "Taiwan": "Taiwan",
        "Tajikistan": "Tajikistan",
        "Tanzania": "Tanzania",
        "Thailand": "Thailand",
        "Togo": "Togo",
        "Tunisia": "Tunisia",
        "Turkey": "Turkey",
        "Uganda": "Uganda",
        "Ukraine": "Ukraine",
        "United Arab Emirates": "United Arab Emirates",
        "United Kingdom": "United Kingdom",
        "USA": "United States",
        "Uruguay": "Uruguay",
        "Uzbekistan": "Uzbekistan",
        "Venezuela": "Venezuela",
        "Vietnam": "Vietnam",
        "Yemen": "Yemen",
        "Zambia": "Zambia",
        "Zimbabwe": "Zimbabwe",
    }

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
        const mappedName = geo_covid_mapping_name_field[country] || country;
        if (geoCountryNameLookup[mappedName]) {
        filteredData[mappedName] = value;
        }
    }
    updatedCovidData[date] = filteredData;
    }

    // Save the updated COVID data
    fs.writeFileSync(
    globalMapProportionDataOutputfileName,
    JSON.stringify(updatedCovidData, null, 2),
    'utf8'
    );

    console.log('Updated COVID data saved to updated_covid_data.json');
}

const normalizeDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

const sortGlobalDataDateWise = async () => {
    const globalDataString = await fs.readFileSync(globalMapProportionDataOutputfileName);
    const globalData = JSON.parse(globalDataString);

    const dates = Object.keys(globalData);
    const sortedDates = dates
  .map(normalizeDate)
  .sort((a, b) => new Date(a) - new Date(b));

    const sortedData = {};

    sortedDates.forEach(date => {
        sortedData[date] = globalData[date];
    });

    await fs.writeFileSync(globalMapProportionDataOutputfileName, JSON.stringify(sortedData, null, 2));
}

// Invoke data funtions from here as needed
(async () => {
    // Prepare global fraction data
    await globalMapPreprotionData();

    // Solve country name conflict in data
    await countryNameConflict();
    await sortGlobalDataDateWise();
})()