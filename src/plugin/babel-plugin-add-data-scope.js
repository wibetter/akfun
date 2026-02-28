/**
 * Babel 插件：自动在 React 组件的最外层元素添加 scopeKey 属性
 *
 * 使用场景：
 * - 在构建 React 组件时，自动为组件的根元素添加 scopeKey 属性
 * - 支持函数组件和类组件
 * - 如果组件返回 Fragment 或数组，会在 Fragment 的第一个子元素或数组的第一个元素上添加
 * - scopeKey 的值默认为当前组件所在文件目录的名称
 */
const path = require('path');

/**
 * @param {*} babelParams
 * babelTypes（即 @babel/types）提供：
 * 节点类型检查：babelTypes.isJSXElement(node)
 * 创建节点：babelTypes.jsxAttribute(...)
 * 节点构造器：babelTypes.stringLiteral('value')
 * 节点操作：path.get('body')、path.traverse({})
 *
 * @param {*} options 插件配置对象
 * scopeKey 数据作用域的键名，默认为 'data-scope'
 */
module.exports = function (babelParams, options) {
  const { types: babelTypes } = babelParams;
  const scopeKey = (options || {}).scopeKey || 'data-scope';
  /**
   * 获取文件所在目录的名称
   */
  function getDirectoryName(filePath) {
    if (!filePath) {
      return '';
    }
    try {
      const dirPath = path.dirname(filePath);
      const dirName = path.basename(dirPath);
      return dirName || '';
    } catch (e) {
      return '';
    }
  }
  /**
   * 判断 callee 是否是 React.createElement
   */
  function isReactCreateElementCallee(calleePath) {
    if (!calleePath) {
      return false;
    }
    if (
      calleePath.isMemberExpression() &&
      babelTypes.isIdentifier(calleePath.get('object').node, { name: 'React' }) &&
      babelTypes.isIdentifier(calleePath.get('property').node, { name: 'createElement' })
    ) {
      return true;
    }
    return calleePath.isIdentifier({ name: 'createElement' });
  }

  /**
   * 判断 callee 是否是 React 17 自动 JSX 运行时生成的 jsx/jsxs/jsxDEV 调用
   * 支持 _jsx/_jsxs 形式（ts 编译后的别名）
   */
  const jsxRuntimeCalleeNames = new Set(['jsx', 'jsxs', 'jsxDEV', '_jsx', '_jsxs', '_jsxDEV']);
  function isReactJSXRuntimeCallee(calleePath) {
    return (
      calleePath && calleePath.isIdentifier() && jsxRuntimeCalleeNames.has(calleePath.node.name)
    );
  }

  /**
   * 判断是否是 React 元素生成调用（createElement 或 jsx/jsxs/jsxDEV）
   */
  function isReactElementCall(callPath) {
    if (!callPath || !callPath.isCallExpression()) {
      return false;
    }
    const calleePath = callPath.get('callee');
    return isReactCreateElementCallee(calleePath) || isReactJSXRuntimeCallee(calleePath);
  }

  /**
   * 判断元素类型是否是 Fragment
   */
  function isFragmentType(typePath) {
    if (!typePath || !typePath.node) {
      return false;
    }
    if (babelTypes.isIdentifier(typePath.node, { name: 'Fragment' })) {
      return true;
    }
    if (
      babelTypes.isMemberExpression(typePath.node) &&
      babelTypes.isIdentifier(typePath.node.object, { name: 'React' }) &&
      babelTypes.isIdentifier(typePath.node.property, { name: 'Fragment' })
    ) {
      return true;
    }
    return false;
  }

  /**
   * 判断 ObjectExpression 中是否已有 scopeKey
   */
  function hasScopeKeyInProps(objectExpressionNode) {
    return objectExpressionNode.properties.some((prop) => {
      if (!babelTypes.isObjectProperty(prop) || prop.computed) {
        return false;
      }
      if (babelTypes.isIdentifier(prop.key) && prop.key.name === scopeKey) {
        return true;
      }
      return babelTypes.isStringLiteral(prop.key) && prop.key.value === scopeKey;
    });
  }

  /**
   * 创建一个 scopeKey 的 object property
   */
  function createScopeProperty(scopeValue) {
    const key = babelTypes.isValidIdentifier(scopeKey)
      ? babelTypes.identifier(scopeKey)
      : babelTypes.stringLiteral(scopeKey);
    return babelTypes.objectProperty(key, babelTypes.stringLiteral(scopeValue));
  }

  /**
   * 为 props 对象添加 scopeKey
   */
  function addScopeToPropsObject(propsPath, scopeValue) {
    if (!propsPath) {
      return;
    }

    // props 为 null/undefined 时直接替换为对象
    if (propsPath.isNullLiteral() || propsPath.isIdentifier({ name: 'undefined' })) {
      propsPath.replaceWith(babelTypes.objectExpression([createScopeProperty(scopeValue)]));
      return;
    }

    if (propsPath.isObjectExpression()) {
      if (hasScopeKeyInProps(propsPath.node)) {
        return;
      }
      propsPath.node.properties.unshift(createScopeProperty(scopeValue));
      return;
    }

    // 其他类型的 props，使用 Object.assign 合并
    propsPath.replaceWith(
      babelTypes.callExpression(
        babelTypes.memberExpression(
          babelTypes.identifier('Object'),
          babelTypes.identifier('assign')
        ),
        [babelTypes.objectExpression([createScopeProperty(scopeValue)]), propsPath.node]
      )
    );
  }

  /**
   * 处理 Fragment 的子元素，找到首个可注入的元素
   */
  function processFragmentChildren(callPath, scopeValue) {
    const args = callPath.get('arguments');
    // jsx/jsxs 调用的 children 在第二个参数（props.children）
    const propsPath = args[1];
    if (propsPath && propsPath.isObjectExpression()) {
      const propPaths = propsPath.get('properties');
      for (const propPath of propPaths) {
        if (
          propPath.isObjectProperty() &&
          !propPath.node.computed &&
          ((babelTypes.isIdentifier(propPath.node.key) && propPath.node.key.name === 'children') ||
            (babelTypes.isStringLiteral(propPath.node.key) &&
              propPath.node.key.value === 'children'))
        ) {
          const valuePath = propPath.get('value');
          if (Array.isArray(valuePath)) {
            // safety: ObjectProperty value returns NodePath, not array
            continue;
          }
          if (processJSXLikePath(valuePath, scopeValue)) {
            return true;
          }
        }
      }
    }

    // createElement 形式的 children 在第三个参数开始
    for (let i = 2; i < args.length; i++) {
      if (processJSXLikePath(args[i], scopeValue)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 处理 createElement/jsx 调用，向 props 注入 scopeKey
   */
  function processCreateElementCall(callPath, scopeValue) {
    if (!isReactElementCall(callPath)) {
      return false;
    }

    const args = callPath.get('arguments');
    const typePath = args[0];
    const isFragment = isFragmentType(typePath);

    if (isFragment) {
      // Fragment 需要把 scopeKey 添加到首个子元素
      const handled = processFragmentChildren(callPath, scopeValue);
      if (handled) {
        return true;
      }
      // 如果没有子元素可处理，则回退到为 Fragment props 添加
    }

    // jsx/jsxs/createElement 的 props 都在第二个参数
    const propsIndex = 1;
    if (!args[propsIndex]) {
      callPath.node.arguments[propsIndex] = babelTypes.objectExpression([]);
    }
    const propsPath = callPath.get('arguments')[propsIndex];
    addScopeToPropsObject(propsPath, scopeValue);
    return true;
  }

  /**
   * 递归判断表达式中是否包含 JSX 或 React 元素调用
   */
  function containsJSXLike(nodePath) {
    if (!nodePath || !nodePath.node) {
      return false;
    }
    if (nodePath.isJSXElement() || nodePath.isJSXFragment()) {
      return true;
    }
    if (nodePath.isArrayExpression()) {
      return nodePath.get('elements').some((element) => containsJSXLike(element));
    }
    if (nodePath.isConditionalExpression()) {
      return (
        containsJSXLike(nodePath.get('consequent')) || containsJSXLike(nodePath.get('alternate'))
      );
    }
    if (nodePath.isLogicalExpression()) {
      return containsJSXLike(nodePath.get('left')) || containsJSXLike(nodePath.get('right'));
    }
    if (nodePath.isCallExpression()) {
      if (isReactElementCall(nodePath)) {
        return true;
      }
      // 进一步查看参数里是否有 JSX 结构
      return nodePath.get('arguments').some((argPath) => containsJSXLike(argPath));
    }
    return false;
  }

  /**
   * 递归处理可能的 JSX/React 元素表达式
   */
  function processJSXLikePath(nodePath, scopeValue) {
    if (!nodePath || !nodePath.node) {
      return false;
    }

    if (nodePath.isJSXElement()) {
      addDataScopeAttribute(nodePath.node, scopeValue);
      return true;
    }

    if (nodePath.isJSXFragment()) {
      const children = nodePath.get('children');
      for (const child of children) {
        if (processJSXLikePath(child, scopeValue)) {
          return true;
        }
      }
      return false;
    }

    if (nodePath.isArrayExpression()) {
      const elements = nodePath.get('elements');
      for (const element of elements) {
        if (processJSXLikePath(element, scopeValue)) {
          return true;
        }
      }
      return false;
    }

    if (nodePath.isConditionalExpression()) {
      const handledConsequent = processJSXLikePath(nodePath.get('consequent'), scopeValue);
      const handledAlternate = processJSXLikePath(nodePath.get('alternate'), scopeValue);
      return handledConsequent || handledAlternate;
    }

    if (nodePath.isLogicalExpression()) {
      const handledLeft = processJSXLikePath(nodePath.get('left'), scopeValue);
      const handledRight = processJSXLikePath(nodePath.get('right'), scopeValue);
      return handledLeft || handledRight;
    }

    if (nodePath.isCallExpression()) {
      return processCreateElementCall(nodePath, scopeValue);
    }

    return false;
  }
  /**
   * 检查函数是否返回 JSX（用于判断是否是 React 组件）
   */
  function returnsJSX(path) {
    const body = path.get('body');

    if (body.isBlockStatement()) {
      // 检查函数体中是否有返回 JSX 的语句
      let hasJSXReturn = false;
      body.traverse({
        ReturnStatement(returnPath) {
          const argument = returnPath.get('argument');
          if (argument.node && containsJSXLike(argument)) {
            hasJSXReturn = true;
            returnPath.stop();
          }
        }
      });
      return hasJSXReturn;
    }

    if (containsJSXLike(body)) {
      // 箭头函数或表达式直接返回 JSX/React 元素调用
      return true;
    }

    return false;
  }

  /**
   * 在 JSX 元素上添加 scopeKey 属性
   * @param {Object} jsxElement - JSX 元素节点
   * @param {string} scopeValue - scopeKey 的值，默认为空字符串
   */
  function addDataScopeAttribute(jsxElement, scopeValue = '') {
    const openingElement = jsxElement.openingElement;
    const attributes = openingElement.attributes;

    // 检查是否已经存在 scopeKey 属性
    const hasDataScope = attributes.some(
      (attr) => babelTypes.isJSXAttribute(attr) && attr.name.name === scopeKey
    );

    if (!hasDataScope) {
      // 创建 scopeKey 属性，值为目录名
      const dataScopeAttr = babelTypes.jsxAttribute(
        babelTypes.jsxIdentifier(scopeKey),
        babelTypes.stringLiteral(scopeValue)
      );
      // 添加到属性列表的开头
      attributes.unshift(dataScopeAttr);
    }
  }

  /**
   * 处理返回语句中的 JSX
   * @param {Object} path - Babel path 对象
   * @param {string} scopeValue - scopeKey 的值
   */
  function processReturnStatement(path, scopeValue) {
    const argument = path.get('argument');

    if (!argument.node) {
      return;
    }

    processJSXLikePath(argument, scopeValue);
  }

  return {
    visitor: {
      // 处理函数组件和箭头函数组件
      Function(functionPath) {
        // 只处理返回 JSX 的函数（即 React 组件）
        if (!returnsJSX(functionPath)) {
          return;
        }

        // 获取当前文件路径并提取目录名
        const filePath = functionPath.hub?.file?.opts?.filename || '';
        const scopeValue = getDirectoryName(filePath);

        const body = functionPath.get('body');

        // 处理函数体中的返回语句
        if (body.isBlockStatement()) {
          body.traverse({
            ReturnStatement(returnPath) {
              processReturnStatement(returnPath, scopeValue);
            }
          });
        } else {
          // 箭头函数或表达式体直接返回 React 元素调用
          processJSXLikePath(body, scopeValue);
        }
      },

      // 处理类组件（推荐方式：使用 Class visitor 更可靠）
      Class(classPath) {
        // 检查是否是 React 组件类（继承自 React.Component、React.PureComponent 或 BaseCmp）
        const superClass = classPath.node.superClass;
        if (!superClass) {
          return;
        }

        // 检查是否是 React 组件相关的类
        // 支持：React.Component、React.PureComponent、BaseCmp 等
        const isReactComponent =
          (babelTypes.isIdentifier(superClass) &&
            (superClass.name === 'Component' ||
              superClass.name === 'PureComponent' ||
              superClass.name === 'BaseCmp')) ||
          (babelTypes.isMemberExpression(superClass) &&
            babelTypes.isIdentifier(superClass.object) &&
            superClass.object.name === 'React');

        if (!isReactComponent) {
          return;
        }

        // 获取当前文件路径并提取目录名
        const filePath = classPath.hub?.file?.opts?.filename || '';
        const scopeValue = getDirectoryName(filePath);

        // 遍历类的方法，查找 render 方法
        classPath.traverse({
          ClassMethod(methodPath) {
            const methodKey = methodPath.node.key;
            // 检查是否是 render 方法（排除 getter/setter）
            if (
              methodPath.node.kind === 'method' &&
              babelTypes.isIdentifier(methodKey) &&
              methodKey.name === 'render'
            ) {
              const body = methodPath.get('body');
              if (body.isBlockStatement()) {
                body.traverse({
                  ReturnStatement(returnPath) {
                    processReturnStatement(returnPath, scopeValue);
                  }
                });
              }
            }
          }
        });
      },

      // 处理类组件的 render 方法（备选方案：直接使用 ClassMethod visitor）
      ClassMethod(classMethodPath) {
        // 放宽条件判断，只排除 getter/setter
        const methodKey = classMethodPath.node.key;
        const isRenderMethod =
          classMethodPath.node.kind === 'method' &&
          babelTypes.isIdentifier(methodKey) &&
          methodKey.name === 'render';

        if (isRenderMethod) {
          // 获取当前文件路径并提取目录名
          const filePath = classMethodPath.hub?.file?.opts?.filename || '';
          const scopeValue = getDirectoryName(filePath);

          const body = classMethodPath.get('body');
          if (body.isBlockStatement()) {
            body.traverse({
              ReturnStatement(returnPath) {
                processReturnStatement(returnPath, scopeValue);
              }
            });
          }
        }
      }
    }
  };
};
