const fs = require("fs");
const csv = require("csv-parser");
const csvToJson = require("csvtojson");

const dailyDataFile = "./data/worldometer_coronavirus_daily_data.csv";
const summaryDataFile = "./data/worldometer_coronavirus_summary_data.csv";
const economyDataFile = "./data/economic_data.csv";
const governmentRegulationDataFile = "./data/OxCGRT_latest_responses.csv";
const globalMapProportionDataOutputfileName = "./src/global_map_data.json";
const groupedBarChartOutputfileName = "./src/grouped_bar_chart_average_data.json";
const groupedBarChartMonthlyOutputfileName = "./src/grouped_bar_chart_monthly_data.json";
const lineGraphDataOutputfileName = "./src/line_graph_data.json";
const barRaisingDataOutputfileName = "./src/bar_chart_raising_data.json";
const governmentRegulationOutputfileName = "./src/gov_reg_data.json";

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

const getWave = (selectedDate) => {
    const selectedDateObj = new Date(selectedDate);
    const wave1End = new Date('2020-04-30');
    const wave2End = new Date('2021-09-30');

    let wave;
    if (selectedDateObj <= wave1End) wave = "wave1";
    else if (selectedDateObj <= wave2End) wave = "wave2";
    else wave = "wave3";

    return wave;
};

function formatDate(dateStr) {
    // Format date to 'YYYY-MM-DD'
    const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!match) {
        throw new Error("Invalid date format. Expected YYYYMMDD");
    }
    const [, year, month, day] = match;
    return `${year}-${month}-${day}`;
}

