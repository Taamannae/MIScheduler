import './App.css';
import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Fall from './Fall'
import Winter from './Winter'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCourse: {course: '', sem: ''},
      schedule: []
    }
  }

  render() {
  return (
    <div className="App">
      <Tabs>
        <TabList>
          <Tab>Fall 2021 Schedule</Tab>
          <Tab>Winter 2020 Schedule</Tab>
        </TabList>

        <TabPanel>
          <Fall></Fall>
        </TabPanel>
        <TabPanel>
          <Winter/>
        </TabPanel>
      </Tabs>
    </div>
  );
      }
}

