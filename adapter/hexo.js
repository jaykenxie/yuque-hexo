'use strict';

const ejs = require('ejs');
const Entities = require('html-entities').AllHtmlEntities;
const FrontMatter = require('hexo-front-matter');
const { formatDate, formatRaw, formatTags, formatList } = require('../util');
const saveImage = require('../lib/saveImage');

const entities = new Entities();

// 文章模板
const template = `---
<% for (const key in props) {-%>
<%= key %>: <%= props[key] %>
<% } -%>
---

<%- raw -%>`;

/**
 * front matter 反序列化
 * @description
 * docs: https://www.npmjs.com/package/hexo-front-matter
 *
 * @param {String} body md 文档
 * @return {String} result
 */
function parseMatter(body) {
  body = entities.decode(body);
  try {
    // front matter信息的<br/>换成 \n
    const regex = /(title:|layout:|tags:|date:|categories:){1}(\S|\s)+?---/gi;
    body = body.replace(regex, (a) =>
      a.replace(/(<br \/>|<br>|<br\/>)/gi, '\n'),
    );
    const result = FrontMatter.parse(body);
    const results = getTagAndCategory(result._content);
    Object.assign(result, results);
    if (result.date) {
      result.date = formatDate(result.date);
    }
    delete result._content;
    return result;
  } catch (error) {
    return {
      body,
    };
  }
}

/**
 * 解析md文档中的标签和分类
 * @param {*} body md 文档
 * @return {Object} {body, tags, categories}
 */
function getTagAndCategory(body) {
  const tags = [];
  const categories = [];
  try {
    body = body.replace(/\[:(.*):\]/, (match, args) => {
      for (const item of args.split(',')) {
        const t = item.trim();
        if (t.startsWith('$')) categories.push(t.slice(1));
        if (t.startsWith('#')) tags.push(t.slice(1));
      }
      return '';
    });
  } catch (error) {}
  return { body, tags, categories };
}

/**
 * hexo 文章生产适配器
 *
 * @param {Object} post 文章
 * @return {String} text
 */
module.exports = function (post) {
  // matter 解析
  const parseRet = parseMatter(post.body);
  const { body, ...data } = parseRet;
  const { title, slug: urlname, created_at } = post;
  const imgRaw = saveImage(body);
  const raw = formatRaw(imgRaw);
  const date = data.date || formatDate(created_at);
  const tags = data.tags || [];
  const categories = data.categories || [];
  const props = {
    title: title.replace(/"/g, ''), // 临时去掉标题中的引号，至少保证文章页面是正常可访问的
    urlname,
    date,
    ...data,
    tags: formatTags(tags),
    categories: formatList(categories),
  };
  const text = ejs.render(template, {
    raw,
    props,
  });
  return text;
};
