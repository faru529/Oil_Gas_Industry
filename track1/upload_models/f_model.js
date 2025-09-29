const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net";

async function main() {
    const client = new DigitalTwinsClient(adtUrl, new DefaultAzureCredential());

    const models = [
        // ----------------- UPSTREAM -----------------
        {
            "@id": "dtmi:industry:oilgas:upstream:DrillingRig;2",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Drilling Rig",
            "contents": [
                { "@type": "Property", "name": "torque", "schema": "double" },
                { "@type": "Property", "name": "pressure", "schema": "double" },
                { "@type": "Property", "name": "vibration", "schema": "double" },
                {
                    "@type": "Relationship",
                    "name": "Drills",
                    "target": "dtmi:industry:oilgas:upstream:Wellhead;1",
                    "properties": [
                        { "@type": "Property", "name": "createdOn", "schema": "dateTime" }
                    ]
                }
            ]
        },
        {
            "@id": "dtmi:industry:oilgas:upstream:Wellhead;1",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Wellhead",
            "contents": [
                { "@type": "Property", "name": "pressure", "schema": "double" },
                { "@type": "Property", "name": "temperature", "schema": "double" },
                { "@type": "Property", "name": "flowRate", "schema": "double" }
            ]
        },

        // ----------------- MIDSTREAM -----------------
        {
            "@id": "dtmi:industry:oilgas:midstream:PipelineSegment;1",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Pipeline Segment",
            "contents": [
                { "@type": "Property", "name": "pressure", "schema": "double" },
                { "@type": "Property", "name": "flowRate", "schema": "double" },
                { "@type": "Property", "name": "temperature", "schema": "double" },
                {
                    "@type": "Relationship",
                    "name": "ConnectedTo",
                    "target": "dtmi:industry:oilgas:midstream:CompressorStation;1",
                    "properties": [
                        { "@type": "Property", "name": "createdOn", "schema": "dateTime" }
                    ]
                }
            ]
        },
        {
            "@id": "dtmi:industry:oilgas:midstream:CompressorStation;1",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Compressor Station",
            "contents": [
                { "@type": "Property", "name": "status", "schema": "boolean" },
                { "@type": "Property", "name": "energyConsumption", "schema": "double" }
            ]
        },

        // ----------------- DOWNSTREAM -----------------
        {
            "@id": "dtmi:industry:oilgas:downstream:RefineryUnit;1",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Refinery Unit",
            "contents": [
                { "@type": "Property", "name": "temperature", "schema": "double" },
                { "@type": "Property", "name": "pressure", "schema": "double" },
                { "@type": "Property", "name": "throughput", "schema": "double" },
                {
                    "@type": "Relationship",
                    "name": "Supplies",
                    "target": "dtmi:industry:oilgas:downstream:RetailStation;1",
                    "properties": [
                        { "@type": "Property", "name": "createdOn", "schema": "dateTime" }
                    ]
                }
            ]
        },
        {
            "@id": "dtmi:industry:oilgas:downstream:RetailStation;1",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Retail Station",
            "contents": [
                { "@type": "Property", "name": "fuelInventory", "schema": "double" },
                { "@type": "Property", "name": "sales", "schema": "double" }
            ]
        },

        // ----------------- POWER GENERATION -----------------
        {
            "@id": "dtmi:industry:power:GasTurbine;1",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Gas Turbine",
            "contents": [
                { "@type": "Property", "name": "temperature", "schema": "double" },
                { "@type": "Property", "name": "pressure", "schema": "double" },
                { "@type": "Property", "name": "vibration", "schema": "double" },
                {
                    "@type": "Relationship",
                    "name": "SuppliesPowerTo",
                    "target": "dtmi:industry:power:Transformer;1",
                    "properties": [
                        { "@type": "Property", "name": "createdOn", "schema": "dateTime" }
                    ]
                }
            ]
        },
        {
            "@id": "dtmi:industry:power:Transformer;1",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Transformer",
            "contents": [
                { "@type": "Property", "name": "voltage", "schema": "double" },
                { "@type": "Property", "name": "current", "schema": "double" }
            ]
        }
    ];

    try {
        const result = await client.createModels(models);
        console.log("✅ All models created:", result.map(m => m.id));
    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") {
            console.log("ℹ Some models already exist");
        } else {
            console.error("❌ Error:", err);
        }
    }
}

main();
