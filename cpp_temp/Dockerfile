FROM gcc:latest

RUN apt update && apt install -y redis-tools jq coreutils

WORKDIR /app

COPY worker-entrypoint.sh .

# 用 sed 將 CRLF 換成 LF
RUN sed -i 's/\r$//' worker-entrypoint.sh

ENTRYPOINT ["sh", "worker-entrypoint.sh"]
