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
  initial_zoom: 5,
  language: 'zh-cn'
};

const dataTest = {
  title: {
    text: {
      headline: "Whitney Houston<br/> 1963 - 2012",
      text: "<p>Houston's voice caught the imagination of the world propelling her to superstardom at an early age becoming one of the most awarded performers of our time. This is a look into the amazing heights she achieved and her personal struggles with substance abuse and a tumultuous marriage.</p>",
    },
  },
  events: [
    {
      group: 'TEST',
      display_date: '公元前 200 年 黄帝纪元 xx 年',
      location: {
        name: 'ABC'
      },
      start_date: {
        year: -200,
      },
      text: {
        headline: "Debut",
        text: "Whitney Houston's self titled first release sold over 12 million copies in the U.S. and included the hit singles 'How Will I Know,' 'You Give Good Love,' 'Saving All My Love For You' and 'Greatest Love of All.'",
      },
      media: {
        url: '',
        credit: '<blockquote>There is no demand'
      }
    },
    {
      group: 'TEST2',
      start_date: {
        year: "1986",
      },
      text: {
        headline: "'The Grammys'",
        text: "In 1986 Houston won her first Grammy for the song Saving All My Love. In total she has won six Grammys, the last of which she won in 1999 for It's Not Right But It's Okay.",
      },
    },
  ],
};

// const timeline = new TL.Timeline("timeline", data, options);

$(document).ready(async function() {
  try {
    const data = await loadTime('xia')
    const timeline = new TL.Timeline("timeline", data, options);
  } catch (error) {
    alert('数据加载错误，请重启应用');
  }
})

function loadTime (dynasty) {
  return new Promise((resolve, reject) => {
    window.ipcRenderer.loadTime({ dynasty }).then(data => resolve(data)).catch(error => reject(error));
  });
}
