const token = '16|MEsrrBrLwzwWDDjTycz26dk4fV13HcsVE8YzAxdzf4142c66';
const base = 'http://76.13.225.200:8000/api/v1';
const uuid = 'hgw0g4cg0888wgo800s848gs';

async function triggerDeploy() {
  console.log("Triggering deploy on Coolify for uuid:", uuid);

  // Try GET /deploy?uuid=...&force=true
  try {
    const resGet = await fetch(`${base}/deploy?uuid=${uuid}&force=true`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });
    console.log("GET /deploy response status:", resGet.status);
    const dataGet = await resGet.json();
    console.log("GET /deploy response data:", JSON.stringify(dataGet, null, 2));
  } catch (err) {
    console.error("GET /deploy error:", err);
  }

  // Try POST /deploy?uuid=...
  try {
    const resPost = await fetch(`${base}/deploy?uuid=${uuid}&force=true`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tag: 'main' })
    });
    console.log("POST /deploy response status:", resPost.status);
    const dataPost = await resPost.json();
    console.log("POST /deploy response data:", JSON.stringify(dataPost, null, 2));
  } catch (err) {
    console.error("POST /deploy error:", err);
  }
}

triggerDeploy().catch(console.error);
