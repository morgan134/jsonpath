export default class JsonPath {

  constructor(obj, expr, arg) {
    this.resultType = arg && arg.resultType || 'VALUE';
    this.result = [];
    this.obj = obj;
    if (expr && obj && (this.resultType === 'VALUE' || this.resultType === 'PATH')) {
      this.trace(this.normalize(expr).replace(/^\$;?/, ''), obj, '$');
      // return this.result.length ? this.result : false;
    }
    // return false;
  }

  static getValue(obj, exp) {
    return new JsonPath(obj, exp, 'VALUE').result;
  }

  static getPath(obj, exp) {
    return new JsonPath(obj, exp, 'PATH').result;
  }

  normalize(expr) {
    const subx = [];
    return expr.replace(/[\['](\??\(.*?\))[\]']|\['(.*?)'\]/g,
    ($0, $1, $2) => `[#${subx.push($1 || $2) - 1}']`)
                    .replace(/'?\.'?|\['?/g, ';')
                    .replace(/;;;|;;/g, ';..;')
                    .replace(/;$|'?\]|'$/g, '')
                    .replace(/#([0-9]+)/g, ($0, $1) => subx[$1]);
  }

  asPath(path) {
    const x = path.split(';');
    let p = '$';
    for (let i = 1, n = x.length; i < n; i++) {
      p += /^[0-9*]+$/.test(x[i]) ? `[${x[i]}]` : `['${x[i]}']`;
    }
    return p;
  }

  store(p, v) {
    if (p) this.result[this.result.length] = this.resultType === 'PATH' ? this.asPath(p) : v;
    return !!p;
  }

  trace(expr, val, path) {
    if (expr !== '') {
      let x = expr.split(';');
      const loc = x.shift();
      x = x.join(';');
      if (loc === '..') {
        this.trace(x, val, path);
        this.walk(loc, x, val, path, (m, l, x2, v, p) => {
          if (typeof v[m] === 'object') {
            this.trace(`..;${x2}`, v[m], `${p};${m}`);
          }
        });
      } else if (val && val.hasOwnProperty(loc)) {
        this.trace(x, val[loc], `${path};${loc}`);
      } else if (loc === '*') {
        this.walk(loc, x, val, path, (m, l, x2, v, p) => {
          this.trace(`${m};${x2}`, v, p);
        });
      } else if (/^\(.*?\)$/.test(loc)) { // [(expr)]
        this.trace(`${this.processEval(loc, val)};${x}`, val, path);
      } else if (/^\?\(.*?\)$/.test(loc)) { // [?(expr)]
        this.walk(loc, x, val, path, (m, l, x2, v, p) => {
          if (this.processEval(l.replace(/^\?\((.*?)\)$/, '$1'),
          this.isArray(v) ? v[m] : v)) {
            this.trace(`${m};${x}`, v, p);
          }
        }); // issue 5 resolved
      } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) {
        // [start:end:step]  phyton slice syntax
        this.slice(loc, x, val, path);
      } else if (/,/.test(loc)) { // [name1,name2,...]
        const s = loc.split(/'?,'?/);
        const n = s.length;
        for (let i = 0; i < n; i++) {
          this.trace(`${s[i]};${x}`, val, path);
        }
      }
    } else {
      this.store(path, val);
    }
  }

  // walk(loc, expr, val, path, f)
  walk(...args) {
    if (this.isArray(args[2])) {
      const n = args[2].length;
      for (let i = n; i >= 0; i--) {
        if (i in args[2]) {
          args[4](i, args[0], args[1], args[2], args[3]);
        }
      }
    } else if (typeof args[2] === 'object') {
      const arr = Object.keys(args[2]);
      let i = arr.length;
      while (i--) {
        if (args[2].hasOwnProperty(arr[i])) args[4](arr[i], args[0], args[1], args[2], args[3]);
      }
    }
  }

  slice(loc, expr, val, path) {
    if (this.isArray(val)) {
      const len = val.length;
      let start = 0;
      let end = len;
      let step = 1;
      loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, ($0, $1, $2, $3) => {
        start = parseInt($1 || start, 10);
        end = parseInt($2 || end, 10);
        step = parseInt($3 || step, 10);
      });
      start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
      end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
      for (let i = start; i < end; i += step) {
        this.trace(`${i};${expr}`, val, path);
      }
    }
  }

  processEval(x, _v) {
    try {
      return this.obj && _v && this.eval(x.replace(/(^|[^\\])@/g, '$1_v').replace(/\\@/g, '@'));
    } catch (e) {
      const x2 = x.replace(/(^|[^\\])@/g, '$1_v').replace(/\\@/g, '@');
      throw new SyntaxError(`jsonPath: ${e.message}: ${x2}`);
    }
  }

  isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  eval() {
  }

}
