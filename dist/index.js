"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_utils_1 = require("schema-utils");
const parser_1 = __importDefault(require("./parser"));
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
function default_1(source) {
    const options = this.getOptions();
    (0, schema_utils_1.validate)(schema, options);
    const parser = new parser_1.default(options);
    return parser.run(source);
}
exports.default = default_1;
