export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function runTests(tests, results) {
  results.innerHTML = "";

  tests.forEach((test) => {
    const li = document.createElement("li");
    try {
      test();
      li.textContent = `PASS: ${test.name}`;
      li.style.color = "green";
    } catch (e) {
      li.textContent = `FAIL: ${test.name} - ${e.message}`;
      li.style.color = "red";
    }
    results.appendChild(li);
  });
}
