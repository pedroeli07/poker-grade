const crypto = require('crypto');

const hash = crypto
  .createHash('md5')
  .update('Clpoker2024')
  .digest('hex');

console.log(hash);