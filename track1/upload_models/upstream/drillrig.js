const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net";

async function main() {
    const client = new DigitalTwinsClient(adtUrl, new DefaultAzureCredential());

    const model = [
        {
            "@id": "dtmi:industry:oilgas:upstream:DrillingRig;2",
            "@type": "Interface",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Drilling Rig",
            "description": "Upstream drilling rig with sensors mapped to WITSML standards",
            "contents": [
                { "@type": "Telemetry", "name": "torque", "schema": "double" },
                { "@type": "Telemetry", "name": "pressure", "schema": "double" },
                { "@type": "Telemetry", "name": "vibration", "schema": "double" },
                {
                    "@type": "Relationship",
                    "name": "Drills",
                    "target": "dtmi:industry:oilgas:upstream:Wellhead;1",
                    "properties": [
                        {
                            "@type": "Property",
                            "name": "createdOn",
                            "schema": "dateTime"
                        }
                    ]
                }
            ]
        }
    ];

    try {
        const result = await client.createModels(model);
        console.log("✅ DrillingRig model v2 created:", result);
    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") {
            console.log("ℹ DrillingRig v2 model already exists");
        } else {
            console.error("❌ Error:", err);
        }
    }
}

main();
