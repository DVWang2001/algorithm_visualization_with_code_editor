#!/bin/sh
set -e

echo "正在安裝依賴..."
apt update && apt install -y redis-tools jq g++ coreutils

echo "啟動 worker 服務..."

while true; do
  task_json=$(redis-cli -h redis BLPOP code_queue 0 | sed -n '2p')
  echo "Received task: $task_json"

  jobId=$(echo "$task_json" | jq -r '.jobId')
  code_b64=$(echo "$task_json" | jq -r '.code')

  file="${jobId}.cpp"
  exe="${jobId}.out"

  echo "在轉換之前都沒有錯"

  # 1️⃣ 解碼 base64 的 code 字串 → UTF-8 原始碼寫入 .cpp 檔案
  echo "$code_b64" | base64 -d > "$file"

  echo "在轉換之後都沒有錯"

  echo "if 前沒錯"
  if g++ "$file" -o "$exe" 2>/tmp/compile_err.log; then
    echo "進到執行前沒錯"
    output=$(./"$exe" 2>&1)
    echo "進到執行後沒錯"
  else
    echo "進到編譯錯誤時沒錯"
    output="Compile error:\n$(cat /tmp/compile_err.log)"
  fi

  echo -e "output" "$output"

  # 2️⃣ 將輸出也做 base64 編碼後送回
  output_b64=$(printf '%s' "$output" | base64 | tr -d '\n')

  result_json=$(printf '{"jobId":"%s","output":"%s"}' "$jobId" "$output_b64")

  redis-cli -h redis RPUSH result_queue "$result_json"

  rm -f "$file" "$exe" /tmp/compile_err.log
done
