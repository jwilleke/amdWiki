const { Tokenizer } = require('./src/parsers/dom/Tokenizer');

const markup = '[{$applicationname}]';

console.log('Input:', markup);
console.log('');

const tokenizer = new Tokenizer(markup);
const tokens = tokenizer.tokenize();

console.log('Tokens:');
tokens.forEach((token, i) => {
  console.log(`  ${i}: ${token.type} = "${token.value}"`);
});
