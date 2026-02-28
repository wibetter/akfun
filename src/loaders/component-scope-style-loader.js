const path = require('path');
const curConfig = require('../config/index'); // 获取当前项目根目录下的配置文件

const DEFAULT_COMPONENTS_DIR = curConfig.componentsDir || './src/components';
const DEFAULT_SCOPE_KEY = 'data-scope';

function normalizePath(targetPath) {
  return targetPath ? path.normalize(targetPath) : '';
}

/**
 * 将驼峰命名转换为 kebab-case（短横线连接）
 * @param {string} str - 输入字符串
 * @returns {string} kebab-case 格式
 */
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 将驼峰命名转换为 snake_case（下划线连接）
 * @param {string} str - 输入字符串
 * @returns {string} snake_case 格式
 */
function camelToSnake(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/**
 * 生成组件名的所有可能变体（包括大小写、命名风格、container 后缀等）
 * @param {string} componentName - 组件名称，如 simpleCmp__c
 * @returns {string[]} 所有可能的变体数组
 */
function generateComponentNameVariants(componentName) {
  if (!componentName) {
    return [];
  }

  const variants = new Set();

  // 原始名称
  variants.add(componentName);

  // 首字母大写
  const capitalized = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  variants.add(capitalized);

  // 全小写
  variants.add(componentName.toLowerCase());

  // 全大写
  variants.add(componentName.toUpperCase());

  // kebab-case（短横线连接）
  const kebabCase = camelToKebab(componentName);
  variants.add(kebabCase);

  // snake_case（下划线连接）
  const snakeCase = camelToSnake(componentName);
  variants.add(snakeCase);

  // 首字母大写的 kebab-case
  const capitalizedKebab = kebabCase.charAt(0).toUpperCase() + kebabCase.slice(1);
  variants.add(capitalizedKebab);

  // 首字母大写的 snake_case
  const capitalizedSnake = snakeCase.charAt(0).toUpperCase() + snakeCase.slice(1);
  variants.add(capitalizedSnake);

  // 生成带 container 后缀的变体
  const containerSuffixes = ['-container', 'Container', '_container'];
  const baseVariants = Array.from(variants);
  baseVariants.forEach((variant) => {
    containerSuffixes.forEach((suffix) => {
      variants.add(variant + suffix);
    });
  });

  return Array.from(variants);
}

/**
 * 检查选择器是否匹配组件名（忽略大小写和命名风格）
 * @param {string} selector - 选择器，如 .simpleCmp__c 或 #simpleCmp__c
 * @param {string[]} componentNameVariants - 组件名的所有变体
 * @returns {boolean} 是否匹配
 */
function isComponentRootSelector(selector, componentNameVariants) {
  if (!selector || !componentNameVariants || componentNameVariants.length === 0) {
    return false;
  }

  const trimmedSelector = selector.trim();

  // 提取类选择器或 ID 选择器的名称部分
  // 匹配 .className 或 #idName 格式
  const match = trimmedSelector.match(/^[.#]([a-zA-Z0-9_-]+)/);
  if (!match) {
    return false;
  }

  const selectorName = match[1];

  // 检查是否匹配任何组件名变体（忽略大小写）
  return componentNameVariants.some((variant) => {
    return selectorName.toLowerCase() === variant.toLowerCase();
  });
}

/**
 * 为样式选择器添加作用域前缀
 * @param {string} selector - 选择器字符串
 * @param {string} scopeSelector - 作用域选择器，如 [data-scope="componentName"]
 * @param {string[]} componentNameVariants - 组件名的所有变体，用于判断是否是最外层选择器
 * @returns {string} 添加了作用域的选择器
 */
function addScopeToSelector(selector, scopeSelector, componentNameVariants = []) {
  if (!selector || !selector.trim()) {
    return selector;
  }

  const trimmedSelector = selector.trim();

  // 处理 :global() 语法，不添加作用域
  if (trimmedSelector.includes(':global(')) {
    return selector;
  }

  // 如果选择器已经是作用域选择器，直接返回
  if (trimmedSelector.startsWith('[') && trimmedSelector.includes(scopeSelector)) {
    return selector;
  }

  // 处理多个选择器（逗号分隔）
  if (trimmedSelector.includes(',')) {
    return trimmedSelector
      .split(',')
      .map((sel) => addScopeToSelector(sel.trim(), scopeSelector, componentNameVariants))
      .join(', ');
  }

  // 处理伪类和伪元素（如 :hover, ::before, :nth-child(2)）
  // 匹配格式：baseSelector:pseudo 或 baseSelector::pseudo
  const pseudoMatch = trimmedSelector.match(
    /^(.+?)(::?[a-zA-Z-]+(?:\([^)]*\))?(?:::?[a-zA-Z-]+(?:\([^)]*\))?)*)$/
  );
  if (pseudoMatch) {
    const baseSelector = pseudoMatch[1].trim();
    const pseudo = pseudoMatch[2];
    // 为 baseSelector 添加作用域
    const scopedBase = addScopeToSelector(baseSelector, scopeSelector, componentNameVariants);
    return `${scopedBase}${pseudo}`;
  }

  // 检查是否是最外层组件选择器（类选择器或 ID 选择器）
  const isRootSelector = isComponentRootSelector(trimmedSelector, componentNameVariants);

  // 处理普通选择器
  if (trimmedSelector.startsWith('.') || trimmedSelector.startsWith('#')) {
    // 如果是最外层组件选择器，直接拼接（无空格）
    // 否则添加空格（包含在 scope 里面）
    if (isRootSelector) {
      return `${scopeSelector}${trimmedSelector}`;
    } else {
      return `${scopeSelector} ${trimmedSelector}`;
    }
  }

  // 如果选择器以 [ 开头（属性选择器），直接拼接
  if (trimmedSelector.startsWith('[')) {
    return `${scopeSelector}${trimmedSelector}`;
  }

  // 处理标签选择器和其他选择器（添加空格）
  return `${scopeSelector} ${trimmedSelector}`;
}

/**
 * 解析样式文件并添加作用域
 * @param {string} source - 原始样式内容
 * @param {string} scopeSelector - 作用域选择器
 * @param {string[]} componentNameVariants - 组件名的所有变体
 * @returns {string} 添加了作用域的样式内容
 */
function addScopeToStyles(source, scopeSelector, componentNameVariants = []) {
  if (!source || !source.trim()) {
    return source;
  }

  let result = '';
  let i = 0;
  let depth = 0; // 大括号嵌套深度
  let inString = false; // 是否在字符串中
  let stringChar = ''; // 字符串的引号类型
  let inComment = false; // 是否在注释中
  let commentType = ''; // 注释类型：'//' 或 '/*'
  let currentSelector = '';
  let currentRule = '';
  let braceStart = -1;

  // 不需要添加作用域的 @ 规则（这些规则应该保持原样）
  const skipScopeAtRules = ['@import', '@charset', '@namespace', '@font-face'];
  // 需要递归处理的 @ 规则（内部的选择器也需要添加作用域）
  const nestedAtRules = ['@media', '@supports', '@keyframes', '@page', '@viewport'];
  let inAtRule = false;
  let atRuleName = '';
  let atRuleType = ''; // 'skip' 或 'nested'

  while (i < source.length) {
    const char = source[i];
    const nextChar = source[i + 1] || '';

    // 处理字符串
    if (!inComment && (char === '"' || char === "'")) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && source[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }
      currentRule += char;
      i++;
      continue;
    }

    // 处理注释
    if (!inString) {
      if (!inComment && char === '/' && nextChar === '/') {
        inComment = true;
        commentType = '//';
        currentRule += char;
        i++;
        continue;
      }
      if (!inComment && char === '/' && nextChar === '*') {
        inComment = true;
        commentType = '/*';
        currentRule += char;
        i++;
        continue;
      }
      if (inComment && commentType === '//' && char === '\n') {
        inComment = false;
        commentType = '';
        currentRule += char;
        i++;
        continue;
      }
      if (inComment && commentType === '/*' && char === '*' && nextChar === '/') {
        inComment = false;
        commentType = '';
        currentRule += char + nextChar;
        i += 2;
        continue;
      }
      if (inComment) {
        currentRule += char;
        i++;
        continue;
      }
    }

    // 处理 @ 规则
    if (!inString && !inComment && char === '@' && depth === 0) {
      const remaining = source.substring(i);
      // 检查是否是跳过作用域的规则
      for (const atRule of skipScopeAtRules) {
        if (remaining.startsWith(atRule)) {
          inAtRule = true;
          atRuleName = atRule;
          atRuleType = 'skip';
          break;
        }
      }
      // 检查是否是嵌套规则
      if (!inAtRule) {
        for (const atRule of nestedAtRules) {
          if (remaining.startsWith(atRule)) {
            inAtRule = true;
            atRuleName = atRule;
            atRuleType = 'nested';
            break;
          }
        }
      }
    }

    // 处理左大括号
    if (!inString && !inComment && char === '{') {
      if (depth === 0) {
        // 保存当前选择器
        currentSelector = currentRule.trim();
        currentRule = '';
        braceStart = i;
      }
      depth++;
      currentRule += char;
      i++;
      continue;
    }

    // 处理右大括号
    if (!inString && !inComment && char === '}') {
      depth--;
      currentRule += char;

      if (depth === 0) {
        // 处理完整的规则块
        if (inAtRule) {
          if (atRuleType === 'skip') {
            // 跳过作用域的 @ 规则直接添加
            result += currentSelector + currentRule;
          } else if (atRuleType === 'nested') {
            // 嵌套 @ 规则：为内部的选择器添加作用域
            const innerContent = currentRule.slice(1, -1); // 去掉外层大括号
            const scopedInnerContent = addScopeToStyles(
              innerContent,
              scopeSelector,
              componentNameVariants
            );
            result += currentSelector + '{' + scopedInnerContent + '}';
          } else {
            result += currentSelector + currentRule;
          }
          inAtRule = false;
          atRuleName = '';
          atRuleType = '';
        } else {
          // 普通规则，为选择器添加作用域
          const scopedSelector = addScopeToSelector(
            currentSelector,
            scopeSelector,
            componentNameVariants
          );
          result += scopedSelector + currentRule;
        }
        currentSelector = '';
        currentRule = '';
        braceStart = -1;
      }
      i++;
      continue;
    }

    // 其他字符
    currentRule += char;
    i++;
  }

  // 处理文件末尾可能剩余的内容
  if (currentRule.trim()) {
    if (depth === 0 && currentSelector) {
      const scopedSelector = addScopeToSelector(
        currentSelector,
        scopeSelector,
        componentNameVariants
      );
      result += scopedSelector + currentRule;
    } else {
      result += currentRule;
    }
  }

  return result || source;
}
/**
 * 自动添加组件样式作用域
 * @param {string} source - 原始样式内容
 * @returns {string} 添加了作用域的样式内容
 * 实现关键路径：
 * 1. 判断是否是目标文件
 * 2. 获取组件名
 * 3. 生成组件名的所有可能变体
 * 4. 为选择器添加作用域
 * 5. 返回添加了作用域的样式内容
 *
 * 特别说明，组件根节点的样式 需要和组件目录名称 产生关联，不然其根节点的样式会失效。
 */
