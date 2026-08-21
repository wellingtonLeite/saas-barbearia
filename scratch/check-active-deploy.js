const token = '16|MEsrrBrLwzwWDDjTycz26dk4fV13HcsVE8YzAxdzf4142c66';
const base = 'http://76.13.225.200:8000/api/v1';
const depUuid = 'wkok88wswkowo0og4c004c4o';

async function checkStatus() {
  try {
    const res = await fetch(`${base}/deployments/${depUuid}`, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });
    console.log("Deployment status code:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Deployment details:", JSON.stringify({
        status: data.status,
        commit: data.commit,
        current_process_id: data.current_process_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        finished_at: data.finished_at
      }, null, 2));
      if (data.logs) {
        console.log("LOGS:\n", data.logs.slice(-1000));
      }
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkStatus().catch(console.error);
