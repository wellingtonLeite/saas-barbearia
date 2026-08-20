const url = 'http://76.13.225.200:8000/api/v1/deploy?uuid=hgw0g4cg0888wgo800s848gs&force=false';
const token = '16|MEsrrBrLwzwWDDjTycz26dk4fV13HcsVE8YzAxdzf4142c66';

fetch(url, {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
})
.then(async r => {
  if(r.ok) console.log('? Deploy iniciado com sucesso!');
  else console.log('? Erro tentando acionar:', r.status, await r.text());
});
