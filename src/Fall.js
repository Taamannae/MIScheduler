import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import {COURSES} from './sched.js'
import _ from 'lodash'
import moment from 'moment';


const DAYS = {Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6}

function isCourse(a, b) {
  return a.course === b.course
}

var allCourses = _.uniqWith(COURSES, isCourse);
const items = allCourses.map(item => {
  return { id: item.course, name: item.course + ' ' + item.title }
})

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default class Fall extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCourse: {course: '', sem: ''},
      schedule: []
    }
  }


  handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    // console.log(string, results)
    this.setState({
      color: hslToHex(Math.floor(Math.random() * 360) + 1, 71, 80)
    })
  }

  handleOnHover = (result) => {
    // the item hovered
    // console.log(result)
  }

  handleOnSelect = (item) => {
    this.setState({
      activeCourse: {course: item.id, sem: item.semester}
    })
  }

  convertTime(time, startTime) {
    let fullTime;
    if (time.includes(":")) {
      let timePeices = time.split(':');
      let hour = timePeices[0]
      let min = timePeices[1]
      if (time.includes('pm')) {
        let splitMins = min.split("pm")[0]
        let timeInt = parseInt(hour);
        fullTime = (timeInt + 12) + ':' + splitMins + ":00"

    } else {
        if (startTime && (hour === '9' || hour === '10' || hour === '11' || hour === '12')) {
          fullTime = time
        } else {
          let timeInt = parseInt(hour) + 12;
          fullTime = timeInt + ':' + min 
        }
    }

    } else {
      if (time.includes('pm')) {
        let timePeices = time.split('pm');
        let hour = timePeices[0];
        if (hour.includes('12')) {
          fullTime = '12:00'
        } else {
          let timeInt = parseInt(hour) + 12;
          fullTime = timeInt + ':00'
        }

      } else if (time.includes('am')) {
        let timePeices = time.split('am');
        let hour = timePeices[0];
        if ((startTime && (hour === '9' || hour === '10' || hour === '12')) || hour === '11') {
          fullTime = hour + ":00"
        }

      } else {
        if (startTime && (time === '9' || time === '10' || time === '11' || time === '12')) {
          console.log("is AM");
          fullTime = time + ":00"
          if (time === '9') {
            fullTime = '0' + time + ":00"

          }
        } else {
          if (time.includes('12')) {
            fullTime = '12:00'
          } else {
            let timeInt = parseInt(time) + 12;
            fullTime = timeInt + ':00'
          }

        }
      }

    }

    return fullTime;
  }

  addTime = (time) => {
    let self = this;
    var newSched = _.cloneDeep(this.state.schedule);

    let find = _.find(newSched, function (o) {
      console.log(o.id, (time.course + time.semester));
      console.log(o.title, `${time.course}: ${time.sessionType} - ${time.method}: ${time.instructor}`);
      console.log(o.title.includes(time.sessionType));

      return (o.id === time.course + time.semester && o.title === `${time.course}: ${time.sessionType} - ${time.method}: ${time.instructor}` && o.title.includes(time.sessionType))

    });

    console.log('existing', newSched);


    if (find && (time.course !== "INF1602H" && time.sessionType !== 'LEC')) {
      console.log('found');
      newSched = newSched.filter( el => el !== find);
    }

    console.log('revmoved', newSched);


    let today = moment();
    let todayDay = today.day();
    let sunday = today.subtract(todayDay, "days");
    let realday = sunday.add(DAYS[time.day], "days")
    realday = realday.format("YYYY-MM-DD");

    let classTime = time.time.split('-');
    let startTime = classTime[0]
    let endTime = classTime[1]

    let times = {
      id: time.course + time.semester,
      title: `${time.course}: ${time.sessionType} - ${time.method}: ${time.instructor}`,
      color: this.state.color,
      start: `${realday}T${this.convertTime(String(startTime), true)}`,
      end: `${realday}T${this.convertTime(String(endTime), false)}`,
    }

    console.log('newscehd', newSched);

    this.setState({
      schedule: newSched.concat(times)
    })


  }

  realday = (x) => {
    let today = moment();
    let todayDay = today.day();
    let sunday = today.subtract(todayDay, "days");
    let realday = sunday.add(DAYS[x.day], "days")
    return realday.format("YYYY-MM-DD");
  }

  renderCourseOptions = () => {
    if (this.state.activeCourse.course !== ''){
      let items = COURSES.filter(x => x.course === this.state.activeCourse.course);
      
      let lec = items.filter(x => x.sessionType === "LEC");
      let pra = items.filter(x => x.sessionType === "PRA");
      let tut = items.filter(x => x.sessionType === "TUT");

      let praGroup;
      let tutGroup;
      let lecGroup = lec.map(x => {

        let className = ''
        let find = _.find(this.state.schedule, function (o) { 
          return (o.id === x.course + x.semester && o.title === `${x.course}: ${x.sessionType} - ${x.method}: ${x.instructor}`)
        
        });
        if (find) {
          className = 'selected-item'
        }
        return (
          <div class={"class-tile " + className } onClick={() => this.addTime(x)}>
              <div className="class-times">
              <h4>{x.sessionType} {x.section}</h4>
              <h3>{x.day} {x.time}</h3>
              <p>{x.subtitle}</p>
              </div>
            <div className="info">
              <h4><img src='/user.svg' />{x.instructor}</h4>
              <h4><img src='/monitor.svg' /> {x.method}</h4>
            </div>
            </div>
        )
      })

      if (pra.length > 0) {
        let self = this

        praGroup = (
          
          <div className="pra-group">
            <h3 className="title">Add a practical</h3>
            {pra.map(x => {

              let className = ''

              let find = _.find(this.state.schedule, function (o) {
                let classTime = x.time.split('-');
                let startTime = classTime[0]
                let endTime = classTime[1]

                let start = `${self.realday(x)}T${self.convertTime(String(startTime, true), true)}`;
                let end = `${self.realday(x)}T${self.convertTime(String(endTime))}`

                return (o.id === x.course + x.semester && o.title === `${x.course}: ${x.sessionType} - ${x.method}: ${x.instructor}` && o.start === start && o.end === end)

              });
              if (find) {
                className = 'selected-item'
              }

          return (


            <div class={"class-tile " + className} onClick={() => this.addTime(x)}>
              <div className="class-times">
                <h4>{x.sessionType} {x.section}</h4>
                <h3>{x.day} {x.time}</h3>
              </div>
              <div className="info">
                <h4><img src='/user.svg' />{x.instructor}</h4>
                <h4><img src='/monitor.svg' /> {x.method}</h4>
              </div>
            </div>
          )
          })} </div>)

      }
      if (tut.length > 0) {
        let self = this

        tutGroup = (
          
          <div className="tut-group">
            <h3 className="title">Add a tutorial</h3>
            {tut.map(x => {

              let className = ''

              let find = _.find(this.state.schedule, function (o) {
                let classTime = x.time.split('-');
                let startTime = classTime[0]
                let endTime = classTime[1]

                let start = `${self.realday(x)}T${self.convertTime(String(startTime, true), true)}`;
                let end = `${self.realday(x)}T${self.convertTime(String(endTime))}`

                return (o.id === x.course + x.semester && o.title === `${x.course}: ${x.sessionType} - ${x.method}: ${x.instructor}` && o.start === start && o.end === end )

              });
              if (find) {
                className = 'selected-item'
              }
          return (
            <div class={"class-tile " + className} onClick={() => this.addTime(x)}>
              <div className="class-times">
                <h4>{x.sessionType} {x.section}</h4>
                <h3>{x.day} {x.time}</h3>
              </div>
              <div className="info">
                <h4><img src='/user.svg' />{x.instructor}</h4>
                <h4><img src='/monitor.svg' /> {x.method}</h4>
              </div>
            </div>
          )
          })} </div>)

      }


      return(
        <div>
          <div className="header-info">
            <h4>{items[0].course}</h4>
            <h2>{items[0].title}</h2>
          </div>
          <div>
          <div className="lec-group">
            <h3 className="title">Add a Lecture</h3>
            {lecGroup}
          </div>
          {tutGroup}
          {praGroup}
          </div>
        </div>
      )
    }
  }


  handleEvent = (e) => {
    let classId = e.event.id;
    
    let sem = classId.slice(-1);
    let code = classId.slice(0, -1);
    console.log(e.event);
    this.setState({
      activeCourse: {course: code, sem: sem},
      color: e.event.backgroundColor
    })

  }
  handleOnFocus = () => {
    // console.log('Focused')
  }

  formatResult = (item) => {
    return item;
    // return (<p dangerouslySetInnerHTML={{__html: '<strong>'+item+'</strong>'}}></p>); //To format result as html
  }
  render() {
    console.log(this.state.schedule);
  return (
    <div className="App">
      <div className="App-header">
        <div style={{width: '100%'}}>
          <ReactSearchAutocomplete
            items={items}
            onSearch={this.handleOnSearch}
            onHover={this.handleOnHover}
            onSelect={this.handleOnSelect}
            onFocus={this.handleOnFocus}
            autoFocus
            formatResult={this.formatResult}
          />
        </div>
        {this.renderCourseOptions()}
      </div>
<div className="calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height="100%"
        events={this.state.schedule}
        expandRows={true}
        slotMinTime="09:00:00"
        slotMaxTime="21:30:00"
        eventClick={this.handleEvent}
        allDaySlot={false}
        slotDuration="01:00:00"
        resources={['monday']}
        headerToolbar={{
          center: '',
          end: '',
          title: ''
          
        }}
      />
    </div>
    
    </div>
  );
      }
}

