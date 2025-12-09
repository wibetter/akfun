/**
 * Babel 插件：自动在 React 组件的最外层元素添加 data-scope 属性
 *
 * 使用场景：
 * - 在构建 React 组件时，自动为组件的根元素添加 data-scope 属性
 * - 支持函数组件和类组件
 * - 如果组件返回 Fragment 或数组，会在 Fragment 的第一个子元素或数组的第一个元素上添加
 */
module.exports = function ({ types: t }) {
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
          if (
            argument.node &&
            (argument.isJSXElement() || argument.isJSXFragment() || argument.isArrayExpression())
          ) {
            hasJSXReturn = true;
            returnPath.stop();
          }
        }
      });
      return hasJSXReturn;
    } else if (body.isJSXElement() || body.isJSXFragment()) {
      // 箭头函数直接返回 JSX
      return true;
    }

    return false;
  }

  /**
   * 在 JSX 元素上添加 data-scope 属性
   */
  function addDataScopeAttribute(jsxElement) {
    const openingElement = jsxElement.openingElement;
    const attributes = openingElement.attributes;

    // 检查是否已经存在 data-scope 属性
    const hasDataScope = attributes.some(
      (attr) => t.isJSXAttribute(attr) && attr.name.name === 'data-scope'
    );

    if (!hasDataScope) {
      // 创建 data-scope 属性
      const dataScopeAttr = t.jsxAttribute(t.jsxIdentifier('data-scope'), t.stringLiteral(''));
      // 添加到属性列表的开头
      attributes.unshift(dataScopeAttr);
    }
  }

  /**
   * 处理返回语句中的 JSX
   */
  function processReturnStatement(path) {
    const argument = path.get('argument');

    if (!argument.node) {
      return;
    }

    // 处理 JSX 元素
    if (argument.isJSXElement()) {
      addDataScopeAttribute(argument.node);
      return;
    }

    // 处理 JSX Fragment
    if (argument.isJSXFragment()) {
      const children = argument.get('children');
      // 找到第一个 JSX 元素子节点
      for (const child of children) {
        if (child.isJSXElement()) {
          addDataScopeAttribute(child.node);
          return;
        }
        // 如果子节点是 Fragment，递归处理
        if (child.isJSXFragment()) {
          processReturnStatement(child);
          return;
        }
      }
    }

    // 处理数组返回（多个元素）
    if (argument.isArrayExpression()) {
      const elements = argument.get('elements');
      // 找到第一个 JSX 元素
      for (const element of elements) {
        if (element.isJSXElement()) {
          addDataScopeAttribute(element.node);
          return;
        }
      }
    }

    // 处理条件表达式（三元运算符）
    if (argument.isConditionalExpression()) {
      // 处理 true 分支
      const consequent = argument.get('consequent');
      if (consequent.isJSXElement()) {
        addDataScopeAttribute(consequent.node);
      } else if (consequent.isJSXFragment() || consequent.isArrayExpression()) {
        processReturnStatement(consequent);
      }

      // 处理 false 分支
      const alternate = argument.get('alternate');
      if (alternate.isJSXElement()) {
        addDataScopeAttribute(alternate.node);
      } else if (alternate.isJSXFragment() || alternate.isArrayExpression()) {
        processReturnStatement(alternate);
      }
    }

    // 处理逻辑表达式（&& 或 ||）
    if (argument.isLogicalExpression()) {
      const right = argument.get('right');
      if (right.isJSXElement()) {
        addDataScopeAttribute(right.node);
      } else if (right.isJSXFragment() || right.isArrayExpression()) {
        processReturnStatement(right);
      }
    }
  }

  return {
    visitor: {
      // 处理函数组件和箭头函数组件
      Function(path) {
        // 只处理返回 JSX 的函数（即 React 组件）
        if (!returnsJSX(path)) {
          return;
        }

        const body = path.get('body');

        // 处理函数体中的返回语句
        if (body.isBlockStatement()) {
          body.traverse({
            ReturnStatement(returnPath) {
              processReturnStatement(returnPath);
            }
          });
        } else if (body.isJSXElement()) {
          // 箭头函数直接返回 JSX
          addDataScopeAttribute(body.node);
        } else if (body.isJSXFragment()) {
          // 箭头函数直接返回 Fragment
          const children = body.get('children');
          for (const child of children) {
            if (child.isJSXElement()) {
              addDataScopeAttribute(child.node);
              return;
            }
          }
        }
      },

      // 处理类组件的 render 方法
      ClassMethod(path) {
        if (path.node.kind === 'method' && path.node.key.name === 'render') {
          const body = path.get('body');
          if (body.isBlockStatement()) {
            body.traverse({
              ReturnStatement(returnPath) {
                processReturnStatement(returnPath);
              }
            });
          }
        }
      }
    }
  };
};
