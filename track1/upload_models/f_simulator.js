const { Client, Message } = require("azure-iot-device");
const { Amqp } = require("azure-iot-device-amqp");

// Replace with your IoT Hub device connection string
const connString = "HostName=iothub1far.azure-devices.net;DeviceId=deviceID;SharedAccessKey=/C2zLPCLk2nQxK8+9lN/ermbZUKhQvqWIv92TVUYWVY=";

const client = Client.fromConnectionString(connString, Amqp);

client.open((err) => {
    if (err) {
        console.error("❌ Error connecting to IoT Hub:", err.message);
        return;
    }
    console.log("✅ Connected to Azure IoT Hub");

    setInterval(() => {
        const telemetryBatch = [];

        // ----------------- UPSTREAM -----------------
        telemetryBatch.push({
            twinId: "drillrig1",
            torque: parseFloat((50 + Math.random() * 100).toFixed(2)),
            pressure: parseFloat((10 + Math.random() * 50).toFixed(2)),
            vibration: parseFloat((20 + Math.random() * 80).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "wellhead1",
            pressure: parseFloat((10 + Math.random() * 50).toFixed(2)),
            temperature: parseFloat((50 + Math.random() * 50).toFixed(2)),
            flowRate: parseFloat((100 + Math.random() * 400).toFixed(2)),
            ts: new Date().toISOString()
        });

        // ----------------- MIDSTREAM -----------------
        telemetryBatch.push({
            twinId: "pipeline1",
            pressure: parseFloat((10 + Math.random() * 50).toFixed(2)),
            flowRate: parseFloat((100 + Math.random() * 400).toFixed(2)),
            temperature: parseFloat((50 + Math.random() * 50).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "compressor1",
            status: Math.random() > 0.5,
            energyConsumption: parseFloat((100 + Math.random() * 900).toFixed(2)),
            ts: new Date().toISOString()
        });

        // ----------------- DOWNSTREAM -----------------
        telemetryBatch.push({
            twinId: "refinery1",
            temperature: parseFloat((50 + Math.random() * 50).toFixed(2)),
            pressure: parseFloat((10 + Math.random() * 50).toFixed(2)),
            throughput: parseFloat((100 + Math.random() * 400).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "retail1",
            fuelInventory: parseFloat((5000 + Math.random() * 5000).toFixed(2)),
            sales: parseFloat((100 + Math.random() * 500).toFixed(2)),
            ts: new Date().toISOString()
        });

        // ----------------- POWER GENERATION -----------------
        telemetryBatch.push({
            twinId: "turbine1",
            temperature: parseFloat((50 + Math.random() * 100).toFixed(2)),
            pressure: parseFloat((10 + Math.random() * 50).toFixed(2)),
            vibration: parseFloat((20 + Math.random() * 80).toFixed(2)),
            ts: new Date().toISOString()
        });

        telemetryBatch.push({
            twinId: "transformer1",
            voltage: parseFloat((110 + Math.random() * 10).toFixed(2)),
            current: parseFloat((5 + Math.random() * 20).toFixed(2)),
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

    }, 5000); // every 5 seconds
});