const normalizeDate = (date) => {
    const match = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) {
        throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    const [, year, month, day] = match;
    const newMonth = String(month).padStart(2, '0');
    const newDay = String(day).padStart(2, '0');
    return `${year}-${newMonth}-${newDay}`;
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

const calculateMeanOfMetrics = (waveData) => {
    const totalMetrics = waveData.reduce (
        (acc, curr) => {
            acc.manufacturing_pmi += curr.manufacturing_pmi;
            acc.services_pmi += curr.services_pmi;
            acc.consumer_confidence += curr.consumer_confidence;
            return acc;
        },
        { manufacturing_pmi: 0, services_pmi: 0, consumer_confidence: 0 }
    );

    const numEntries = waveData.length;
    return {
        manufacturing_pmi: numEntries > 0 ? (totalMetrics.manufacturing_pmi / numEntries).toFixed(2) : 0,
        services_pmi: numEntries > 0 ? (totalMetrics.services_pmi / numEntries).toFixed(2) : 0,
        consumer_confidence: numEntries > 0 ? (totalMetrics.consumer_confidence / numEntries).toFixed(2) : 0
    };
};

const createDataForBarGraph = async () => {
    const resultData = {};
    await new Promise((resolve) => {
        fs.createReadStream(economyDataFile).pipe(csv()).on("data", (row) => {
            const rawDate = row["date"];
            const wave = getWave(rawDate);
            const country = row["country"];
            const metric = {
                manufacturing_pmi: parseFloat(row["manufacturing pmi"] || 0),
                services_pmi: parseFloat(row["services pmi"] || 0),
                consumer_confidence: parseFloat(row["consumer confidence"] || 0),
            };

            if (!resultData[country]) {
                resultData[country] = { wave1: [], wave2: [], wave3: [] };
            }

            resultData[country][wave].push(metric);
        })
        .on("end", resolve);
        
    });

    // Calculate mean values for each metric per wave per country
    const meanData = Object.keys(resultData).map((country) => {
        const waves = resultData[country];

        return {
            country,
            wave1: calculateMeanOfMetrics(waves.wave1),
            wave2: calculateMeanOfMetrics(waves.wave2),
            wave3: calculateMeanOfMetrics(waves.wave3),
        };
    });

    fs.writeFileSync(groupedBarChartOutputfileName, JSON.stringify(meanData, null, 2));
    console.log("Grouped Bar Chart for economy data prepared successfully");
};

const createGovRegulationDataForLineGraph = async () => {
    const resultData = {};

    const countryNameMapping = {
        "Democratic Republic of Congo": "Dem. Rep. Congo",
        "Kyrgyz Republic": "Kyrgyzstan",
        "Slovak Republic": "Slovakia",
        "Bosnia and Herzegovina": "Bosnia and Herz.",
        "Central African Republic": "Central African Rep.",
        "Cote d'Ivoire": "Côte d'Ivoire",
        "Cyprus": "N. Cyprus",
        "Czech Republic": "Czech Rep.",
        "Dominican Republic": "Dominican Rep.",
        "Guinea": "Eq. Guinea",
        "Solomon Islands": "Solomon Is.",
        "South Korea": "Korea",
        "Sudan": "S. Sudan"
    };

    await new Promise((resolve) => {
        fs.createReadStream(governmentRegulationDataFile).pipe(csv()).on("data", (row) => {
            let policyType = row["PolicyType"];
            if (policyType) {
                policyType = policyType.split(":")[0].trim()
            }

            const startDateRaw = row["StartDate"];
            const endDateRaw = row["EndDate"];

            if(!startDateRaw || !endDateRaw) {
                return;
            }

            const startDate = formatDate(startDateRaw);
            const endDate = formatDate(endDateRaw);

            if (policyType === "C6" || policyType === "H7") {
                let country = row["CountryName"].trim();
                let initialNote = row["InitialNote"];

                if (initialNote) {
                    initialNote = initialNote.split("Note")[0].trim();
                    initialNote = initialNote.split("Source")[0].trim();
                    initialNote = initialNote.split("http")[0].trim();
                    initialNote = initialNote.replace(/\s+/g, ' ');
                }

                if (countryNameMapping[country]) {
                    country = countryNameMapping[country];
                }

                if (!resultData[country]) {
                    resultData[country] = {};
                }

                if (!resultData[country][policyType]) {
                    resultData[country][policyType] = [];
                }

                resultData[country][policyType].push({
                    startDate: startDate,
                    endDate: endDate,
                    initialNote: initialNote,
                });
            }
        })
        .on("end", resolve);
    });

    fs.writeFileSync(governmentRegulationOutputfileName, JSON.stringify(resultData, null, 2));
    console.log("Governmental Regulation Information data prepared successfully");
}

const createMonthlyDataForBarGraph = async () => {
    const resultData = {};

    await new Promise((resolve) => {
        fs.createReadStream(economyDataFile).pipe(csv()).on("data", (row) => {
            const date = row["date"];
            const wave = getWave(date);
            const country = row["country"];
            const metric = {
                manufacturing_pmi: parseFloat(row["manufacturing pmi"] || 0),
                services_pmi: parseFloat(row["services pmi"] || 0),
                consumer_confidence: parseFloat(row["consumer confidence"] || 0),
            };

            if (wave) {
                if (!resultData[country]) {
                    resultData[country] = { wave1: {}, wave2: {}, wave3: {} };
                }

                const countryEntry = resultData[country];
                const waveData = countryEntry[wave];
                if (!waveData[date]) {
                    waveData[date] = {
                        manufacturing_pmi: metric.manufacturing_pmi,
                        services_pmi: metric.services_pmi,
                        consumer_confidence: metric.consumer_confidence
                    };
                }
            }
        })
        .on("end", resolve);
        
    });

    fs.writeFileSync(groupedBarChartMonthlyOutputfileName, JSON.stringify(resultData, null, 2));
    console.log("Monthly Grouped Bar Chart for economy data prepared successfully");
};

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

const barRaisingChartData = async () => {
    const proportionData = JSON.parse(await fs.readFileSync(globalMapProportionDataOutputfileName));

    const top5Data = {};
    Object.keys(proportionData).forEach(date => {
        const dateData = proportionData[date];
        const tops = Object.entries(dateData).map(([country, value]) =>[country, parseFloat(value)])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        top5Data[date] = []
        tops.forEach(entry => {
            top5Data[date].push(entry[0]);
        });
    });

    const dailyCovidData = await csvToJson().fromFile(dailyDataFile);
    const resultData = {};

    Object.keys(top5Data).forEach(date => {
        resultData[date] = []
        dailyCovidData.forEach(row => {
            if (normalizeDate(row.date) === date && top5Data[date].includes(row.country)) {
                resultData[date].push({
                    Country: row.country,
                    TotalCases: parseFloat(row.cumulative_total_cases || 0),
                    NewCases: parseFloat(row.daily_new_cases || 0),
                    TotalDeath: parseFloat(row.cumulative_total_deaths || 0),
                    NewDeath: parseFloat(row.daily_new_deaths || 0),
                });
            }
        })
    });

    await fs.writeFileSync(barRaisingDataOutputfileName, JSON.stringify(resultData, null ,2));
    console.log("Bar chart raising data is done");
}

const getListofCountry = async () => {
    const dailyCovidData = await csvToJson().fromFile(dailyDataFile);
    const country = [];
    dailyCovidData.forEach(row => {
        if(!country.includes(row.country)) {
            country.push(row.country);
        }
    });

    console.log("country list", JSON.stringify(country, null, 2));
}

// Invoke data funtions from here as needed
(async () => {
    // Prepare global fraction data
    // await globalMapPreprotionData();

    // Solve country name conflict in data
    // await countryNameConflict(globalMapProportionDataOutputfileName);
    // await sortGlobalDataDateWise();

    // Generate Line graph data
    // await createDataForLineGraph();
    // await countryNameConflict(lineGraphDataOutputfileName);
    // await groupWaveData();

    // Bar chart raising graph data
    // await barRaisingChartData();

    // Generate Grouped Bar Chart for economy dataset
    // await createDataForBarGraph();

    // Generate Grouped Bar Chart (MONTHLY) for economy dataset
    // await createMonthlyDataForBarGraph();

<<<<<<< Updated upstream
    await getListofCountry();
=======
<<<<<<< HEAD
    // Generate Governmental Regulation Data
    await createGovRegulationDataForLineGraph();
=======
    await getListofCountry();
>>>>>>> c12514ac2677fd5abd23ba1d22b73e8579b03c76
>>>>>>> Stashed changes
})()
