'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import * as React from 'react';
import PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import { unstable_debounce as debounce, unstable_useForkRef as useForkRef, unstable_useEnhancedEffect as useEnhancedEffect, unstable_ownerWindow as ownerWindow } from '@mui/utils';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
function getStyleValue(value) {
  return parseInt(value, 10) || 0;
}
var styles = {
  shadow: {
    // Visibility needed to hide the extra text area on iPads
    visibility: 'hidden',
    // Remove from the content flow
    position: 'absolute',
    // Ignore the scrollbar width
    overflow: 'hidden',
    height: 0,
    top: 0,
    left: 0,
    // Create a new layer, increase the isolation of the computed values
    transform: 'translateZ(0)'
  }
};
function isEmpty(obj) {
  return obj === undefined || obj === null || Object.keys(obj).length === 0 || obj.outerHeightStyle === 0 && !obj.overflow;
}

/**
 *
 * Demos:
 *
 * - [Textarea Autosize](https://mui.com/base-ui/react-textarea-autosize/)
 * - [Textarea Autosize](https://mui.com/material-ui/react-textarea-autosize/)
 *
 * API:
 *
 * - [TextareaAutosize API](https://mui.com/base-ui/react-textarea-autosize/components-api/#textarea-autosize)
 */
var TextareaAutosize = /*#__PURE__*/React.forwardRef(function TextareaAutosize(props, forwardedRef) {
  var onChange = props.onChange,
    maxRows = props.maxRows,
    _props$minRows = props.minRows,
    minRows = _props$minRows === void 0 ? 1 : _props$minRows,
    style = props.style,
    value = props.value,
    other = _objectWithoutProperties(props, ["onChange", "maxRows", "minRows", "style", "value"]);
  var _React$useRef = React.useRef(value != null),
    isControlled = _React$useRef.current;
  var inputRef = React.useRef(null);
  var handleRef = useForkRef(forwardedRef, inputRef);
  var shadowRef = React.useRef(null);
  var renders = React.useRef(0);
  var _React$useState = React.useState({
      outerHeightStyle: 0
    }),
    state = _React$useState[0],
    setState = _React$useState[1];
  var getUpdatedState = React.useCallback(function () {
    var input = inputRef.current;
    var containerWindow = ownerWindow(input);
    var computedStyle = containerWindow.getComputedStyle(input);

    // If input's width is shrunk and it's not visible, don't sync height.
    if (computedStyle.width === '0px') {
      return {
        outerHeightStyle: 0
      };
    }
    var inputShallow = shadowRef.current;
    inputShallow.style.width = computedStyle.width;
    inputShallow.value = input.value || props.placeholder || 'x';
    if (inputShallow.value.slice(-1) === '\n') {
      // Certain fonts which overflow the line height will cause the textarea
      // to report a different scrollHeight depending on whether the last line
      // is empty. Make it non-empty to avoid this issue.
      inputShallow.value += ' ';
    }
    var boxSizing = computedStyle.boxSizing;
    var padding = getStyleValue(computedStyle.paddingBottom) + getStyleValue(computedStyle.paddingTop);
    var border = getStyleValue(computedStyle.borderBottomWidth) + getStyleValue(computedStyle.borderTopWidth);

    // The height of the inner content
    var innerHeight = inputShallow.scrollHeight;

    // Measure height of a textarea with a single row
    inputShallow.value = 'x';
    var singleRowHeight = inputShallow.scrollHeight;

    // The height of the outer content
    var outerHeight = innerHeight;
    if (minRows) {
      outerHeight = Math.max(Number(minRows) * singleRowHeight, outerHeight);
    }
    if (maxRows) {
      outerHeight = Math.min(Number(maxRows) * singleRowHeight, outerHeight);
    }
    outerHeight = Math.max(outerHeight, singleRowHeight);

    // Take the box sizing into account for applying this value as a style.
    var outerHeightStyle = outerHeight + (boxSizing === 'border-box' ? padding + border : 0);
    var overflow = Math.abs(outerHeight - innerHeight) <= 1;
    return {
      outerHeightStyle: outerHeightStyle,
      overflow: overflow
    };
  }, [maxRows, minRows, props.placeholder]);
  var updateState = function updateState(prevState, newState) {
    var outerHeightStyle = newState.outerHeightStyle,
      overflow = newState.overflow; // Need a large enough difference to update the height.
    // This prevents infinite rendering loop.
    if (renders.current < 20 && (outerHeightStyle > 0 && Math.abs((prevState.outerHeightStyle || 0) - outerHeightStyle) > 1 || prevState.overflow !== overflow)) {
      renders.current += 1;
      return {
        overflow: overflow,
        outerHeightStyle: outerHeightStyle
      };
    }
    if (process.env.NODE_ENV !== 'production') {
      if (renders.current === 20) {
        console.error(['MUI: Too many re-renders. The layout is unstable.', 'TextareaAutosize limits the number of renders to prevent an infinite loop.'].join('\n'));
      }
    }
    return prevState;
  };
  var syncHeight = React.useCallback(function () {
    var newState = getUpdatedState();
    if (isEmpty(newState)) {
      return;
    }
    setState(function (prevState) {
      return updateState(prevState, newState);
    });
  }, [getUpdatedState]);
  useEnhancedEffect(function () {
    var syncHeightWithFlushSync = function syncHeightWithFlushSync() {
      var newState = getUpdatedState();
      if (isEmpty(newState)) {
        return;
      }

      // In React 18, state updates in a ResizeObserver's callback are happening after
      // the paint, this leads to an infinite rendering.
      //
      // Using flushSync ensures that the states is updated before the next pain.
      // Related issue - https://github.com/facebook/react/issues/24331
      ReactDOM.flushSync(function () {
        setState(function (prevState) {
          return updateState(prevState, newState);
        });
      });
    };
    var handleResize = function handleResize() {
      renders.current = 0;
      syncHeightWithFlushSync();
    };
    // Workaround a "ResizeObserver loop completed with undelivered notifications" error
    // in test.
    // Note that we might need to use this logic in production per https://github.com/WICG/resize-observer/issues/38
    // Also see https://github.com/mui/mui-x/issues/8733
    var rAF;
    var rAFHandleResize = function rAFHandleResize() {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(function () {
        handleResize();
      });
    };
    var debounceHandleResize = debounce(handleResize);
    var input = inputRef.current;
    var containerWindow = ownerWindow(input);
    containerWindow.addEventListener('resize', debounceHandleResize);
    var resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(process.env.NODE_ENV === 'test' ? rAFHandleResize : handleResize);
      resizeObserver.observe(input);
    }
    return function () {
      debounceHandleResize.clear();
      cancelAnimationFrame(rAF);
      containerWindow.removeEventListener('resize', debounceHandleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [getUpdatedState]);
  useEnhancedEffect(function () {
    syncHeight();
  });
  React.useEffect(function () {
    renders.current = 0;
  }, [value]);
  var handleChange = function handleChange(event) {
    renders.current = 0;
    if (!isControlled) {
      syncHeight();
    }
    if (onChange) {
      onChange(event);
    }
  };
  return /*#__PURE__*/_jsxs(React.Fragment, {
    children: [/*#__PURE__*/_jsx("textarea", _extends({
      value: value,
      onChange: handleChange,
      ref: handleRef
      // Apply the rows prop to get a "correct" first SSR paint
      ,
      rows: minRows,
      style: _extends({
        height: state.outerHeightStyle,
        // Need a large enough difference to allow scrolling.
        // This prevents infinite rendering loop.
        overflow: state.overflow ? 'hidden' : undefined
      }, style)
    }, other)), /*#__PURE__*/_jsx("textarea", {
      "aria-hidden": true,
      className: props.className,
      readOnly: true,
      ref: shadowRef,
      tabIndex: -1,
      style: _extends({}, styles.shadow, style, {
        paddingTop: 0,
        paddingBottom: 0
      })
    })]
  });
});
process.env.NODE_ENV !== "production" ? TextareaAutosize.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Maximum number of rows to display.
   */
  maxRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Minimum number of rows to display.
   * @default 1
   */
  minRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * @ignore
   */
  onChange: PropTypes.func,
  /**
   * @ignore
   */
  placeholder: PropTypes.string,
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * @ignore
   */
  value: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.number, PropTypes.string])
} : void 0;
export { TextareaAutosize };