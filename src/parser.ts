
function isNewLineChar(char: string) {
  return char === '\n';
}

function isEmptyChar(char: string) {
  return [' ', '\n', '\t'].includes(char);
}

function isValidChar(char: string) {
  return /[A-Za-z0-9]/.test(char);
}

function isValidName(name: string) {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(name);
}

function removeHeadAndTail(str: string) {
  return str.replace(/^./, '').replace(/.$/, '');
}

interface IStateMap {
  [key: string]: symbol
}

interface IProps {
  [key: string]: string | boolean,
}

interface INode {
  name: string,
  props: IProps,
  content: string,
  children: INode[],
  parent?: null | INode
}

interface IParserConfig {
  funcName?: string,
  presetTagName?: string[],
  textTagName?: string[],
  formatValue?(val: string): string
}

export class Parser {
  str = '';
  index = -1;
  char = '';
  
  stateMap: IStateMap = {
    null: Symbol('null'),
    tagBeginLeft: Symbol('tagBeginLeft'),
    tagBeginName: Symbol('tagBeginName'),
    tagProps: Symbol('tagProps'),
    tagBeginRight: Symbol('tagBeginRight'),
    tagEndLeft: Symbol('tagEndLeft'),
    tagEndName: Symbol('tagEndName'),
    tagEndRight: Symbol('tagEndRight'),
  }

  state = this.stateMap.null;

  head: null | INode = null;
  current: null | INode = null;

  config: {
    funcName: string,
    presetTagName: string[],
    textTagName: string[],
    formatValue(val: string): string
  }

  constructor(config: IParserConfig = {}) {
    this.config = Object.assign({
      funcName: 'createElement',
      presetTagName: [],
      textTagName: ['text'],
      formatValue(val: string) {
        return val;
      }
    }, config);
  }

  nextChar(step = 1) {
    this.index += step;
    this.char = this.str[this.index];
    return this.char;
  }

  prevChar(step = 1) {
    this.index -= step;
    this.char = this.str[this.index];
    return this.char;
  }

  lookNext(begin = 1, step = 1) {
    return this.str.slice(this.index + begin, this.index + begin + step);
  }

  createNewChild() {
    const parent = this.current;

    this.current = {
      name: '',
      props: {},
      content: '',
      children: [],
      parent,
    };

    if (!this.head) {
      this.head = this.current;
    }
  }

  addToParent() {
    if (this.current) {
      if (this.current.parent) {
        const parent = this.current.parent;
        parent.children.push({
          name: this.current.name,
          props: this.current.props,
          content: this.current.content,
          children: this.current.children
        });
        this.current = parent;
      }
    }
  }

  getResult() {
    return this.head;
  }

