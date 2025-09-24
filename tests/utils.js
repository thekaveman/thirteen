export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

let originalSetTimeout;
let originalClearTimeout;
let setTimeoutCalls = [];

export function mockSetTimeout() {
  originalSetTimeout = window.setTimeout;
  originalClearTimeout = window.clearTimeout;
  setTimeoutCalls = [];
  window.setTimeout = (handler, delay) => {
    setTimeoutCalls.push({ handler, delay });
    return setTimeoutCalls.length - 1; // Return a mock timeout ID
  };
  window.clearTimeout = (id) => {
    if (setTimeoutCalls[id]) {
      setTimeoutCalls[id].cleared = true;
    }
  };
}

export function restoreSetTimeout() {
  window.setTimeout = originalSetTimeout;
  window.clearTimeout = originalClearTimeout;
}

let originalAddEventListener;
let addEventListenerCalls = [];

export function mockAddEventListener() {
  originalAddEventListener = HTMLElement.prototype.addEventListener;
  addEventListenerCalls = [];
  HTMLElement.prototype.addEventListener = function (event, handler) {
    addEventListenerCalls.push({ target: this, event, handler });
    originalAddEventListener.call(this, event, handler);
  };
}

export function restoreAddEventListener() {
  HTMLElement.prototype.addEventListener = originalAddEventListener;
}

export function getAddEventListenerCalls() {
  return addEventListenerCalls;
}

export function runTests(tests, results, context = {}) {
  results.innerHTML = "";

  tests.forEach((test) => {
    const li = document.createElement("li");
    try {
      // Call beforeEach if it exists
      if (typeof test.beforeEach === "function") {
        test.beforeEach(context);
      }

      test();

      // Call afterEach if it exists
      if (typeof test.afterEach === "function") {
        test.afterEach(true);
      }

      li.textContent = `PASS: ${test.name}`;
      li.style.color = "green";
    } catch (e) {
      // Call afterEach even if test fails
      if (typeof test.afterEach === "function") {
        test.afterEach(false);
      }
      li.textContent = `FAIL: ${test.name} - ${e.message}`;
      li.style.color = "red";
    }
    results.appendChild(li);
  });
}

export function spyOn(obj, methodName) {
  const originalMethod = obj[methodName];
  const spy = {
    called: false,
    callCount: 0,
    originalMethod: originalMethod,
    restore: () => {
      obj[methodName] = originalMethod;
    },
  };
  obj[methodName] = function (...args) {
    spy.called = true;
    spy.callCount++;
    return originalMethod.apply(this, args);
  };
  return spy;
}