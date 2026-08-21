const token = '16|MEsrrBrLwzwWDDjTycz26dk4fV13HcsVE8YzAxdzf4142c66';
const base = 'http://76.13.225.200:8000/api/v1';
const depUuid = 'h8448s08scw4w0kksw8gs4wk';

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
        logs_count: data.logs?.length || 0,
        updated_at: data.updated_at
      }, null, 2));
      if (data.logs && data.logs.length > 0) {
        console.log("Last 5 logs:\n", data.logs.slice(-5).join("\n"));
      }
    } else {
      console.log("Error body:", await res.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkStatus().catch(console.error);
