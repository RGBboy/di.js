"use strict";
var __moduleName = (void 0);
var globalCounter = 0;
function getUniqueId() {
  return ++globalCounter;
}
;
module.exports = {get getUniqueId() {
    return getUniqueId;
  }};
