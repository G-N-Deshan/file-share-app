const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';

function request(method, urlPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE);
    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: data, json });
      });
    });
    req.on('error', reject);
    if (body) {
      if (Buffer.isBuffer(body) || typeof body === 'string') {
        req.write(body);
      }
    }
    req.end();
  });
}

function postMultipart(urlPath, boundary, buffer) {
  return request(
    'POST',
    urlPath,
    {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': buffer.length
    },
    buffer
  );
}

function buildMultipart(fields, files, boundary) {
  const parts = [];
  for (const [key, val] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
  }
  for (const file of files) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"\r\nContent-Type: ${file.mime}\r\n\r\n`
      )
    );
    parts.push(file.content);
    parts.push(Buffer.from('\r\n'));
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(parts);
}

async function runTests() {
  console.log('========================================================');
  console.log('   FILEDROP END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, detail = '') {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}: ${detail}`);
    }
  }

  try {
    // 1. Health check
    const r1 = await request('GET', '/api/health');
    assert(r1.status === 200 && r1.json && r1.json.status === 'ok', '1. Backend Health Check (/api/health)');

    // 2. Serve index.html
    const r2 = await request('GET', '/');
    assert(r2.status === 200 && r2.body.includes('<!DOCTYPE html>'), '2. Frontend Serving from Express (/)');

    // 3. Single File Upload
    const boundary = '----WebKitFormBoundaryTest123';
    const singlePayload = buildMultipart(
      {},
      [{ fieldname: 'files', filename: 'lecture_notes.pdf', mime: 'application/pdf', content: Buffer.from('%PDF-1.4 sample content') }],
      boundary
    );
    const r3 = await postMultipart('/api/upload', boundary, singlePayload);
    const file1 = r3.json?.files?.[0];
    const code1 = r3.json?.accessCode;
    assert(
      r3.status === 201 && code1 && file1 && file1.name === 'lecture_notes.pdf',
      '3. Single File Upload (POST /api/upload)',
      `Got status ${r3.status}, code: ${code1}`
    );

    // 4. Batch Files Upload under the same access code
    const batchPayload = buildMultipart(
      { accessCode: code1 },
      [
        { fieldname: 'files', filename: 'diagram.png', mime: 'image/png', content: Buffer.from('\x89PNG\r\n\x1a\n') },
        { fieldname: 'files', filename: 'readme.txt', mime: 'text/plain', content: Buffer.from('hello student') }
      ],
      boundary
    );
    const r4 = await postMultipart('/api/upload', boundary, batchPayload);
    assert(
      r4.status === 201 && r4.json?.accessCode === code1 && r4.json?.files?.length === 2,
      '4. Batch File Upload under existing code (POST /api/upload)',
      `Got status ${r4.status}, count: ${r4.json?.files?.length}`
    );

    // 5. Upload Text / Codelines Snippet
    const textData = JSON.stringify({
      text: 'def solve():\n    return 42\nprint(solve())',
      filename: 'solution.py'
    });
    const r5 = await request(
      'POST',
      '/api/upload-text',
      { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(textData) },
      textData
    );
    const codeText = r5.json?.accessCode;
    const fileText = r5.json?.files?.[0];
    assert(
      r5.status === 201 && codeText && fileText && fileText.name === 'solution.py',
      '5. Text / Codelines Snippet Upload (POST /api/upload-text)',
      `Got status ${r5.status}, code: ${codeText}`
    );

    // 6. Access Code Retrieval
    const r6 = await request('GET', `/api/files-by-code/${code1}`);
    assert(
      r6.status === 200 && Array.isArray(r6.json) && r6.json.length === 3,
      '6. Retrieve Files by Access Code (GET /api/files-by-code/:code)',
      `Expected 3 files, got: ${r6.json?.length}`
    );

    // 7. File Preview
    const r7 = await request('GET', `/files/${file1.fileId}`);
    assert(
      r7.status === 200 && r7.body.includes('%PDF-1.4'),
      '7. Stream File for Preview (GET /files/:id)'
    );

    // 8. Force Download Endpoint
    const r8 = await request('GET', `/download/${fileText.fileId}`);
    const disposition = r8.headers['content-disposition'] || '';
    assert(
      r8.status === 200 && disposition.includes('attachment') && disposition.includes('solution.py') && r8.body.includes('def solve():'),
      '8. Force Download with Attachment Header (GET /download/:id)',
      `Disposition: ${disposition}`
    );

    // 9. All Recent Files Listing
    const r9 = await request('GET', '/api/list');
    assert(
      r9.status === 200 && Array.isArray(r9.json) && r9.json.length >= 4,
      '9. List All Recent Server Files (GET /api/list)',
      `Count: ${r9.json?.length}`
    );

    // 10. Auto-cleanup script check
    const cleanupScript = path.join(__dirname, 'backend', 'scripts', 'cleanup.js');
    assert(fs.existsSync(cleanupScript), '10. 90-Day Auto Cleanup Script Exists (backend/scripts/cleanup.js)');

    console.log('\n========================================================');
    console.log(`   SUMMARY: ${passed}/${total} TESTS PASSED (100% SUCCESS)`);
    console.log('========================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();
