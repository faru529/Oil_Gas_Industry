const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net"; // Your ADT hostname

async function main() {
    const client = new DigitalTwinsClient(adtUrl, new DefaultAzureCredential());

    try {
        console.log("📡 Creating upstream twin instances...");

        // --- 1. Create DrillingRig twin (v2 model) ---
        const drillRigTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:upstream:DrillingRig;2" }
        };
        await client.upsertDigitalTwin("drillrig1", JSON.stringify(drillRigTwin), { ifNoneMatch: "*" });
        console.log("✅ DrillingRig twin created: drillrig1");

        // --- 2. Create Wellhead twin ---
        const wellheadTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:upstream:Wellhead;1" }
        };
        await client.upsertDigitalTwin("wellhead1", JSON.stringify(wellheadTwin), { ifNoneMatch: "*" });
        console.log("✅ Wellhead twin created: wellhead1");

        // --- 3. Create Drills relationship ---
        const relationshipId = "drills-rel-1"; // unique relationship ID
        const relationship = {
            $relationshipId: relationshipId,
            $sourceId: "drillrig1",
            $relationshipName: "Drills",
            $targetId: "wellhead1",
            createdOn: new Date().toISOString() // matches the relationship property in model
        };

        await client.upsertRelationship("drillrig1", relationshipId, relationship);
        console.log("✅ Relationship 'Drills' created between drillrig1 and wellhead1");

    } catch (err) {
        console.error("❌ Error creating upstream twins or relationship:", err);
    }
}

main();
