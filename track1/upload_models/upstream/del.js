//delate all models, twins,relations
 
const { DefaultAzureCredential } = require("@azure/identity");
const { DigitalTwinsClient } = require("@azure/digital-twins-core");
 
const adtUrl = "https://dig-twin.api.wcus.digitaltwins.azure.net"; // Your ADT hostname
 
async function deleteAllRelationships(client, twinId) {
  try {
    const relationshipsIterator = client.listRelationships(twinId);
 
    for await (const rel of relationshipsIterator) {
      await client.deleteRelationship(twinId, rel.$relationshipId);
      console.log(`Deleted relationship: ${rel.$relationshipId}`);
    }
  } catch (err) {
    console.warn(`⚠️ Error deleting relationships for ${twinId}:`, err.message);
  }
}
 
async function deleteAllTwins(client) {
  try {
    console.log("🔹 Deleting all twins...");
    const twinsIterator = client.queryTwins("SELECT * FROM digitaltwins");
 
    for await (const twin of twinsIterator) {
      await deleteAllRelationships(client, twin.$dtId);
      await client.deleteDigitalTwin(twin.$dtId);
      console.log(`Deleted twin: ${twin.$dtId}`);
    }
  } catch (err) {
    console.error("❌ Error deleting twins:", err);
  }
}
 
async function deleteAllModels(client) {
  try {
    console.log("🔹 Deleting all models...");
    const modelsIterator = client.listModels();
 
    for await (const model of modelsIterator) {
      await client.deleteModel(model.id);
      console.log(`Deleted model: ${model.id}`);
    }
  } catch (err) {
    console.error("❌ Error deleting models:", err);
  }
}
 
async function main() {
  const credential = new DefaultAzureCredential();
  const client = new DigitalTwinsClient(adtUrl, credential);
 
  try {
    await deleteAllTwins(client);
    await deleteAllModels(client);
    console.log("🎉 Deletion complete!");
  } catch (err) {
    console.error("❌ Error in deletion process:", err);
  }
}
 
main();