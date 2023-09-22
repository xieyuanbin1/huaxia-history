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

// const timeline = new TL.Timeline("timeline", data, options);

$(document).ready(async function() {
  try {
    const data = await loadTime('xia')
    const timeline = new TL.Timeline("timeline", data, options);

    console.log('>>>>>>>>>>>>>>>> 1:', $( "#dynasty span" ));

    $("#dynasty span").bind('click', 'daaaaata', (e) => {
      const { data, target } = e
      console.log('>>>>>>>>>>> 0:', e)
      console.log('>>>>>>>>>>> 1:', data)
      console.log('>>>>>>>>>>> 2:', target)
      console.log('>>>>>>>>>>> 3:', target.getAttribute('data-dynasty'))
      console.log('>>>>>>>>>>> 3:', $("#dynasty span").attr('data-dynasty'))
    })

  } catch (error) {
    alert('数据加载错误，请重启应用');
  }
})

function loadTime (dynasty) {
  return new Promise((resolve, reject) => {
    window.ipcRenderer.loadTime({ dynasty }).then(data => resolve(data)).catch(error => reject(error));
  });
}
