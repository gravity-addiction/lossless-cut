import { forwardRef } from 'react';

const inputStyle = { borderRadius: '.4em', flexGrow: 1, fontFamily: 'inherit', fontSize: '.8em', backgroundColor: 'var(--gray3)', color: 'var(--gray12)', border: '1px solid var(--gray7)', appearance: 'none' };

const TextInput = forwardRef(({ style, ...props }, forwardedRef) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <input type="text" ref={forwardedRef} style={{ ...inputStyle, ...style }} {...props} />
));

export default TextInput;
