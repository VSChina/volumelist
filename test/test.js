const vl = require('../build/index.js');

vl.volumelist().then(console.log);
console.log(vl.volumelistNameSync());