const fs = require("fs");
const csv = require("csv-parser");

const dailyDataFile = "./data/worldometer_coronavirus_daily_data.csv";
const summaryDataFile = "./data/worldometer_coronavirus_summary_data.csv";
const globalMapProportionDataOutputfileName = "./src/global_map_data.json";
const lineGraphDataOutputfileName = "./src/line_graph_data.json";

const generateAllDates = (startDate, endDate) => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

const normalizeDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

// Prepare preprotion data for global map
const globalMapPreprotionData = async() => {
    const countryData = {};
    const resultData = {};
    const allDates = generateAllDates("2020-01-22", "2022-05-16");

    allDates.forEach((date) => {
        resultData[date] = {};
    });

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
            const rawDate = row["date"];
            const date = normalizeDate(rawDate);
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
const countryNameConflict = async (filename) => {
    // Load the COVID-19 data file
    const covidData = JSON.parse(fs.readFileSync(filename, 'utf8'));
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

    await fs.writeFileSync(filename, JSON.stringify(covidData, null ,2));
    console.log('Updated COVID data saved');
}

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

const createDataForLineGraph = async () => {
    const resultData = {};
    const allDates = generateAllDates("2020-01-22", "2022-05-16");

    allDates.forEach((date) => {
        resultData[date] = {};
    });

    await new Promise((resolve) => {
        fs.createReadStream(dailyDataFile).pipe(csv()).on("data", (row) => {
            const rawDate = row["date"];
            const date = normalizeDate(rawDate);
            const country = row["country"];
            const confirmedCases = parseFloat(row["cumulative_total_cases"] || 0);
            const confirmedDeaths = parseFloat(row["cumulative_total_deaths"] || 0);


            if (!resultData[date]) {
                resultData[date] = {};
            }
            resultData[date][country] = {
                TotalCases: confirmedCases,
                TotalDeath: confirmedDeaths,
            }
        })
        .on("end", resolve);
    });

    fs.writeFileSync(lineGraphDataOutputfileName, JSON.stringify(resultData, null, 2));
    console.log("Line graph data is ready");
}
const wave1Timeline = [(new Date("2020-01-22")).getTime(), (new Date("2020-04-30")).getTime()];
const wave2Timeline = [(new Date("2020-05-01")).getTime(), (new Date("2021-09-30")).getTime()];
const wave3Timeline = [(new Date("2021-10-01")).getTime(), (new Date("2022-05-14")).getTime()];
const groupWaveData = async () => {
    const lineGraphData = JSON.parse(await fs.readFileSync(lineGraphDataOutputfileName));
    const resultData = {
        wave1: {},
        wave2: {},
        wave3: {}
    }

    Object.keys(lineGraphData).forEach(date => {
        if(wave1Timeline[0] <= (new Date(date)).getTime() && (new Date(date)).getTime() <= wave1Timeline[1]) {
            resultData.wave1[date] = lineGraphData[date];
        } else if (wave2Timeline[0] <= (new Date(date)).getTime()  && (new Date(date)).getTime() <= wave2Timeline[1]) {
            resultData.wave2[date] = lineGraphData[date];
        } else if (wave3Timeline[0] <= (new Date(date)).getTime() && (new Date(date)).getTime() <= wave3Timeline[1]) {
            resultData.wave3[date] = lineGraphData[date];
        }
    });

    await fs.writeFileSync(lineGraphDataOutputfileName, JSON.stringify(resultData, null, 2));
    console.log("wave data is been grouped");
}

// Invoke data funtions from here as needed
(async () => {
    // Prepare global fraction data
    // await globalMapPreprotionData();

    // Solve country name conflict in data
    // await countryNameConflict(globalMapProportionDataOutputfileName);
    // await sortGlobalDataDateWise();

    // Generate Line graph data
    await createDataForLineGraph();
    await countryNameConflict(lineGraphDataOutputfileName);
    await groupWaveData();
})()
