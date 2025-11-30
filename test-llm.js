const http = require('http');

function testLLM(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/llm/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log(' Testing LLM Endpoint with OpenAI API Key...\n');

  const queries = [
    'Which Doctor had the most companions?',
    'What episodes featured the Daleks?',
    'List all enemies with threat level above 8'
  ];

  for (const query of queries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('─'.repeat(60));
    try {
      const result = await testLLM(query);
      if (result.error) {
        console.log(` Error: ${result.error}`);
      } else {
        console.log(` Response: ${result.answer || result.message || JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(` Request failed: ${error.message}`);
    }
  }
}

runTests();

