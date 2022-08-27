"use strict";

require("regenerator-runtime");

require("dotenv/config");

require("./db.js");

require("./models/Video.js");

require("./models/Comment.js");

require("./models/User.js");

var _server = _interopRequireDefault(require("./server.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var PORT = 3000;

var handleListening = function handleListening() {
  console.log("\uC11C\uBC84 ".concat(PORT, "\uC774 \uC798 \uC791\uB3D9\uB418\uACE0 \uC788\uC74C"));
};

_server["default"].listen(PORT, handleListening);