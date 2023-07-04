const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
const catchAsyncErrors = require('./middleware/catchAsyncErrors');

const error = catchAsyncErrors(async (err, req, res, options) => {
  res
    .status(400)
    .json({
      status: 'Fail',
      message: `There was an error connecting to the service ${err}`,
    })
    .send();
});

const restream = async function (proxyReq, req, res, options) {
  if (
    req.headers['content-type'] &&
    req.headers['content-type'].match(/^multipart\/form-data/)
  ) {
    // build a string in multipart/form-data format with the data you need
    const formdataUser =
      `--${req.headers['content-type'].replace(
        /^.*boundary=(.*)$/,
        '$1'
      )}\r\n` +
      `Content-Disposition: form-data; name="reqUser"\r\n` +
      `\r\n` +
      `\r\n`;

    // set the new content length
    proxyReq.setHeader(
      'Content-Length',
      parseInt(req.headers['content-length']) + Buffer.byteLength(formdataUser)
    );

    proxyReq.write(formdataUser);
  } else {
    const body = JSON.stringify({ ...req.body, formType: 'json-body' });
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
    proxyReq.write(body);
  }
};

const {
  ADMIN_API,
  PUBLIC_API_LOCAL,
  PUBLIC_API,
  ADMIN_API_LOCAL,
  AUTH_API,
  AUTH_API_LOCAL,
} = require('./URLS');

const optionsAdmin = {
  target: ADMIN_API_LOCAL,
  changeOrigin: true,
  logger: console,
  onError: error,
  onProxyReq: restream,
};
const optionsAuth = {
  target: AUTH_API_LOCAL,
  changeOrigin: true,
  logger: console,
  onError: error,
  onProxyReq: restream,
};

const optionsPublic = {
  target: PUBLIC_API_LOCAL,
  changeOrigin: true,
  logger: console,
  onError: error,
  onProxyReq: restream,
};

const adminProxy = createProxyMiddleware(optionsAdmin);
const publicProxy = createProxyMiddleware(optionsPublic);
const authProxy = createProxyMiddleware(optionsAuth);

app.use('/api/v1/public', publicProxy);

app.use('/api/v1/admin', adminProxy);
app.use('/api/v1/auth', authProxy);
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
//const images = require('./routes/images');
//app.use('', images);
app.listen(8000, () => {
  console.log('GateWay listening to port 8000');
});
