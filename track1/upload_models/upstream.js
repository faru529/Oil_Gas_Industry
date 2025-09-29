const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net"; // Replace with your ADT hostname

async function main() {
    const credential = new DefaultAzureCredential();
    const client = new DigitalTwinsClient(adtUrl, credential);

    try {
        console.log("📡 Uploading Upstream models...");

        const upstreamModels = [
            {
                "@id": "dtmi:industry:oilgas:upstream:DrillingRig;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Drilling Rig",
                "description": "Upstream drilling rig with sensors mapped to WITSML standards",
                "contents": [
                    { "@type": "Telemetry", "name": "torque", "schema": "double",  },//"unit": "N.m"
                    { "@type": "Telemetry", "name": "pressure", "schema": "double",  },//"unit": "bar"
                    { "@type": "Telemetry", "name": "vibration", "schema": "double", } //"unit": "Hz"
                ]
            },
            {
                "@id": "dtmi:industry:oilgas:upstream:Wellhead;1",
                "@type": "Interface",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Wellhead",
                "description": "Wellhead properties aligned with WITSML standards",
                "contents": [
                    { "@type": "Telemetry", "name": "pressure", "schema": "double",  },//"unit": "bar"
                    { "@type": "Telemetry", "name": "temperature", "schema": "double", },//"unit": "°C" 
                    { "@type": "Telemetry", "name": "flowRate", "schema": "double", }//"unit": "m3/h" 
                ]
            },
            {
                "@id": "dtmi:industry:oilgas:upstream:Drills;1",
                "@type": "Relationship",
                "@context": "dtmi:dtdl:context;2",
                "displayName": "Drills",
                "source": "dtmi:industry:oilgas:upstream:DrillingRig;1",
                "target": "dtmi:industry:oilgas:upstream:Wellhead;1"
            }
        ];

        const result = await client.createModels(upstreamModels);
        console.log("✅ Upstream models created:", JSON.stringify(result, null, 2));

    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") {
            console.log("ℹ Models already exist, skipping upload.");
        } else {
            console.error("❌ Error:", err);
        }
    }
}

main();
