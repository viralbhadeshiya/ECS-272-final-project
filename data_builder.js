const fs = require("fs");
const csv = require("csv-parser");
const { resolve } = require("path");

const dailyDataFile = "./data/worldometer_coronavirus_daily_data.csv";
const summaryDataFile = "./data/worldometer_coronavirus_summary_data.csv";

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
            const activeCases = parseFloat(row["active_cases"] || 0);
            const population = countryData[country] || 1;

            const fraction = activeCases / population;

            if (!resultData[date]) {
                resultData[date] = {};
            }
            resultData[date][country] = fraction.toFixed(10);
        })
        .on("end", resolve);
    });

    const outputFileName = "./src/global_map_data.json";
    fs.writeFileSync(outputFileName, JSON.stringify(resultData, null, 2));
    console.log("Global data prepared succesfully");
}

// Invoke data funtions from here as needed
(async () => {
    // Prepare global fraction data
    await globalMapPreprotionData();
})()