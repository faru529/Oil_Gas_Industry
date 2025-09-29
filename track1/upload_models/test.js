async function testTwin() {
  try {
    const twin = await adtClient.getDigitalTwin("refinery1");
    console.log("Twin exists:", twin);
  } catch (err) {
    console.error("Twin not found:", err.message);
  }
}

testTwin();
