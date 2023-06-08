import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';
import Parser from './parser';

const schema = {
  "type": "object",
  "properties": {
    "funcName": {
      "type": "string"
    },
    "presetTagName": {
      "type": "array"
    },
    "textTagName": {
      "type": "array"
    },
    "formatValue": {
      "instanceof": "Function"
    }
  },
  "additionalProperties": false
};

export default function (source: string) {
  // @ts-ignore
  const options = this.getOptions();
  // @ts-ignore
  validate(schema, options);

  const parser = new Parser(options);
  
  return parser.run(source);
}