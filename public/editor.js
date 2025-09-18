// 如果有多語言設定需求，可以設定 availableLanguages
require.config({
  paths: { vs: '/monaco/vs' },
  'vs/nls': {
    availableLanguages: {
	      '*': 'zh-tw' // 設定語言為繁體中文
	    }
  }
});

require(['vs/editor/editor.main'], async function () {
  const response = await fetch('/default-code'); // 從伺服器載入預設程式碼
  const codeText = await response.text();
  var editor = monaco.editor.create(document.getElementById('code'), {
    value: codeText,
    language: 'cpp',
    automaticLayout: true
  });
  monaco.editor.setTheme('vs'); // 設定主題為暗色
  // 監聽下拉選單切換主題
  const themeSelect = document.getElementById('theme-select');
  themeSelect.addEventListener('change', function() {
    monaco.editor.setTheme(this.value);
  });
});