  toString(obj: INode): string {
    const { funcName, presetTagName, formatValue } = this.config;

    let tagName = '';
    if (presetTagName.includes(obj.name)) {
      tagName = `'${obj.name}'`;
    } else {
      tagName = obj.name;
    }
    
    let propsList = [];
    Object.keys(obj.props).forEach((key: string) => {
      const val = obj.props[key];

      if (typeof val === 'string') {
        if (
          /^\{[0-9]+(\.[0-9]+)?\}$/.test(val) ||
          /^\{['\"`](.)*['\"`]\}$/.test(val) ||
          /^\{(true|false)\}$/.test(val)
        ) {
          propsList.push(`${key}: ${removeHeadAndTail(val)}`);
        } else if (/^\{(.)*\}$/.test(val)) {
          propsList.push(`${key}: ${formatValue(removeHeadAndTail(val))}`);
        } else if (/^['\"`](.)*['\"`]$/.test(val)) {
          propsList.push(`${key}: ${val}`);
        }
      } else if (typeof val === 'boolean') {
        propsList.push(`${key}: ${val ? 'true' : 'false'}`);
      }
    });

    if (obj.content) {
      propsList.push(`content: '${obj.content}'`);
    }

    let childrenList: string[] = [];
    if (obj.children.length) {
      childrenList = obj.children.map((child: INode) => {
        return this.toString(child);
      })
    }

    return `${funcName}(${tagName}, { ${propsList.join(', ')} }, [ ${childrenList.join(', ')} ])`;
  }

  throw(error: string) {
    throw new Error(error);
  }

  isNotTransChar() {
    const last = this.str[this.index - 1] === '\\';
    const lastLast = this.str[this.index - 2] === '\\';
    return !last || (last && lastLast);
  }

  isState(...state: string[]) {
    return state.some((s: string) => this.state === this.stateMap[s]);
  }

  setState(stateName: string) {
    if (this.stateMap[stateName]) {
      this.state = this.stateMap[stateName];
    } else {
      this.throw(`State '${stateName}' is not existed`);
    }
  }

  reset() {
    this.state = this.stateMap.null;
  }

  run(str: string) {
    this.str = str;
    let result = '';
    let lastIndex = 0;

    while (this.nextChar()) {
      this.handleUselessChar();
      result += this.str.slice(lastIndex, this.index);
      
      this.reset();
      this.handleChar();
      if (this.head) {
        result += this.toString(this.head);
        this.head = null;
        this.current = null;
      }

      lastIndex = this.index;
    }
    
    // console.log(result);
    return result
  }

  handleUselessChar() {
    let s = '';
    while (this.char) {
      if (this.lookNext(0, 2) === '//') {
        while (!isNewLineChar(this.nextChar())) {}
      } else if (this.lookNext(0, 2) === '/*') {
        this.nextChar();
        while (this.nextChar()) {
          if (this.lookNext(0, 2) === '*/') {
            this.nextChar();
            break;
          }
        }
      } else if (['\'', '"', '`'].includes(this.char)) {
        const c = this.char;
        while (this.nextChar()) {
          if (this.char === c && this.isNotTransChar()) {
            break;
          }
        }
      } else if (this.char === '<') {
        break;
      }

      this.nextChar();
    }
  }

  handleChar() {
    let over = false;
    while (this.char && !over) {
      switch (this.char) {
        case '<': {
          if (this.isState('null')) {
            this.setState('tagBeginLeft');
            this.createNewChild();
            this.readName();
            this.readProps();
          } else if (this.isState('tagBeginRight')) {
            if (this.lookNext() === '/') {
              this.setState('tagEndLeft');
              this.nextChar();
              this.readName();
            } else {
              this.setState('tagBeginLeft');
              this.createNewChild();
              this.readName();
              this.readProps();
            }
          } else if (this.isState('tagEndRight')) {
            if (this.lookNext() === '/') {
              this.setState('tagEndLeft');
              this.nextChar();
              this.readName();
            } else {
              this.setState('tagBeginLeft');
              this.createNewChild();
              this.readName();
              this.readProps();
            }
          }
        }break;
        case '/': {
          if (this.isState('tagBeginName', 'tagProps')) {
            if (this.lookNext() === '>') {
              this.setState('tagEndRight');
              this.addToParent();
              this.nextChar();
            } else {
              this.throw(`Expect '>' after '/'`);
            }
          } else if (this.isState('tagBeginRight', 'tagEndRight')) {
            if (this.lookNext(0, 2) === '//' || this.lookNext(0, 2) === '/*') {
              this.handleNoteChar();
            }
          } else {
            this.throw(`Unexpected '/'`);
          }
        }break;
        case '>': {
          if (this.isState('tagBeginName', 'tagProps')) {
            this.setState('tagBeginRight');
            this.readContent();
          } else if (this.isState('tagEndName')) {
            this.setState('tagEndRight');
            if (this.head === this.current) {
              over = true;
            } else {
              this.addToParent();
            }
          }
        }break;
        default: {
          if (isEmptyChar(this.char)) {
            //
          } else {
            this.throw(`Unexpected char: '${this.char}'`);
          }
          // else if (this.isState('tagEndRight')) {
          //   if (this.head === this.current) {
          //     this.readContent();
          //   }
          // }
        }break;
      }
      
      this.nextChar();
    }
    
  }

  handleNoteChar() {
    if (this.lookNext(0, 2) === '//') {
      while (!isNewLineChar(this.nextChar())) {}
    } else if (this.lookNext(0, 2) === '/*') {
      this.nextChar();
      while (this.nextChar()) {
        if (this.lookNext(0, 2) === '*/') {
          break;
        }
      }
    }
  }
  
  readContent() {
    if (!this.current) {
      return this.throw('Current node does not exist');
    }

    const { textTagName } = this.config;
    const isTextTag = textTagName.includes(this.current.name);

    if (isTextTag) {
      const end = `</${this.current.name}>`;
      const len = 2 + this.current.name.length + 1;
      let content = '';

      while (this.nextChar()) {
        if (this.lookNext(0, len) === end) {
          this.current.content = content.trim();
          this.prevChar();
          break;
        }

        content += this.char;
      }
    }
  }

  readName() {
    let name = '';
    while (this.nextChar()) {
      name += this.char;

      if (!isValidChar(this.lookNext())) {
        break;
      }
    }

    if (isValidName(name)) {
      if (!this.current) {
        return this.throw('Current node does not exist');
      }
      
      if (this.isState('tagBeginLeft')) {
        this.setState('tagBeginName');
        this.current.name = name;
      } else if (this.isState('tagEndLeft')) {
        if (this.current.name === name) {
          this.setState('tagEndName');
        } else {
          this.throw(`Unexpected tag end name: '${name}', expect '${this.current.name}'`);
        }
      }
    } else {
      this.throw(`Unvalid name: '${name}'`);
    }
  }

  readProps() {
    let props: {
      [key: string]: string | boolean
    } = {};
    while (this.nextChar()) {
      if (isEmptyChar(this.char)) {
        //
      } else if (this.lookNext(0, 2) === '//') {
        while (this.nextChar() !== '\n') {}
      } else if (this.char === '>' || this.lookNext(0, 2) === '/>') {
        this.prevChar();
        break;
      } else if (isValidChar(this.char)) {
        let key: string = this.readKey();
        let val: string | boolean = true;
        
        if (this.char === '=') {
          this.nextChar();
          val = this.readVal();

          if (val === null) {
            this.throw(`Props val cannot be null`);
          }
        }

        props[key] = val;
      } else {
        this.throw(`Unexpect char: '${this.char}'`);
      }
    }

    if (this.current) {
      this.current.props = props;
      this.setState('tagProps');
    } else {
      this.throw('Current node does not exist');
    }
  }

  readKey(): string {
    let key = '';

    while (this.char) {
      if (isValidChar(this.char)) {
        key += this.char;
      } else {
        break;
      }

      this.nextChar();
    }

    if (isValidName(key)) {
      return key;
    } else {
      this.throw(`Invalid key name: '${key}'`);
      return '';
    }
  }

  readVal() {
    let val = '';

    switch (this.char) {
      case `'`:
      case `"`: {
        val = this.readValStr(this.char, this.char);
      }break;
      case `{`: {
        val = this.readValStr(`{`, `}`);
      }break;
      default: {
        this.throw(`Unexpect char '${this.char}' after '='`);
      }break;
    }
    
    return val;
  }

  readValStr(startChar: string, endChar: string): string {
    let str = startChar;

    if (startChar === endChar) {
      while (this.nextChar()) {
        // if (
        //   isEmptyChar(this.char) ||
        //   this.char === '>' ||
        //   this.lookNext(0, 2) === '/>'
        // ) {
        //   break;
        // }
        
        str += this.char;

        if (this.char === endChar && this.isNotTransChar()) {
          break;
        }
      }
    } else {
      let stack = [startChar];
      let strType = '';
      while (this.nextChar()) {
        str += this.char;

        if (strType === '') {
          if ([`'`, `"`].includes(this.char)) {
            strType = this.char;
          } else if (this.char === startChar && this.isNotTransChar()) {
            stack.push(startChar);
          } else if (this.char === endChar && this.isNotTransChar()) {
            
            if (stack[stack.length - 1] === startChar) {
              stack.pop();
              if (stack.length === 0) {
                break;
              }
            } else {
              this.throw(`Unexpect char: '${this.char}'`);
            }
          }
        } else {
          if ([`'`, `"`].includes(this.char) && this.isNotTransChar()) {
            strType = '';
          }
        }
      }
    }

    return str;
  }
}