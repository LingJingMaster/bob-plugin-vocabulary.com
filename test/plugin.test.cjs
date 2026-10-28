const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
let response, requestedUrl;
const context = {
    $http: { request(options) { requestedUrl = options.url; options.handler(response); } },
    $option: { ttsType: 'google' }, $info: {}, $log: {}, $data: {}, $file: {},
    console, setTimeout, clearTimeout
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/main.js', 'utf8'), context);
const html = `<div class="definitionsContainer"><div class="word-area">
<div class="ipa-section"><div class="ipa-with-audio"><div class="us-flag-icon"></div><span>/us/</span></div><div class="ipa-with-audio"><span>/alternate/</span></div><div class="ipa-with-audio"><div class="uk-flag-icon"></div><span>/uk/</span></div></div>
<p class="short">Simple explanation</p><p class="long">More details</p></div>
<ol><li class="sense"><div class="definition"><div class="pos-icon">adjective</div> meaning one</div><div class="defContent"><div class="example">Example one</div></div></li>
<li class="sense"><div class="definition"><div class="pos-icon">adjective</div> meaning two</div><div class="defContent"></div></li></ol></div>`;
function run(text, reply) {
    response = reply;
    const calls = [];
    context.translate({ text, detectFrom: 'en', onCompletion: result => calls.push(result) });
    assert.equal(calls.length, 1);
    return calls[0];
}
const dict = run('rock & roll', { data: html, response: { statusCode: 200 } }).result.toDict;
assert(requestedUrl.includes('rock%20%26%20roll'));
assert.equal(dict.parts[0].means[0], 'meaning one');
assert.equal(dict.additions[0].value, 'Simple explanation');
assert.equal(dict.additions[1].value, 'More details');
assert.equal(dict.additions[2].value, 'Example one');
assert.equal(dict.phonetics[1].value, '/uk/');
assert(dict.phonetics[0].tts.value.endsWith('rock%20%26%20roll'));
context.$option.showMore = 'no';
let hidden = run('test', { data: html }).result.toDict;
assert(!hidden.additions.some(item => item.name === 'More'));
assert(hidden.additions.some(item => item.value === 'Example one'));
context.$option.showMore = 'yes';
context.$option.showExamples = 'no';
hidden = run('test', { data: html }).result.toDict;
assert(hidden.additions.some(item => item.name === 'More'));
assert(!hidden.additions.some(item => item.value === 'Example one'));
context.$option.showMore = 'no';
hidden = run('test', { data: html }).result.toDict;
assert.equal(hidden.additions.length, 1);
assert.equal(hidden.additions[0].value, 'Simple explanation');
context.$option.ttsType = 'youDao';
assert(run('test', { data: html }).result.toDict.phonetics[1].tts.value.endsWith('type=1'));
assert.equal(run('test', { error: { message: 'offline' } }).error.type, 'network');
assert.equal(run('test', { response: { statusCode: 500 } }).error.type, 'network');
assert.equal(run('test', { data: '<div class="wordnotfound-wrapper"></div>' }).error.type, 'notFound');
assert.equal(run('test', { data: '<html>unexpected</html>' }).error.type, 'api');
console.log('Plugin tests passed');
