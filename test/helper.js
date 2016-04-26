import chai from 'chai';
import sinonChrome from 'sinon-chrome';

function setGlobal(property, value) {
  if (global[property] === undefined) {
    global[property] = value;
  }
}

setGlobal('chrome', sinonChrome);
setGlobal('expect', chai.expect);
