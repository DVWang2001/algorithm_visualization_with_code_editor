const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/monaco', express.static(require('path').join(__dirname, 'node_modules/monaco-editor/min')));
app.use(express.static('public'));

app.get('/default-code', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/default.cpp'));
});

const redis = new Redis({ host: 'redis', port: 6379 }); // 連接 redis 容器，注意 hostname 與你docker-compose設定相同

app.post('/run', async (req, res) => {
  const code = req.body.code;
  const jobId = uuidv4();

  try {
    // 將code與jobId打包成json字串推入 code_queue
    const encodedCode = Buffer.from(code, 'utf-8').toString('base64');
    await redis.rpush('code_queue', JSON.stringify({ jobId, code: encodedCode }));

    // 等待gcc container的回傳結果，監聽result_queue (設timeout防止永遠等)
    const timeoutMs = 10000; // 10秒timeout
    const startTime = Date.now();

    async function waitResult() {
      const reply = await redis.blpop('result_queue', 1);
      if (reply) {
        let data = JSON.parse(reply[1]);
        const decodedOutput = Buffer.from(data.output, 'base64').toString('utf-8');
        if (data.jobId === jobId) {
          console.log(`目標id:${jobId}`)
          console.log(`目標id:${data.jobId}`)
          console.log(`得到結果${decodedOutput}`)
          return decodedOutput;  // 找到自己的結果就返回
        } else {
          // 不是自己的結果，重新放回隊列尾
          await redis.rpush('result_queue', reply[1]);
        }
      }
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Timeout waiting for code execution result');
      }
      return waitResult();  // 繼續等待
    }


    const output = await waitResult();
    res.json({ output });

  } catch (err) {
    console.error(err);
    res.json({ output: `Error: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
