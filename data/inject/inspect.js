'use strict';

{
  const playerBar = document.querySelector('ytmusic-player-bar');
  const mode = playerBar.querySelector('[aria-label="Pause"]') ? 'play' : 'pause';
  const middle = playerBar.querySelector('.middle-controls');
  const song = {
    cover: middle.querySelector('img').src,
    title: middle.querySelector('.title').textContent,
    artist: [...middle.querySelectorAll('a')].map(a => ({
      artist: a.textContent,
      href: a.href
    }))
  };
  if (song.artist.length === 0) {
    song.artist = [{
      artist: middle.querySelector('.subtitle').textContent,
      href: ''
    }];
  }
  const progressBar = document.getElementById('progress-bar');
  const [current, total] = progressBar.getAttribute('aria-valuetext').split(' of ');
  const time = {
    current,
    total
  };
  const volume = {
    level: Number(document.getElementById('volume-slider').getAttribute('value')) / 100,
    mute: document.querySelector('.volume').getAttribute('aria-pressed') === 'true'
  };
  const progress = {};
  progress.container = progressBar.querySelector('#progressContainer');
  progress.width = progress.container.getBoundingClientRect().width;
  progress.level = progressBar.querySelector('#primaryProgress').getBoundingClientRect().width / progress.width;
  progress.buffer = progressBar.querySelector('#secondaryProgress').getBoundingClientRect().width / progress.width;

  const side = document.querySelector('.side-panel');
  const playlist = [...side.querySelectorAll('ytmusic-player-queue-item')].map(e => {
    const [title, artist, duration] = [...e.querySelectorAll('yt-formatted-string.ytmusic-player-queue-item')];
    return {
      cover: e.querySelector('img').src,
      title: title.textContent,
      duration: duration.textContent,
      artist: [{
        artist: artist.textContent,
        href: ''
      }]
    };
  });

  let like = 'none';
  try {
    if (playerBar.querySelector('.like').getAttribute('aria-pressed') === 'true') {
      like = 'liked';
    }
  }
  catch(e) {}
  try {
    if (playerBar.querySelector('.dislike').getAttribute('aria-pressed') === 'true') {
      like = 'disliked';
    }
  }
  catch(e) {}

  const repeat = playerBar.querySelector('.repeat').getAttribute('aria-label').split(' ')[1];
  //
  const report = {
    method: 'report',
    mode,
    song,
    time,
    volume,
    progress,
    playlist,
    repeat,
    like
  };
  delete report.progress.container;

  report
}
