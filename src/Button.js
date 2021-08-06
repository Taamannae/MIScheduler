import React from 'react';
import './Button.css';


function Button(props) {
  return (
    <a href={props.href} target={props.target} className="button">
      {props.children}
    </a>
  );
}

export default Button;