module.exports = function componentScopeStyleLoader(source) {
  if (typeof this?.cacheable === 'function') {
    this.cacheable();
  }

  const options =
    (typeof this?.getOptions === 'function' && this.getOptions()) || this?.query || {};
  const scopeKey = options.scopeKey || DEFAULT_SCOPE_KEY;
  const componentsDir = options.componentsDir || DEFAULT_COMPONENTS_DIR;

  const resourcePath = this.resourcePath || '';
  const isTargetFile = /(index|style)\.(scss|less)$/i.test(resourcePath);
  if (!isTargetFile) {
    return source;
  }

  const componentsDirAbs = path.isAbsolute(componentsDir)
    ? componentsDir
    : path.resolve(process.cwd(), componentsDir);

  const normalizedResourcePath = normalizePath(resourcePath);
  const normalizedCmpDir = normalizePath(componentsDirAbs + path.sep);

  // 仅处理位于组件目录下的样式文件
  if (!normalizedResourcePath.startsWith(normalizedCmpDir)) {
    return source;
  }

  // 组件目录的第一层子目录名即组件名
  const relativePath = path.relative(componentsDirAbs, resourcePath);
  const pathParts = relativePath.split(path.sep);
  const cmpName = pathParts[0];

  if (!cmpName) {
    return source;
  }

  // 非组件直接子目录下的样式也不处理
  if (pathParts.length > 2) {
    return source;
  }

  // 生成组件名的所有可能变体
  const componentNameVariants = generateComponentNameVariants(cmpName);

  const scopeSelector = `[${scopeKey}="${cmpName}"]`;
  const scopedContent = addScopeToStyles(source, scopeSelector, componentNameVariants);

  return scopedContent;
};
