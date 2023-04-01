export function setElementVisible(elem: HTMLElement | undefined, val: boolean) {
  if (elem === undefined) {
    return;
  }
  elem.style.visibility = (val) ? 'visible' : 'hidden';
}

export function setElementDisplay(elem: HTMLElement | undefined, val: boolean) {
  if (elem === undefined) {
    return;
  }
  elem.style.display = (val) ? 'block' : 'none';
}

export function createTextDiv(): [HTMLDivElement, HTMLSpanElement] {
  let d = document.createElement('div');
  let s = document.createElement('span');
  s.className = 'nes-text is-primary';
  d.appendChild(s);

  return [d, s];
}

export function createButton(parent: HTMLElement, text: string, handler: (evt: any) => any): HTMLButtonElement {
  let button = document.createElement('button');
  button.textContent = text;
  button.className = "nes-btn is-primary";

  parent.appendChild(button);
  button.addEventListener('click', handler);

  return button;
}

export function createCommandButton(parent: HTMLElement, text: string, handler: (evt: any) => any): HTMLButtonElement {
  let button = document.createElement('button');
  button.textContent = text;
  button.className = "commandButton";

  parent.appendChild(button);
  button.addEventListener('click', handler);

  return button;
}

/**
 * 
<div class="inputContainer">
    <label>testy test test</label>
    <div><input /></div>
</div>
 */
export function createTextEntry(
  parent: HTMLElement,
  text: string,
  value: any,
  handler: (val: string) => any): HTMLDivElement {

  let d = document.createElement('div') as HTMLDivElement;
  d.className = 'inputContainer'
  let l = document.createElement('label') as HTMLLabelElement;
  l.textContent = text;

  let d2 = document.createElement('div') as HTMLDivElement;
  let i = document.createElement('input') as HTMLInputElement;
  i.type = 'number';
  i.maxLength = 5;
  i.value = value;

  d.appendChild(l);
  d2.appendChild(i);
  d.appendChild(i);

  i.addEventListener('input', () => handler(i.value));

  parent.appendChild(d);

  return d;
}
