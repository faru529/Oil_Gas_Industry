const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net";

async function main() {
    const client = new DigitalTwinsClient(adtUrl, new DefaultAzureCredential());

    const model = [
       
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
    ];

    try {
        const result = await client.createModels(model);
        console.log("✅ Wellhead model created:", result);
    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") console.log("ℹ It already exists");
        else console.error("❌ Error:", err);
    }
}

main();
