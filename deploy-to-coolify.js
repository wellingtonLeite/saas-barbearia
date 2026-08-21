const force = process.argv.includes('--force') || process.argv.includes('force=true');
const uuid = 'hgw0g4cg0888wgo800s848gs';
const token = '16|MEsrrBrLwzwWDDjTycz26dk4fV13HcsVE8YzAxdzf4142c66';
const url = `http://76.13.225.200:8000/api/v1/deploy?uuid=${uuid}&force=${force}`;

async function triggerDeploy() {
  console.log(`[DevOps] Disparando deploy para a aplicação ${uuid} (force=${force})...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uuid, force })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Deploy enfileirado com sucesso no Coolify!');
      console.log('Detalhes:', JSON.stringify(data, null, 2));
    } else {
      console.error(`❌ Erro ao acionar deploy (${response.status}):`, await response.text());
    }
  } catch (error) {
    console.error('❌ Falha na requisição ao Coolify:', error.message);
  }
}

triggerDeploy();

