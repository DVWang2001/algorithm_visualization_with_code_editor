// 初始化 Konva 畫布
  const stage = new Konva.Stage({
    container: 'canvas-container',
    width: 400,
    height: 300,
  });
  const layer = new Konva.Layer();
  stage.add(layer);
  // 放在 <script> 區塊裡，layer 宣告完之後即可加
  function expandStageIfNeeded(padding = 20) {
    const rect = layer.getClientRect({ skipTransform: true });

    const needW = Math.ceil(rect.x + rect.width + padding);
    const needH = Math.ceil(rect.y + rect.height + padding);

    if (needW > stage.width() || needH > stage.height()) {
      stage.width(needW);
      stage.height(needH);

      const container = document.getElementById('canvas-container');
      container.style.width = needW + 'px';
      container.style.height = needH + 'px';

      stage.draw(); // 重繪
    }
  }
  const centerX = stage.width() / 2;
  const centerY = stage.height() / 2;
  let number = 0;

  // 改寫的 drawCircle：保持和 C++ 輸出格式一致
  const circles = [];
  function drawCircle(x, y, r, message = "") {
    const fixX = centerX + x;
    const fixY = centerY + y;

    const circle = new Konva.Circle({
      x: fixX,
      y: fixY,
      radius: r,
      fill: 'skyblue',
      stroke: 'black',
      strokeWidth: 1
    });

    const label = new Konva.Text({
      x: fixX - r,
      y: fixY - r / 2,
      width: r * 2,
      height: r,
      text: message,
      fontSize: Math.max(r * 0.8, 10),
      fontFamily: 'Arial',
      align: 'center',
      verticalAlign: 'middle',
      fill: 'black'
    });

    layer.add(circle);
    layer.add(label);

    layer.draw();
    circles.push(circle); 
    return { circle, label };
  } 
  function drawLineBetweenCircles(c1, c2, strokeWidth = 2) {
    const x1 = c1.x();
    const y1 = c1.y();
    const r1 = c1.radius();
    const x2 = c2.x();
    const y2 = c2.y();
    const r2 = c2.radius();

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 避免除以 0
    if (dist === 0) return;

    const ux = dx / dist;
    const uy = dy / dist;

    // 起點在 c1 圓周
    const startX = x1 + ux * r1;
    const startY = y1 + uy * r1;

    // 終點在 c2 圓周
    const endX = x2 - ux * r2;
    const endY = y2 - uy * r2;

    const line = new Konva.Line({
      points: [startX, startY, endX, endY],
      stroke: 'black',
      strokeWidth,
      lineCap: 'round',
      lineJoin: 'round'
    });

    layer.add(line);
    layer.draw();
  }
// 修改 runCode：改為清除 Konva 畫布
  async function runCode() {
    layer.destroyChildren();
    circles.length = 0; // 清空 circles 陣列
    number = 0; // 重置 number
    const code = monaco.editor.getModels()[0].getValue();
    
    const res = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
  
    const data = await res.json();
    document.getElementById('output').textContent = data.output;
  
    try {
      eval(data.output);
      expandStageIfNeeded();  
    } catch (e) {
      alert("JS 錯誤：" + e.message);
    }
}

