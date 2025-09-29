const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net";

async function main() {
    const client = new DigitalTwinsClient(adtUrl, new DefaultAzureCredential());

    const relationshipModel = [
        {
            "@id": "dtmi:industry:oilgas:upstream:Drills;1",
            "@type": "Relationship",
            "@context": "dtmi:dtdl:context;2",
            "displayName": "Drills",
            "source": "dtmi:industry:oilgas:upstream:DrillingRig;1",
            "target": "dtmi:industry:oilgas:upstream:Wellhead;1"
        }
    ];

    try {
        const result = await client.createModels(relationshipModel);
        console.log("✅ Upstream relationship created:", result);
    } catch (err) {
        if (err.code === "ModelIdAlreadyExists") console.log("ℹ Relationship already exists");
        else console.error("❌ Error:", err);
    }
}

main();
