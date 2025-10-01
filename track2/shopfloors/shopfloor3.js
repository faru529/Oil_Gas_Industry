const mqtt = require("mqtt");

const SHOPFLOOR_NAME = "Shopfloor-3";
const MQTT_BROKER = "mqtt://localhost:1883";

const client = mqtt.connect(MQTT_BROKER);

let currentOrders = [];

client.on("connect", () => {
  console.log(`✅ ${SHOPFLOOR_NAME} connected to MQTT broker`);
  client.subscribe(`${SHOPFLOOR_NAME}/instruction`, (err) => {
    if (err) console.error(`${SHOPFLOOR_NAME} subscribe error:`, err);
  });

  // Send heartbeat every 10 seconds
  setInterval(() => {
    const heartbeat = {
      shopfloor: SHOPFLOOR_NAME,
      timestamp: new Date().toISOString(),
      status: "online"
    };
    client.publish("shopfloor/heartbeat", JSON.stringify(heartbeat));
    console.log(`💓 ${SHOPFLOOR_NAME} heartbeat sent`);
  }, 10000);
});

client.on("message", (topic, message) => {
  if (topic === `${SHOPFLOOR_NAME}/instruction`) {
    try {
      const instruction = JSON.parse(message.toString());
      console.log(`\n📥 ${SHOPFLOOR_NAME} received instruction:`, instruction);

      // Simulate production
      currentOrders.push(instruction);
      processOrder(instruction);
    } catch (err) {
      console.error(`${SHOPFLOOR_NAME} error parsing instruction:`, err);
    }
  }
});

function processOrder(instruction) {
  const { OrderID, Assigned } = instruction;
  
  console.log(`🔨 ${SHOPFLOOR_NAME} starting production for ${OrderID}...`);

  // Simulate production time (5-15 seconds)
  const productionTime = 5000 + Math.random() * 10000;

  setTimeout(() => {
    // Simulate production with 5-10% defect rate
    const defectRate = 0.05 + Math.random() * 0.05;
    const produced = Assigned;
    const defective = Math.floor(produced * defectRate);

    const report = {
      OrderID,
      Shopfloor: SHOPFLOOR_NAME,
      Assigned,
      Produced: produced,
      Defective: defective,
      Status: "Completed"
    };

    client.publish("shopfloor/report", JSON.stringify(report));
    console.log(`✅ ${SHOPFLOOR_NAME} completed order ${OrderID}:`, report);

    // Remove from current orders
    currentOrders = currentOrders.filter(o => o.OrderID !== OrderID);
  }, productionTime);
}

client.on("error", (err) => {
  console.error(`${SHOPFLOOR_NAME} MQTT error:`, err);
});

console.log(`🏭 ${SHOPFLOOR_NAME} simulator started`);
console.log(`Waiting for production orders...`);
