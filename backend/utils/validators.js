const validator = require('validator');

const validateUrl = (url) => {
  if (!url) return true;
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
};

module.exports = { validateUrl, sanitizeInput };
