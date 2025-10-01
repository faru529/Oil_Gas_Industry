const { EventHubConsumerClient } = require("@azure/event-hubs");
const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");
const { MongoClient } = require("mongodb");

// --- IoT Hub Event Hub consumer ---
const eventHubConnectionString =
  "Endpoint=sb://iothub-ns-iothub79-67005161-834729fdfe.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=Hrb6TzOo7QuLYC4b+Oe723lOa3QC04Cp4AIoTA46Kdc=;EntityPath=iothub79";
const eventHubName = "iothub79";
const consumerGroup = "$Default";

// --- ADT connection ---
const adtUrl = "https://oilgasADT.api.wcus.digitaltwins.azure.net";
const credential = new DefaultAzureCredential();
const adtClient = new DigitalTwinsClient(adtUrl, credential);

// --- MongoDB connection ---
const mongoUri = "mongodb://localhost:27017";
const mongoClient = new MongoClient(mongoUri);

// --- Mapping of modelId → DB + Collection ---
const mapping = {
  "upstream-drillingRig": { db: "upstream_db", collection: "drillingRig" },
  "upstream-wellhead": { db: "upstream_db", collection: "wellhead" },
  "midstream-pipelineSegment": { db: "midstream_db", collection: "pipelineSegments" },
  "midstream-compressorStation": { db: "midstream_db", collection: "compressorStations" },
  "downstream-refineryUnit": { db: "downstream_db", collection: "refineryUnits" },
  "downstream-retailStation": { db: "downstream_db", collection: "retailStations" },
  "power-gasTurbine": { db: "power_db", collection: "gasTurbine" },
  "power-transformer": { db: "power_db", collection: "transformer" },
};

// --- Update ADT twin ---
async function updateTwin(twinId, telemetry) {
  const patch = [];
  Object.keys(telemetry).forEach((key) => {
    if (!["deviceId", "modelId", "timestamp"].includes(key)) {
      patch.push({ op: "replace", path: `/${key}`, value: telemetry[key] });
    }
  });

  if (patch.length > 0) {
    try {
      await adtClient.updateDigitalTwin(twinId, patch);
      console.log(`✅ Twin '${twinId}' updated with`, patch);
    } catch (err) {
      console.error(`❌ Error updating twin ${twinId}:`, err.message);
    }
  }
}

// --- Store telemetry in MongoDB ---
async function storeTelemetry(telemetry) {
  const { modelId, deviceId, timestamp } = telemetry;
  const map = mapping[modelId];

  if (!map) {
    console.warn(`⚠️ No mapping found for modelId: ${modelId}`);
    return;
  }

  const dataToInsert = {
    twinId: deviceId,
    timestamp: new Date(timestamp),
    ...telemetry,
  };

  try {
    await mongoClient.db(map.db).collection(map.collection).insertOne(dataToInsert);
    console.log(`📥 Stored telemetry in ${map.db}.${map.collection}`);
  } catch (err) {
    console.error("❌ MongoDB insert error:", err.message);
  }
}

// --- EventHub consumer ---
async function main() {
  await mongoClient.connect();
  console.log("✅ Connected to MongoDB");
  console.log("Listening for IoT Hub telemetry...");

  const consumerClient = new EventHubConsumerClient(
    consumerGroup,
    eventHubConnectionString,
    eventHubName
  );

  consumerClient.subscribe({
    processEvents: async (events, context) => {
      for (const event of events) {
        try {
          const body = event.body;

          // Device ID / twin ID
          const twinId = body.deviceId;
          if (!twinId) {
            console.warn("⚠️ Telemetry without deviceId field, skipping:", body);
            continue;
          }

          console.log(`Telemetry from ${twinId}:`, body);

          // 1️⃣ Update ADT twin
          await updateTwin(twinId, body);

          // 2️⃣ Store in MongoDB
          await storeTelemetry(body);
        } catch (err) {
          console.error("❌ Error processing event:", err.message);
        }
      }
    },
    processError: async (err, context) => {
      console.error("❌ Error in EventHub subscription:", err.message);
    },
  });
}

main().catch((err) => console.error("Fatal error:", err.message));