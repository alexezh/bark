export function numberArrayToString(v: number[]) {
  let s = '';
  let sep = false;
  for (let i = 0; i < v.length; i++) {
    if (sep) {
      s += ',';
    }
    s += v[i].toString();
    sep = true;
  }
  return s;
}

