export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
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