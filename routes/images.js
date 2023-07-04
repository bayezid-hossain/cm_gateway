const express = require('express');
const { getFilesStream } = require('../utils/awsS3');

const router = express.Router();

//router.route('/api/v1/images/:key').get(getFilesStream);

module.exports = router;
