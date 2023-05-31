import { Parser } from "../src/parser";

test('test ', () => {
  const jsx = `
/**
 * By Veta
 */
import Foo from './foo';

// test fn
function Main() {
  return <main  >
    <title
      qwe
      // asd='asd'
      zxc="zxc"
      str={'asd'}
      str2={"asd"}
      num={9}
      num2={0.9}
      bool={true}
      bool2={false}
      x={state.x}
    />
    <text
    >
    </text>
    /*<text></text>
    <text></text>*/
    <text>
      sad
    </text>
    <text>sad
    </text>
    // <p></p>
  </main>;
}

function Login() {
  return <div>
    <text>登录</text>
    <div>
      <text>账号</text>
      <input />
    </div>

    <div>
      <text>密码</text>
      <password />
    </div>
    
    <text>登录</text>
  </div>;
}
`;

    
  const parser = new Parser({
    formatValue(val) {
      return `function(state, props, model) { return ${val}; }`;
    }
  });
  
  expect(parser.run(jsx)).toBe(`
/**
 * By Veta
 */
import Foo from './foo';

// test fn
function Main() {
  return createElement(main, {  }, [ createElement(title, { qwe: true, zxc: "zxc", str: 'asd', str2: "asd", num: 9, num2: 0.9, bool: true, bool2: false, x: function(state, props, model) { return state.x; } }, [  ]), createElement(text, {  }, [  ]), createElement(text, { content: 'sad' }, [  ]), createElement(text, { content: 'sad' }, [  ]) ]);
}

function Login() {
  return createElement(div, {  }, [ createElement(text, { content: '登录' }, [  ]), createElement(div, {  }, [ createElement(text, { content: '账号' }, [  ]), createElement(input, {  }, [  ]) ]), createElement(div, {  }, [ createElement(text, { content: '密码' }, [  ]), createElement(password, {  }, [  ]) ]), createElement(text, { content: '登录' }, [  ]) ]);
}
`);
});