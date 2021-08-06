import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

let items = document.getElementsByClassName('fc-col-header-cell-cushion');
console.log(items);

for (var item in items) {
  let date = items[item];
  let text = date.innerText;
  console.log(text);
  if (text && text.includes(' ')) {
    text = text.split(' ')[0];
    date.innerHTML = text
  }
}