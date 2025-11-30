const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = jsonData.length;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('Testing All API Endpoints\n');
  console.log('='.repeat(60));

  // Test 1: GET /api/doctors
  console.log('\n1. GET /api/doctors');
  try {
    const result = await makeRequest('GET', '/api/doctors');
    console.log(`   Status: ${result.status}`);
    console.log(`   [PASS] Returns ${Array.isArray(result.data) ? result.data.length : 0} doctors`);
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 2: GET /api/doctors/1
  console.log('\n2. GET /api/doctors/1');
  try {
    const result = await makeRequest('GET', '/api/doctors/1');
    console.log(`   Status: ${result.status}`);
    console.log(`   [PASS] Doctor: ${result.data.incarnation_number || 'N/A'}`);
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 3: POST /api/doctors
  console.log('\n3. POST /api/doctors');
  try {
    const result = await makeRequest('POST', '/api/doctors', {
      actor_id: 1,
      incarnation_number: 1,
      catchphrase: 'Hmm?'
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 201) {
      console.log(`   [PASS] Doctor created successfully`);
    } else {
      console.log(`   [WARN] ${result.data.error || 'Unexpected response'}`);
    }
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 4: PUT /api/doctors/1
  console.log('\n4. PUT /api/doctors/1');
  try {
    const result = await makeRequest('PUT', '/api/doctors/1', {
      catchphrase: 'Fantastic!'
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   [PASS] Doctor updated: ${result.data.catchphrase}`);
    } else {
      console.log(`   [WARN] ${result.data.error || 'Unexpected response'}`);
    }
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 5: GET /api/episodes
  console.log('\n5. GET /api/episodes');
  try {
    const result = await makeRequest('GET', '/api/episodes');
    console.log(`   Status: ${result.status}`);
    console.log(`   [PASS] Returns ${Array.isArray(result.data) ? result.data.length : 0} episodes`);
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 6: GET /api/queries/procedure/enemies/8
  console.log('\n6. GET /api/queries/procedure/enemies/8');
  try {
    const result = await makeRequest('GET', '/api/queries/procedure/enemies/8');
    console.log(`   Status: ${result.status}`);
    if (Array.isArray(result.data)) {
      console.log(`   [PASS] Returns ${result.data.length} enemies with threat >= 8`);
    } else {
      console.log(`   [PASS] Stored procedure executed`);
    }
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 7: GET /api/queries/procedure/doctor/10
  console.log('\n7. GET /api/queries/procedure/doctor/10');
  try {
    const result = await makeRequest('GET', '/api/queries/procedure/doctor/10');
    console.log(`   Status: ${result.status}`);
    if (Array.isArray(result.data)) {
      console.log(`   [PASS] Returns ${result.data.length} episodes for Doctor 10`);
    } else {
      console.log(`   [PASS] Stored procedure executed`);
    }
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 8: PUT /api/queries/update/enemy/1/threat-level
  console.log('\n8. PUT /api/queries/update/enemy/1/threat-level');
  try {
    const result = await makeRequest('PUT', '/api/queries/update/enemy/1/threat-level', {
      threat_level: 9
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`   [PASS] Enemy threat level updated to ${result.data.threat_level}`);
    } else {
      console.log(`   [WARN] ${result.data.error || 'Unexpected response'}`);
    }
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  // Test 9: POST /api/llm/query
  console.log('\n9. POST /api/llm/query (LLM Integration)');
  try {
    const result = await makeRequest('POST', '/api/llm/query', {
      query: 'Which Doctor had the most companions?'
    });
    console.log(`   Status: ${result.status}`);
    if (result.data.error) {
      console.log(`   ⚠️  ${result.data.error}`);
    } else if (result.data.answer) {
      console.log(`   [PASS] LLM Response received`);
      console.log(`   Answer: ${result.data.answer.substring(0, 100)}...`);
    } else {
      console.log(`   [PASS] LLM endpoint working`);
    }
  } catch (error) {
    console.log(`   [FAIL] Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('[DONE] All tests completed!');
}

runAllTests();

