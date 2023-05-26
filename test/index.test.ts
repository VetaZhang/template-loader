import { Parser } from "../src/parser";

test('test ', () => {
  const jsx = `
/**
 * By Veta
 */
import Foo from './foo';

// test fn
function Main() {
  return <main>
    <title />
    <text></text>
    /*<text></text>
    <text></text>*/
    <text>
      sad
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

    
  const parser = new Parser();
  parser.run(jsx);
  // console.log(JSON.stringify(parser.getResult(), null, 2));
  
  expect(3).toBe(3)
});