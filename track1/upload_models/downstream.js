const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net"; // Replace with your ADT hostname

async function main() {
    const credential = new DefaultAzureCredential();
    const client = new DigitalTwinsClient(adtUrl, credential);

    try {
        console.log("📡 Uploading Downstream models...");

        const downstreamModels = [
            {
                "@id": "dtmi:industry:oilgas:downstream:RefineryUnit;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Refinery Unit",
                "contents": [
                    { "@type": "Property", "name": "temperature", "schema": "double", "unit": "°C" },
                    { "@type": "Property", "name": "pressure", "schema": "double", "unit": "bar" },
                    { "@type": "Property", "name": "throughput", "schema": "double", "unit": "m3/h" }
                ]
            },
            {
                "@id": "dtmi:industry:oilgas:downstream:RetailStation;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Retail Station",
                "contents": [
                    { "@type": "Property", "name": "fuelInventory", "schema": "double", "unit": "liters" },
                    { "@type": "Property", "name": "sales", "schema": "double", "unit": "liters" }
                ]
            },
            {
                "@id": "dtmi:industry:oilgas:downstream:Supplies;1",
                "@type": "Relationship",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Supplies",
                "source": "dtmi:industry:oilgas:downstream:RefineryUnit;1",
                "target": "dtmi:industry:oilgas:downstream:RetailStation;1"
            }
        ];

        const result = await client.createModels(downstreamModels);
        console.log("✅ Downstream models created:", JSON.stringify(result, null, 2));

    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") {
            console.log("ℹ Models already exist, skipping upload.");
        } else {
            console.error("❌ Error:", err);
        }
    }
}

main();
