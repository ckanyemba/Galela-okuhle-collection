/** PayFast requires a browser POST, so build and submit a hidden form. */
export function submitForm(action, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
