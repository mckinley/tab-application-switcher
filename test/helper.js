import chai from 'chai';
import sinon from 'sinon';
import sinonChrome from 'sinon-chrome';
import 'jsdom-global/register';

function setGlobal(property, value) {
  if (global[property] === undefined) {
    global[property] = value;
  }
}

setGlobal('expect', chai.expect);
setGlobal('sinon', sinon);
setGlobal('chrome', sinonChrome);

beforeEach(function() {
  this.sinon = sinon.sandbox.create();
});

afterEach(function(){
  this.sinon.restore();
});

chrome.runtime.connect.returns({ onDisconnect: { addListener: () => {} } });
