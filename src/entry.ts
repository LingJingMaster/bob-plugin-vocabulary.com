import { load, CheerioAPI } from 'cheerio';
import { api } from '@bob-plug/core';

function translate(query) {
    if (query.detectFrom !== 'en') {
        query.onCompletion({ error: { type: 'unsupportedLanguage', message: 'Only English is supported' } });
        return;
    }
    const word = query.text.trim();
    if (!word) {
        query.onCompletion({ error: { type: 'param', message: 'Please enter a word or phrase' } });
        return;
    }
    api.$http.request({
        method: 'GET',
        url: `https://www.vocabulary.com/dictionary/definition.ajax?search=${encodeURIComponent(word)}&lang=en`,
        timeout: 15,
        handler: (resp) => {
            if (resp.error || (resp.response && resp.response.statusCode >= 400)) {
                query.onCompletion({ error: { type: 'network', message: '无法连接 Vocabulary.com，请检查网络后重试。' } });
                return;
            }
            try {
                if (typeof resp.data !== 'string') throw new Error('Invalid response');
                const $ = load(resp.data);
                if ($('.wordnotfound-wrapper').length) {
                    query.onCompletion({ error: { type: 'notFound', message: '词典未找到该词。' } });
                    return;
                }
                const dict = parseResult($, word);
                if (!dict.parts.length && !dict.additions.length) throw new Error('No dictionary content');
                query.onCompletion({ result: { toDict: dict } });
            } catch (error) {
                query.onCompletion({ error: { type: 'api', message: '词典返回内容无法解析，请稍后重试。' } });
            }
        }
    });
}

function parseResult($: CheerioAPI, word: string) {
    const parts: {part: string; means: string[]}[] = [];
    const examples: {name: string; value: string}[] = [];
    $('.definitionsContainer li.sense').each(function () {
        const definition = $(this).children('.definition').first();
        const part = definition.children('.pos-icon').first().text().trim();
        const meaning = definition.contents().filter(function () { return this.type === 'text'; }).text().trim();
        if (!meaning) return;
        parts.push({ part, means: [meaning] });
        const sentences = $(this).children('.defContent').find('.example').map(function () {
            return $(this).text().trim();
        }).get().filter(Boolean);
        if (sentences.length) examples.push({ name: `例句 · 义项 ${parts.length}`, value: sentences.join('\n') });
    });
    const additions: {name: string; value: string}[] = [];
    const short = $('.word-area p.short').first().text().trim();
    const long = $('.word-area p.long').first().text().trim();
    if (short) additions.push({ name: 'Explanation', value: short });
    if (long) additions.push({ name: 'More', value: long });
    additions.push(...examples);
    const forms = $('.word-area p b').first().text().trim().split(';').map(s => s.trim()).filter(Boolean);
    return {
        word,
        phonetics: ['us', 'uk'].map(type => {
            const marked = $(`.ipa-section .ipa-with-audio:has(.${type}-flag-icon) span`).first().text().trim();
            const fallback = $(`.videos > div:nth-child(${type === 'us' ? 1 : 2}) > span`).first().text().trim();
            return { type, value: marked || fallback, tts: { type: 'url', value: ttsSelector(type, word) } };
        }),
        parts,
        exchanges: forms.length ? [{ name: 'Other forms', words: forms }] : [],
        additions
    };
}

function ttsSelector(type: string, word: string) {
    const encoded = encodeURIComponent(word);
    if (api.getOption('ttsType') === 'youDao') {
        return `https://dict.youdao.com/dictvoice?audio=${encoded}&type=${type === 'us' ? 2 : 1}`;
    }
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${type === 'us' ? 'en-US' : 'en-GB'}&q=${encoded}`;
}

function supportLanguages() {
    return ['auto', 'en', 'zh-Hans'];
}
