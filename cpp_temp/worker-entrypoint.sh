#!/bin/bash


echo "正在安裝依賴..."
apt update && apt install -y redis-tools jq g++

echo "啟動 worker 服務..."

while true; do
  task_json=$(redis-cli -h redis BLPOP code_queue 0 | sed -n '2p')
  echo "Received task: $task_json"

  jobId=$(echo "$task_json" | jq -r '.jobId')
  code_b64=$(echo "$task_json" | jq -r '.code')

  file="${jobId}.cpp"
  exe="${jobId}.out"

  # 解碼程式碼
  echo "$code_b64" | base64 -d > "$file"

  # 編譯並執行
  if g++ "$file" -o "$exe" 2>/tmp/compile_err.log; then
    output=$(./"$exe" 2>&1)
  else
    output="Compile error:\n$(cat /tmp/compile_err.log)"
  fi

  # 將結果 base64 編碼
  output_b64=$(printf '%s' "$output" | base64 | tr -d '\n')
  result_json=$(printf '{"jobId":"%s","output":"%s"}' "$jobId" "$output_b64")

  # 回傳到 Redis
  redis-cli -h redis RPUSH result_queue "$result_json"

  # 清理
  rm -f "$file" "$exe" /tmp/compile_err.log
done
