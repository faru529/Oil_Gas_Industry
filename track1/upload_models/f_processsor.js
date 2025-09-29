const { EventHubConsumerClient } = require("@azure/event-hubs");
const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");
const { MongoClient } = require("mongodb");

// --- CONFIGURATION ---
const eventHubConnectionString = "Endpoint=sb://iothub-ns-iothub1far-67004921-0cbdc6f2ef.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=5UeuEevHXsKfryNjq9a26bTvLS0cjf0ANAIoTCiStWs=;EntityPath=iothub1far";
const eventHubName = "iothub1far";
const consumerGroup = "$Default";

const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net";
const mongoUrl = "mongodb://localhost:27017";
const dbName = "digitalTwinsTelemetryDB";

// --- INITIALIZE CLIENTS ---
const credential = new DefaultAzureCredential();
const adtClient = new DigitalTwinsClient(adtUrl, credential);
const mongoClient = new MongoClient(mongoUrl);

async function main() {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);

    console.log("✅ Connected to MongoDB");

    const consumerClient = new EventHubConsumerClient(
        consumerGroup,
        eventHubConnectionString,
        eventHubName
    );

    console.log("📡 Listening for IoT Hub telemetry...");

    consumerClient.subscribe({
        processEvents: async (events) => {
            for (const event of events) {
                try {
                    const body = event.body;
                    const twinId = body.twinId;

                    console.log("Telemetry received:", body);

                    if (!twinId) {
                        console.error("❌ No twinId in telemetry, skipping...");
                        continue;
                    }

                    // --- Update Digital Twin ---
                    const patch = [];
                    for (const key of Object.keys(body)) {
                        if (key !== "twinId" && key !== "ts") {
                            patch.push({ op: "add", path: `/${key}`, value: body[key] });
                        }
                    }

                    if (patch.length > 0) {
                        await adtClient.updateDigitalTwin(twinId, patch);
                        console.log(`✅ Digital Twin updated: ${twinId}`);
                    }

                    // --- Store in MongoDB in per-twin collection ---
                    const twinCollection = db.collection(twinId); // collection named after twinId
                    await twinCollection.insertOne(body);
                    console.log(`💾 Telemetry stored in MongoDB collection: ${twinId}`);
                } catch (err) {
                    console.error("❌ Error processing telemetry:", err.message);
                }
            }
        },
        processError: async (err) => {
            console.error("❌ Error in Event Hub subscription:", err.message);
        }
    });
}

main().catch(err => console.error(err));
