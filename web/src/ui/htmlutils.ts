export function setElementVisible(elem: HTMLElement | undefined, val: boolean) {
  if (elem === undefined) {
    return;
  }
  elem.style.visibility = (val) ? 'visible' : 'hidden';
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
