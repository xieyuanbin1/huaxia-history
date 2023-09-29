/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// const remote = require('electron').remote

// const btn = document.querySelector('#btn')
// btn.addEventListener('click', (e, b, c, d) => {
//   console.log('remote::', window.ipcRenderer)
//   window.ipcRenderer.openFile('a').then(data => {
//     console.log('data::', data)
//   }).catch(err => {
//     console.error('e::', err)
//   })
// })

// The TL.Timeline constructor takes at least two arguments:
// the id of the Timeline container (no '#'), and
// the URL to your JSON data file or Google spreadsheet.
// the id must refer to an element "above" this code,
// and the element must have CSS styling to give it width and height
// optionally, a third argument with configuration options can be passed.
// See below for more about options.
const options = {
  hash_bookmark: false,
  // use_bc: true,
  initial_zoom: 21,
  language: 'zh-cn'
};
const DEFUALT_DYNATY = 'xia';

// const timeline = new TL.Timeline("timeline", data, options);

$(document).ready(async function() {
  try {
    // 初始化数据
    if ($(location).prop('hash')) {
      const hash = $(location).prop('hash').substring(1);
      const targetList = $("#dynasty span");
      for(const el of targetList) {
        $(el).css('border-bottom', '');
        if(el.dataset['dynasty'] === hash) {
          $(el).css('border-bottom', '1px solid black');
        }
      }
      const data = await loadTime(hash);
      const timeline = new TL.Timeline("timeline", data, options);
    } else {
      const target = $("#dynasty span")[0];
      $(target).css('border-bottom', '1px solid black');
      const data = await loadTime(DEFUALT_DYNATY);
      const timeline = new TL.Timeline("timeline", data, options);
    }

    $("#dynasty span").bind('click', (e) => {
      const { target } = e;
      $("#dynasty span").css('border-bottom', '');
      $(target).css('border-bottom', '1px solid black');
      const dynasty = target.dataset['dynasty'];
      location.hash = dynasty;
    })

  } catch (error) {
    alert('数据加载错误，请重启应用');
  }
})

// 监听 hash 变更
window.onhashchange = async function() {
  if ($(location).prop('hash')) {
    const hash = $(location).prop('hash').substring(1);
    const data = await loadTime(hash);
    const timeline = new TL.Timeline("timeline", data, options);
  }
}

function loadTime (dynasty) {
  return new Promise((resolve, reject) => {
    window.ipcRenderer.loadTime({ dynasty }).then(data => resolve(data)).catch(error => reject(error));
  });
}
