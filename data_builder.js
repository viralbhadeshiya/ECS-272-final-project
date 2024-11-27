const fs = require("fs");
const csv = require("csv-parser");

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
    // Load the COVID-19 data file
    const covidData = JSON.parse(fs.readFileSync(globalMapProportionDataOutputfileName, 'utf8'));
    const countryNames = ["Bahamas","Belize","Canada","Costa Rica","Cuba","Dominican Rep.","Greenland","Guatemala","Honduras","Haiti","Jamaica","Mexico","Nicaragua","Panama","Puerto Rico","El Salvador","Trinidad and Tobago","United States","Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Falkland Is.","Guyana","Peru","Paraguay","Suriname","Uruguay","Venezuela","Afghanistan","United Arab Emirates","Armenia","Azerbaijan","Bangladesh","Brunei","Bhutan","China","N. Cyprus","Cyprus","Georgia","Indonesia","India","Iran","Iraq","Israel","Jordan","Japan","Kazakhstan","Kyrgyzstan","Cambodia","Korea","Kuwait","Lao PDR","Lebanon","Sri Lanka","Myanmar","Mongolia","Malaysia","Nepal","Oman","Pakistan","Philippines","Dem. Rep. Korea","Palestine","Qatar","Saudi Arabia","Syria","Thailand","Tajikistan","Turkmenistan","Timor-Leste","Turkey","Taiwan","Uzbekistan","Vietnam","Yemen","Australia","Fiji","New Caledonia","New Zealand","Papua New Guinea","Solomon Is.","Vanuatu","Albania","Austria","Belgium","Bulgaria","Bosnia and Herz.","Belarus","Switzerland","Czech Rep.","Denmark","Germany","Spain","Estonia","Finland","France","United Kingdom","Greece","Croatia","Hungary","Ireland","Iceland","Italy","Kosovo","Lithuania","Luxembourg","Latvia","Moldova","Macedonia","Montenegro","Netherlands","Norway","Poland","Portugal","Romania","Russia","Serbia","Slovakia","Slovenia","Sweden","Ukraine","Angola","Burundi","Benin","Burkina Faso","Botswana","Central African Rep.","Côte d'Ivoire","Cameroon","Dem. Rep. Congo","Congo","Djibouti","Algeria","Egypt","Eritrea","Ethiopia","Gabon","Ghana","Guinea-Bissau","Guinea","Gambia","Eq. Guinea","Kenya","Liberia","Libya","Lesotho","Morocco","Madagascar","Mali","Mozambique","Mauritania","Malawi","Namibia","Niger","Nigeria","Rwanda","W. Sahara","Sudan","S. Sudan","Senegal","Sierra Leone","Somaliland","Somalia","Swaziland","Chad","Togo","Tunisia","Tanzania","Uganda","South Africa","Zambia","Zimbabwe"];
    const countryConflictMap = {
        "Guinea Bissau": "Guinea-Bissau",
        "Timor Leste": "Timor-Leste",
        "UK": "United Kingdom",
        "USA": "United States",
        "Viet Nam": "Vietnam",
        "South Sudan": "S. Sudan",
        "Western Sahara": "W. Sahara",
        "Equatorial Guinea": "Eq. Guinea",
        "Democratic Republic Of The Congo": "Dem. Rep. Congo",
        "Cote D Ivoire": "Côte d'Ivoire",
        "Central African Republic": "Central African Rep.",
        "Czech Republic": "Czech Rep.",
        "Bosnia And Herzegovina": "Bosnia and Herz.",
        "Solomon Islands": "Solomon Is.",
        "State Of Palestine": "Palestine",
        "South Korea": "Korea",
        "Cyprus": "N. Cyprus",
        "Brunei Darussalam": "Brunei",
        "Falkland Islands Malvinas": "Falkland Is.",
        "Dominican Republic": "Dominican Rep.",
    }

    Object.keys(covidData).forEach(date => {
        Object.keys(covidData[date]).forEach(country => {
            if (Object.keys(countryConflictMap).includes(country)) {
                covidData[date][countryConflictMap[country]] = covidData[date][country];
                delete covidData[date][country];
            }
        })
    });

    Object.keys(covidData).forEach(date => {
        Object.keys(covidData[date]).forEach(country => {
            if (!countryNames.includes(country)) {
                delete covidData[date][country];
            }
        })
    });

    await fs.writeFileSync(globalMapProportionDataOutputfileName, JSON.stringify(covidData, null ,2));
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
