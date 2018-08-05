'use strict';

var ui;
var tab;
var iframe = document.querySelector('iframe');

var inject = (code, unsafe = false) => chrome.tabs.executeScript(tab.id, {
  runAt: 'document_start',
  code: unsafe ? `
    document.body.appendChild(Object.assign(document.createElement('script'), {
      textContent: \`{${code}}\`
    })).remove();
  ` : `{${code}}`
});

function report(/* reason */) {
  // console.log(reason);

  ui.timer.stop();
  chrome.tabs.executeScript(tab.id, {
    file: '/data/inject/inspect.js',
    runAt: 'document_start'
  }, results => {
    if (results && results.length) {
      const result = results[0];
      const {song, time, progress, volume, playlist, repeat} = result;
      ui.mode = result.mode;
      ui.song.title = song.title;
      ui.song.cover = song.cover;
      ui.time.current = time.current;
      ui.time.total = time.total;
      ui.progress.level = progress.level;
      ui.progress.buffer = progress.buffer;
      ui.volume.level = volume.level;
      ui.volume.mute = volume.mute;
      ui.repeat = repeat;
      ui.song.artist.populate(song.artist);
      ui.playlist.populate(playlist);
    }
    else {
      console.log('failed to inspect');
    }
  });
}

report.id = null;
report.request = function(reason) {
  window.clearTimeout(report.id);
  window.setTimeout(report, 100, reason);
};

function init() {
  chrome.tabs.query({
    url: '*://music.youtube.com/*'
  }, tabs => {
    if (tabs.length) {
      tab = tabs[0];
      report('start-up');
    }
    else {
      iframe.src = 'blank.html';
    }
  });
}

iframe.addEventListener('load', () => {
  ui = iframe.contentWindow.ui;
  ui.on('report', () => report.request('ui.js'));
  ui.on('command', cmd => {
    if (cmd.target === 'progress') {
      inject(`
        const e = new Event('mousedown');
        const width = document.querySelector('#progress-bar #progressContainer').getBoundingClientRect().width;
        e.clientX = ${cmd.level} * width;
        document.querySelector('#progress-bar #sliderBar').dispatchEvent(e);
        true
      `, true);
    }
    else if (cmd.target === 'volume') {
      inject(`
        const e = new Event('mousedown');
        const bar = document.querySelector('#volume-slider #sliderBar');
        const {width, left} = bar.getBoundingClientRect();
        e.clientX = left + width * ${cmd.level};
        bar.dispatchEvent(e);
      `, true);
    }
    else if (cmd === 'next-track') {
      inject(`document.querySelector('.next-button').click();`);
    }
    else if (cmd === 'previous-track') {
      inject(`document.querySelector('.previous-button').click();`);
    }
    else if (cmd === 'shuffle') {
      inject(`document.querySelector('.shuffle').click();`);
    }
    else if (cmd === 'toggle-repeat') {
      inject(`document.querySelector('.repeat').click();`);
    }
    else if (cmd === 'toggle-like') {
      inject(`document.querySelector('.like').click();`);
    }
    else if (cmd === 'toggle-dislike') {
      inject(`document.querySelector('.dislike').click();`);
    }
    else if (cmd === 'toggle-mute') {
      inject(`document.querySelector('.volume').click();`);
    }
    else if (cmd === 'toggle-play-pause') {
      inject(`document.querySelector('.play-pause-button').click();`);
    }
    else if (cmd.target === 'select-song') {
      inject(`
        const side = document.querySelector('.side-panel');
        const song = [...side.querySelectorAll('ytmusic-player-queue-item')][${cmd.index}];
        song.querySelector('ytmusic-play-button-renderer').click();
      `);
    }
    else {
      console.log('unknown command', cmd);
    }
    report.request('command-executed');
  });
  init();
});
iframe.src = 'music-player-library/ui.html';

chrome.tabs.onUpdated.addListener(tabId => {
  if (tab && tabId === tab.id) {
    report.request('on-updated');
  }
});
