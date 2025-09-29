// createTwinsAndRelationships.js (corrected)
const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net";

async function main() {
    const client = new DigitalTwinsClient(adtUrl, new DefaultAzureCredential());

    try {
        // ----------------- UPSTREAM -----------------
        // NOTE: telemetry (torque/pressure/vibration) is NOT included here.
        const drillRigTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:upstream:DrillingRig;2" }
        };
        await client.upsertDigitalTwin("drillrig1", JSON.stringify(drillRigTwin));

        const wellheadTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:upstream:Wellhead;1" }
        };
        await client.upsertDigitalTwin("wellhead1", JSON.stringify(wellheadTwin));

        await client.upsertRelationship("drillrig1", "drillrig1-wellhead1", {
            $relationshipId: "drillrig1-wellhead1",
            $sourceId: "drillrig1",
            $relationshipName: "Drills",
            $targetId: "wellhead1",
            createdOn: new Date().toISOString()
        });

        // ----------------- MIDSTREAM -----------------
        const pipelineTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:midstream:PipelineSegment;1" }
        };
        await client.upsertDigitalTwin("pipeline1", JSON.stringify(pipelineTwin));

        // status is a Property in your schema, so it's OK to set here.
        const compressorTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:midstream:CompressorStation;1" },
            //status: false
        };
        await client.upsertDigitalTwin("compressor1", JSON.stringify(compressorTwin));

        await client.upsertRelationship("pipeline1", "pipeline1-compressor1", {
            $relationshipId: "pipeline1-compressor1",
            $sourceId: "pipeline1",
            $relationshipName: "ConnectedTo",
            $targetId: "compressor1",
            createdOn: new Date().toISOString()
        });

        // ----------------- DOWNSTREAM -----------------
        const refineryTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:downstream:RefineryUnit;1" }
        };
        await client.upsertDigitalTwin("refinery1", JSON.stringify(refineryTwin));

        const retailTwin = {
            $metadata: { $model: "dtmi:industry:oilgas:downstream:RetailStation;1" }
        };
        await client.upsertDigitalTwin("retail1", JSON.stringify(retailTwin));

        await client.upsertRelationship("refinery1", "refinery1-retail1", {
            $relationshipId: "refinery1-retail1",
            $sourceId: "refinery1",
            $relationshipName: "Supplies",
            $targetId: "retail1",
            createdOn: new Date().toISOString()
        });

        // ----------------- POWER GENERATION -----------------
        const turbineTwin = {
            $metadata: { $model: "dtmi:industry:power:GasTurbine;1" }
        };
        await client.upsertDigitalTwin("turbine1", JSON.stringify(turbineTwin));

        const transformerTwin = {
            $metadata: { $model: "dtmi:industry:power:Transformer;1" }
        };
        await client.upsertDigitalTwin("transformer1", JSON.stringify(transformerTwin));

        await client.upsertRelationship("turbine1", "turbine1-transformer1", {
            $relationshipId: "turbine1-transformer1",
            $sourceId: "turbine1",
            $relationshipName: "SuppliesPowerTo",
            $targetId: "transformer1",
            createdOn: new Date().toISOString()
        });

        console.log("✅ Twins and relationships created successfully");
    } catch (err) {
        console.error("❌ Error creating twins or relationships:", err);
    }
}

main();
