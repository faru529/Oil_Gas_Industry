// list_all.js
const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");
 
//const adtUrl = "https://rakdtwin1.api.eus.digitaltwins.azure.net";
//const adtUrl = "https://digitaldwinrak1.api.eus.digitaltwins.azure.net";
const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net";
 
const credential = new DefaultAzureCredential();
const client = new DigitalTwinsClient(adtUrl, credential);
 
async function listModels() {
  console.log("📋 Listing all models in ADT...");
  try {
    const models = client.listModels();
    for await (const model of models) {
      console.log(`👉 ${model.id}`);
    }
  } catch (err) {
    console.error("❌ Error listing models:", err);
  }
}
 
async function listTwins() {
  console.log("\n📋 Listing all twins in ADT...");
  try {
    const query = "SELECT * FROM digitaltwins";
    const twins = client.queryTwins(query);
    for await (const twin of twins) {
      console.log(`👉 Twin ID: ${twin.$dtId}, Model: ${twin.$metadata.$model}`);
    }
  } catch (err) {
    console.error("❌ Error listing twins:", err);
  }
}
 
async function listRelationships() {
  console.log("\n📋 Listing all relationships for each twin...");
  try {
    const query = "SELECT * FROM digitaltwins";
    const twins = client.queryTwins(query);
    for await (const twin of twins) {
      const rels = client.listRelationships(twin.$dtId);
      for await (const rel of rels) {
        console.log(`👉 Relationship ID: ${rel.$relationshipId}`);
        console.log(`   Name: ${rel.$relationshipName}`);
        console.log(`   Source: ${rel.$sourceId}`);
        console.log(`   Target: ${rel.$targetId}`);
        if (Object.keys(rel).length > 0) {
          const props = { ...rel };
          delete props.$relationshipId;
          delete props.$relationshipName;
          delete props.$sourceId;
          delete props.$targetId;
          if (Object.keys(props).length > 0) console.log(`   Properties: ${JSON.stringify(props)}`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error listing relationships:", err);
  }
}
 
async function main() {
  await listModels();
  await listTwins();
  await listRelationships();
}
 
main();