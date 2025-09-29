const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net"; // Replace with your ADT hostname

async function main() {
    const credential = new DefaultAzureCredential();
    const client = new DigitalTwinsClient(adtUrl, credential);

    try {
        console.log("📡 Uploading Power Generation models...");

        const powerModels = [
            {
                "@id": "dtmi:industry:power:GasTurbine;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Gas Turbine",
                "contents": [
                    { "@type": "Property", "name": "temperature", "schema": "double", "unit": "°C" },
                    { "@type": "Property", "name": "pressure", "schema": "double", "unit": "bar" },
                    { "@type": "Property", "name": "vibration", "schema": "double", "unit": "Hz" }
                ]
            },
            {
                "@id": "dtmi:industry:power:Transformer;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Transformer",
                "contents": [
                    { "@type": "Property", "name": "voltage", "schema": "double", "unit": "kV" },
                    { "@type": "Property", "name": "current", "schema": "double", "unit": "A" }
                ]
            },
            {
                "@id": "dtmi:industry:power:SuppliesPowerTo;1",
                "@type": "Relationship",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "SuppliesPowerTo",
                "source": "dtmi:industry:power:GasTurbine;1",
                "target": "dtmi:industry:power:Transformer;1"
            }
        ];

        const result = await client.createModels(powerModels);
        console.log("✅ Power Generation models created:", JSON.stringify(result, null, 2));

    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") {
            console.log("ℹ Models already exist, skipping upload.");
        } else {
            console.error("❌ Error:", err);
        }
    }
}

main();
