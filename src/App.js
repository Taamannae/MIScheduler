import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Fall from './Fall'
import Winter from './Winter'

export default class App extends React.Component {
  render() {
    
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Fall} />
        <Route path="/winter" exact component={Winter} />
      </Switch>
    </Router>
  );
      }
}

