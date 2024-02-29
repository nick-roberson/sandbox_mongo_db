'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _formatMuiErrorMessage from "@mui/utils/formatMuiErrorMessage";
import * as React from 'react';
import { unstable_useForkRef as useForkRef, unstable_useId as useId, unstable_useControlled as useControlled } from '@mui/utils';
import { extractEventHandlers } from '../utils/extractEventHandlers';
import { useFormControlContext } from '../FormControl';
import { clampStepwise, isNumber } from './utils';
const STEP_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'];
const SUPPORTED_KEYS = [...STEP_KEYS, 'Home', 'End'];
export function getInputValueAsString(v) {
  return v ? String(v.trim()) : String(v);
}

/**
 *
 * Demos:
 *
 * - [Number Input](https://mui.com/base-ui/react-number-input/#hook)
 *
 * API:
 *
 * - [useNumberInput API](https://mui.com/base-ui/react-number-input/hooks-api/#use-number-input)
 */
export function useNumberInput(parameters) {
  const {
    min,
    max,
    step,
    shiftMultiplier = 10,
    defaultValue: defaultValueProp,
    disabled: disabledProp = false,
    error: errorProp = false,
    onBlur,
    onInputChange,
    onFocus,
    onChange,
    required: requiredProp = false,
    readOnly: readOnlyProp = false,
    value: valueProp,
    inputRef: inputRefProp,
    inputId: inputIdProp
  } = parameters;

  // TODO: make it work with FormControl
  const formControlContext = useFormControlContext();
  const {
    current: isControlled
  } = React.useRef(valueProp != null);
  const handleInputRefWarning = React.useCallback(instance => {
    if (process.env.NODE_ENV !== 'production') {
      if (instance && instance.nodeName !== 'INPUT' && !instance.focus) {
        console.error(['MUI: You have provided a `slots.input` to the input component', 'that does not correctly handle the `ref` prop.', 'Make sure the `ref` prop is called with a HTMLInputElement.'].join('\n'));
      }
    }
  }, []);
  const inputRef = React.useRef(null);
  const handleInputRef = useForkRef(inputRef, inputRefProp, handleInputRefWarning);
  const inputId = useId(inputIdProp);
  const [focused, setFocused] = React.useState(false);

  // the "final" value
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValueProp,
    name: 'NumberInput'
  });

  // the (potentially) dirty or invalid input value
  const [dirtyValue, setDirtyValue] = React.useState(value ? String(value) : undefined);
  React.useEffect(() => {
    if (!formControlContext && disabledProp && focused) {
      setFocused(false);
      onBlur == null || onBlur();
    }
  }, [formControlContext, disabledProp, focused, onBlur]);
  const createHandleFocus = otherHandlers => event => {
    var _otherHandlers$onFocu;
    (_otherHandlers$onFocu = otherHandlers.onFocus) == null || _otherHandlers$onFocu.call(otherHandlers, event);
    if (event.defaultMuiPrevented || event.defaultPrevented) {
      return;
    }
    if (formControlContext && formControlContext.onFocus) {
      var _formControlContext$o;
      formControlContext == null || (_formControlContext$o = formControlContext.onFocus) == null || _formControlContext$o.call(formControlContext);
    }
    setFocused(true);
  };
  const handleValueChange = () => (event, val) => {
    let newValue;
    if (val === undefined) {
      newValue = val;
      setDirtyValue('');
    } else {
      newValue = clampStepwise(val, min, max, step);
      setDirtyValue(String(newValue));
    }
    setValue(newValue);
    if (isNumber(newValue)) {
      onChange == null || onChange(event, newValue);
    } else {
      onChange == null || onChange(event, undefined);
    }
  };
  const createHandleInputChange = otherHandlers => event => {
    var _formControlContext$o2, _otherHandlers$onInpu;
    if (!isControlled && event.target === null) {
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Expected valid input target. Did you use a custom \`slots.input\` and forget to forward refs? See https://mui.com/r/input-component-ref-interface for more info.` : _formatMuiErrorMessage(17));
    }
    formControlContext == null || (_formControlContext$o2 = formControlContext.onChange) == null || _formControlContext$o2.call(formControlContext, event);
    (_otherHandlers$onInpu = otherHandlers.onInputChange) == null || _otherHandlers$onInpu.call(otherHandlers, event);
    if (event.defaultMuiPrevented || event.defaultPrevented) {
      return;
    }

    // TODO: event.currentTarget.value will be passed straight into the InputChange action
    const val = getInputValueAsString(event.currentTarget.value);
    if (val === '' || val === '-') {
      setDirtyValue(val);
      setValue(undefined);
    }
    if (val.match(/^-?\d+?$/)) {
      setDirtyValue(val);
      setValue(parseInt(val, 10));
    }
  };
  const createHandleBlur = otherHandlers => event => {
    var _otherHandlers$onBlur;
    (_otherHandlers$onBlur = otherHandlers.onBlur) == null || _otherHandlers$onBlur.call(otherHandlers, event);
    if (event.defaultMuiPrevented || event.defaultPrevented) {
      return;
    }

    // TODO: event.currentTarget.value will be passed straight into the Blur action, or just pass inputValue from state
    const val = getInputValueAsString(event.currentTarget.value);
    if (val === '' || val === '-') {
      handleValueChange()(event, undefined);
    } else {
      handleValueChange()(event, parseInt(val, 10));
    }
    if (formControlContext && formControlContext.onBlur) {
      formControlContext.onBlur();
    }
    setFocused(false);
  };
  const createHandleClick = otherHandlers => event => {
    var _otherHandlers$onClic;
    (_otherHandlers$onClic = otherHandlers.onClick) == null || _otherHandlers$onClic.call(otherHandlers, event);
    if (event.defaultMuiPrevented || event.defaultPrevented) {
      return;
    }
    if (inputRef.current && event.currentTarget === event.target) {
      inputRef.current.focus();
    }
  };
  const handleStep = direction => event => {
    let newValue;
    if (isNumber(value)) {
      const multiplier = event.shiftKey || event.key === 'PageUp' || event.key === 'PageDown' ? shiftMultiplier : 1;
      newValue = {
        up: value + (step != null ? step : 1) * multiplier,
        down: value - (step != null ? step : 1) * multiplier
      }[direction];
    } else {
      // no value
      newValue = {
        up: min != null ? min : 0,
        down: max != null ? max : 0
      }[direction];
    }
    handleValueChange()(event, newValue);
  };
  const createHandleKeyDown = otherHandlers => event => {
    var _otherHandlers$onKeyD;
    (_otherHandlers$onKeyD = otherHandlers.onKeyDown) == null || _otherHandlers$onKeyD.call(otherHandlers, event);
    if (event.defaultMuiPrevented || event.defaultPrevented) {
      return;
    }
    if (event.defaultPrevented) {
      return;
    }
    if (SUPPORTED_KEYS.includes(event.key)) {
      event.preventDefault();
    }
    if (STEP_KEYS.includes(event.key)) {
      const direction = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        PageUp: 'up',
        PageDown: 'down'
      }[event.key];
      handleStep(direction)(event);
    }
    if (event.key === 'Home' && isNumber(max)) {
      handleValueChange()(event, max);
    }
    if (event.key === 'End' && isNumber(min)) {
      handleValueChange()(event, min);
    }
  };
  const getRootProps = (externalProps = {}) => {
    const propsEventHandlers = extractEventHandlers(parameters, [
    // these are handled by the input slot
    'onBlur', 'onInputChange', 'onFocus', 'onChange']);
    const externalEventHandlers = _extends({}, propsEventHandlers, extractEventHandlers(externalProps));
    return _extends({}, externalProps, externalEventHandlers, {
      onClick: createHandleClick(externalEventHandlers)
    });
  };
  const getInputProps = (externalProps = {}) => {
    var _ref;
    const propsEventHandlers = {
      onBlur,
      onFocus,
      // onChange from normal props is the custom onChange so we ignore it here
      onChange: onInputChange
    };
    const externalEventHandlers = _extends({}, propsEventHandlers, extractEventHandlers(externalProps, [
    // onClick is handled by the root slot
    'onClick'
    // do not ignore 'onInputChange', we want slotProps.input.onInputChange to enter the DOM and throw
    ]));
    const mergedEventHandlers = _extends({}, externalEventHandlers, {
      onFocus: createHandleFocus(externalEventHandlers),
      // slotProps.onChange is renamed to onInputChange and passed to createHandleInputChange
      onChange: createHandleInputChange(_extends({}, externalEventHandlers, {
        onInputChange: externalEventHandlers.onChange
      })),
      onBlur: createHandleBlur(externalEventHandlers),
      onKeyDown: createHandleKeyDown(externalEventHandlers)
    });
    const displayValue = (_ref = focused ? dirtyValue : value) != null ? _ref : '';

    // get rid of slotProps.input.onInputChange before returning to prevent it from entering the DOM
    // if it was passed, it will be in mergedEventHandlers and throw
    delete externalProps.onInputChange;
    return _extends({
      type: 'text',
      id: inputId,
      'aria-invalid': errorProp || undefined,
      defaultValue: undefined,
      value: displayValue,
      'aria-valuenow': displayValue,
      'aria-valuetext': String(displayValue),
      'aria-valuemin': min,
      'aria-valuemax': max,
      autoComplete: 'off',
      autoCorrect: 'off',
      spellCheck: 'false',
      required: requiredProp,
      readOnly: readOnlyProp,
      'aria-disabled': disabledProp,
      disabled: disabledProp
    }, externalProps, {
      ref: handleInputRef
    }, mergedEventHandlers);
  };
  const handleStepperButtonMouseDown = event => {
    event.preventDefault();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const stepperButtonCommonProps = {
    'aria-controls': inputId,
    tabIndex: -1
  };
  const isIncrementDisabled = disabledProp || (isNumber(value) ? value >= (max != null ? max : Number.MAX_SAFE_INTEGER) : false);
  const getIncrementButtonProps = (externalProps = {}) => {
    return _extends({}, externalProps, stepperButtonCommonProps, {
      disabled: isIncrementDisabled,
      'aria-disabled': isIncrementDisabled,
      onMouseDown: handleStepperButtonMouseDown,
      onClick: handleStep('up')
    });
  };
  const isDecrementDisabled = disabledProp || (isNumber(value) ? value <= (min != null ? min : Number.MIN_SAFE_INTEGER) : false);
  const getDecrementButtonProps = (externalProps = {}) => {
    return _extends({}, externalProps, stepperButtonCommonProps, {
      disabled: isDecrementDisabled,
      'aria-disabled': isDecrementDisabled,
      onMouseDown: handleStepperButtonMouseDown,
      onClick: handleStep('down')
    });
  };
  return {
    disabled: disabledProp,
    error: errorProp,
    focused,
    formControlContext,
    getInputProps,
    getIncrementButtonProps,
    getDecrementButtonProps,
    getRootProps,
    required: requiredProp,
    value: focused ? dirtyValue : value,
    isIncrementDisabled,
    isDecrementDisabled,
    inputValue: dirtyValue
  };
}