const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net"; // Replace with your ADT hostname

async function main() {
    const credential = new DefaultAzureCredential();
    const client = new DigitalTwinsClient(adtUrl, credential);

    try {
        console.log("📡 Uploading Midstream models...");

        const midstreamModels = [
            {
                "@id": "dtmi:industry:oilgas:midstream:CompressorStation;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Compressor Station",
                "contents": [
                    { "@type": "Property", "name": "status", "schema": "boolean" },
                    { "@type": "Property", "name": "energyConsumption", "schema": "double", "unit": "kWh" }
                ]
            },
            {
                "@id": "dtmi:industry:oilgas:midstream:PipelineSegment;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Pipeline Segment",
                "description": "Pipeline segment with standard properties based on ISO 15926",
                "contents": [
                    { "@type": "Property", "name": "pressure", "schema": "double", "unit": "bar" },
                    { "@type": "Property", "name": "flowRate", "schema": "double", "unit": "m3/h" },
                    { "@type": "Property", "name": "temperature", "schema": "double", "unit": "°C" }
                ]
            },
            {
                "@id": "dtmi:industry:oilgas:midstream:ConnectedTo;1",
                "@type": "Relationship",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "ConnectedTo",
                "source": "dtmi:industry:oilgas:midstream:PipelineSegment;1",
                "target": "dtmi:industry:oilgas:midstream:CompressorStation;1"
            }
        ];

        const result = await client.createModels(midstreamModels);
        console.log("✅ Midstream models created:", JSON.stringify(result, null, 2));

    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") {
            console.log("ℹ Models already exist, skipping upload.");
        } else {
            console.error("❌ Error:", err);
        }
    }
}

main();
