import express from 'express';
import fetch from 'node-fetch';
import marked from 'marked';

const router = express.Router();

router.get(['/', '/download', '/downloads'], (req, res) => {
  const ua = req.headers['user-agent'];
  if (/(Intel|PPC) Mac OS X/.test(ua)) {
    res.redirect('/download/mac');
  } else if (/(Linux x86_64|Linux i686)/.test(ua)) {
    res.redirect('/download/linux');
  } else {
    res.redirect('/download/windows');
  }
});

router.get('/downloads/:platform(mac|windows|linux)', (req, res) => {
  const platform = req.params.platform;

  res.redirect(`/download/${platform}`);
});

router.get('/download/:platform(mac|windows|linux)', (req, res) => {
  const platform = req.params.platform;
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  let dockName = 'dock';
  if (platform === 'windows') dockName = 'taskbar';
  if (platform === 'linux') dockName = 'launcher';

  res.render('download', {
    version: process.env.VERSION,
    platform,
    dockName,
    title: `Download WebCatalog for ${platformName}`,
  });
});

router.get('/release-notes', (req, res, next) => {
  fetch(`https://raw.githubusercontent.com/webcatalog/webcatalog/v${process.env.VERSION}/RELEASE_NOTES.md`)
    .then(response => response.text())
    .then((mdContent) => {
      res.render('release-notes', { title: 'Release Notes', releaseNotes: marked(mdContent) });
    })
    .catch(next);
});

router.get('/support', (req, res) => {
  res.redirect('/help');
});

router.get('/help', (req, res) => {
  res.render('help', { title: 'Support' });
});

router.get('/team', (req, res) => {
  res.render('team', { title: 'Team' });
});

router.get('/s3/:name.:ext', (req, res) => {
  if (req.query.v) {
    res.redirect(`https://s3.getwebcatalog.com/${req.params.name}.${req.params.ext}?v=${req.query.v}`);
  } else {
    res.redirect(`https://s3.getwebcatalog.com/${req.params.name}.${req.params.ext}`);
  }
});

router.use('/sitemap.xml', require('./sitemap'));
router.use('/apps', require('./apps'));
router.use('/admin', require('./admin'));
router.use('/api', require('./api'));
router.use('/auth', require('./auth'));
router.use('/submit', require('./submit'));

module.exports = router;
