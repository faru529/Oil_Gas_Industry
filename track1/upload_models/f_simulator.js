const { Client, Message } = require("azure-iot-device");
const { Amqp } = require("azure-iot-device-amqp");

// Replace with your IoT Hub device connection string
const connString = "HostName={iothub_name}.azure-devices.net;DeviceId={device id};SharedAccessKey........=";

const client = Client.fromConnectionString(connString, Amqp);

client.open((err) => {
    if (err) {
        console.error("❌ Error connecting to IoT Hub:", err.message);
        return;
    }
    console.log("✅ Connected to Azure IoT Hub");

    setInterval(() => {
        const telemetryBatch = [];

        // Helper: 10% chance of anomaly (spike or drop)
        const addAnomaly = (normalValue, range) => {
            if (Math.random() < 0.1) { // 10% chance
                return Math.random() < 0.5 
                    ? normalValue * 1.8  // 80% spike
                    : normalValue * 0.3; // 70% drop
            }
            return normalValue;
        };

        // ----------------- UPSTREAM -----------------
        telemetryBatch.push({
            twinId: "drillrig1",
            torque: parseFloat(addAnomaly(50 + Math.random() * 100, 100).toFixed(2)),
            pressure: parseFloat(addAnomaly(10 + Math.random() * 50, 50).toFixed(2)),
            vibration: parseFloat(addAnomaly(20 + Math.random() * 80, 80).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "wellhead1",
            pressure: parseFloat(addAnomaly(10 + Math.random() * 50, 50).toFixed(2)),
            temperature: parseFloat(addAnomaly(50 + Math.random() * 50, 50).toFixed(2)),
            flowRate: parseFloat(addAnomaly(100 + Math.random() * 400, 400).toFixed(2)),
            ts: new Date().toISOString()
        });

        // ----------------- MIDSTREAM -----------------
        telemetryBatch.push({
            twinId: "pipeline1",
            pressure: parseFloat(addAnomaly(10 + Math.random() * 50, 50).toFixed(2)),
            flowRate: parseFloat(addAnomaly(100 + Math.random() * 400, 400).toFixed(2)),
            temperature: parseFloat(addAnomaly(50 + Math.random() * 50, 50).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "compressor1",
            status: Math.random() > 0.5,
            energyConsumption: parseFloat(addAnomaly(100 + Math.random() * 900, 900).toFixed(2)),
            ts: new Date().toISOString()
        });

        // ----------------- DOWNSTREAM -----------------
        telemetryBatch.push({
            twinId: "refinery1",
            temperature: parseFloat(addAnomaly(50 + Math.random() * 50, 50).toFixed(2)),
            pressure: parseFloat(addAnomaly(10 + Math.random() * 50, 50).toFixed(2)),
            throughput: parseFloat(addAnomaly(100 + Math.random() * 400, 400).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "retail1",
            fuelInventory: parseFloat(addAnomaly(5000 + Math.random() * 5000, 5000).toFixed(2)),
            sales: parseFloat(addAnomaly(100 + Math.random() * 500, 500).toFixed(2)),
            ts: new Date().toISOString()
        });

        // ----------------- POWER GENERATION -----------------
        telemetryBatch.push({
            twinId: "turbine1",
            temperature: parseFloat(addAnomaly(50 + Math.random() * 100, 100).toFixed(2)),
            pressure: parseFloat(addAnomaly(10 + Math.random() * 50, 50).toFixed(2)),
            vibration: parseFloat(addAnomaly(20 + Math.random() * 80, 80).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "transformer1",
            voltage: parseFloat(addAnomaly(110 + Math.random() * 10, 10).toFixed(2)),
            current: parseFloat(addAnomaly(5 + Math.random() * 20, 20).toFixed(2)),
            ts: new Date().toISOString()
        });

        // Send all telemetry to IoT Hub
        telemetryBatch.forEach((telemetry) => {
            const msg = new Message(JSON.stringify(telemetry));
            console.log("📡 Sending telemetry:", telemetry);

            client.sendEvent(msg, (err) => {
                if (err) console.error("❌ Error sending telemetry:", err.message);
                else console.log(`✅ Telemetry sent for twin: ${telemetry.twinId}`);
            });
        });

    }, 10000); // every 10 seconds
});
