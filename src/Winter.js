import './App.css';
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { COURSES } from './win.js'
import _ from 'lodash'
import moment from 'moment';
import Button from './Button';
import FeatherIcon from 'feather-icons-react';


const DAYS = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }

function isCourse(a, b) {
  return a.course === b.course
}

var allCourses = _.uniqWith(COURSES, isCourse);
const items = allCourses.map(item => {
  return { id: item.course, name: item.course + ' ' + item.title, key: item.course + ' ' + item.title }
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

export default class Winter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCourse: { course: '', sem: '' },
      schedule: []
    }
  }


  handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    this.setState({
      color: hslToHex(Math.floor(Math.random() * 360) + 1, 71, 80)
    })
  }

  handleOnHover = (result) => {
    // the item hovered
  }

  handleOnSelect = (item) => {
    this.setState({
      activeCourse: { course: item.id, sem: item.semester }
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
    var newSched = _.cloneDeep(this.state.schedule);

    let today = moment();
    let todayDay = today.day();
    let sunday = today.subtract(todayDay, "days");
    let realday = sunday.add(DAYS[time.day], "days")
    realday = realday.format("YYYY-MM-DD");

    let classTime = time.time.split('-');
    let startTime = classTime[0]
    let endTime = classTime[1];

    let times;



    let find = _.find(newSched, function (o) {
      return (o.id === time.course + ':' + time.sessionType && o.title.includes(time.sessionType))

    });
    if (time.course === "INF1602H" && time.sessionType === 'LEC') {
      let realday2 = sunday.add(DAYS[time.day_2], "days")
      realday2 = realday2.format("YYYY-MM-DD");

      let classTime = time.time_2.split('-');
      let startTime2 = classTime[0]
      let endTime2 = classTime[1];


      times = [{
        id: time.course + ':' + time.sessionType,
        title: `${time.course}: ${time.sessionType} ${time.section} - ${time.method} ${time.room}`,
        color: this.state.color,
        start: `${realday}T${this.convertTime(String(startTime), true)}`,
        end: `${realday}T${this.convertTime(String(endTime), false)}`,
      }, {
        id: time.course + ':' + time.sessionType,
        title: `${time.course}: ${time.sessionType} ${time.section} - ${time.method} ${time.room}`,
        color: this.state.color,
        start: `${realday2}T${this.convertTime(String(startTime2), true)}`,
        end: `${realday2}T${this.convertTime(String(endTime2), false)}`,
      }
      ]

      this.setState({
        schedule: newSched.concat(times)
      })

      localStorage.setItem('winSched', newSched);

      return
    } else if (find) {
      newSched = newSched.filter(el => el !== find);
    }


    times = {
      id: time.course + ':' + time.sessionType,
      title: `${time.course}: ${time.sessionType} ${time.section} - ${time.method} ${time.room}`,
      color: this.state.color,
      start: `${realday}T${this.convertTime(String(startTime), true)}`,
      end: `${realday}T${this.convertTime(String(endTime), false)}`,
    }
    this.setState({
      schedule: newSched.concat(times)
    })

    localStorage.setItem('winSched', newSched);

  }

  realday = (x) => {
    let today = moment();
    let todayDay = today.day();
    let sunday = today.subtract(todayDay, "days");
    let realday = sunday.add(DAYS[x.day], "days")
    return realday.format("YYYY-MM-DD");
  }

  handleDelete = (e) => {
    var newSched = _.cloneDeep(this.state.schedule);
    newSched = _.filter(newSched, function (el) {
      return !el.id.includes(e.course);
    });

    this.setState({
      schedule: newSched
    });
    localStorage.setItem('winSched', newSched);

  }

  renderTile = (type, x, className) => {
    return (
      <div class={type + " class-tile " + className} onClick={() => this.addTime(x)}>
        <div className="time-title">
          <h3>{x.day} <br />{x.time}</h3>
          {x.course.includes("INF1602") & x.sessionType === "LEC" ? <h3>{x.day_2} <br />{x.time_2}</h3> : null}
          <h4>{x.sessionType} {x.section} <br /> {x.method}</h4>
        </div>
      </div>
    )
  }

  renderCourseOptions = () => {
    if (this.state.activeCourse.course !== '') {
      let items = COURSES.filter(x => x.course === this.state.activeCourse.course);

      let lec = items.filter(x => x.sessionType === "LEC");
      let pra = items.filter(x => x.sessionType === "PRA");
      let tut = items.filter(x => x.sessionType === "TUT");

      let praGroup;
      let tutGroup;
      let lecGroup;

      let buttons;
      let self = this
      let findClass = _.find(this.state.schedule, function (o) {
        return (o.id.split(':')[0] === self.state.activeCourse.course)
      });


      if (findClass) {
        buttons = (
          <button onClick={(e) => this.handleDelete(self.state.activeCourse)}><FeatherIcon icon="trash" color="#c7364c" size="16px" /> <span style={{ marginLeft: '5px' }}>Remove Class</span></button>
        )
      }

      lecGroup = (
        <div className="lec-group group-set">
          <h3 className="title lec-title">Add a Lecture</h3>
          {lec.map(x => {

            let className = ''
            let find = _.find(this.state.schedule, function (o) {

              console.log(o.id, x.course + ':' + x.sessionType);
              console.log(o.title, `${x.course}: ${x.sessionType} ${x.section} - ${x.method}`);
              return (o.id === x.course + ':' + x.sessionType && o.title === `${x.course}: ${x.sessionType} ${x.section} - ${x.method} ${x.room}`)
            });

            console.log(find);
            if (find) {
              className = 'selected-item'
            }
            return (
              this.renderTile("lecGroup", x, className)
            )
          })}
        </div>
      )

      if (pra.length > 0) {
        let self = this

        praGroup = (

          <div className="pra-group  group-set">
            <h3 className="title">Add a practical</h3>
            {pra.map(x => {

              let className = ''

              let find = _.find(this.state.schedule, function (o) {
                let classTime = x.time.split('-');
                let startTime = classTime[0]
                let endTime = classTime[1]

                let start = `${self.realday(x)}T${self.convertTime(String(startTime, true), true)}`;
                let end = `${self.realday(x)}T${self.convertTime(String(endTime))}`

                return (o.id === x.course + ':' + x.sessionType && o.title === `${x.course}: ${x.sessionType} ${x.section} - ${x.method} ${x.room}` && o.start === start && o.end === end)

              });

              if (find) {
                className = 'selected-item'
              }

              return (
                this.renderTile("praGroup", x, className)

              )
            })} </div>)

      }

      if (tut.length > 0) {
        let self = this

        tutGroup = (

          <div className="tut-group group-set">
            <h3 className="title">Add a tutorial</h3>
            {tut.map(x => {

              let className = ''

              let find = _.find(this.state.schedule, function (o) {
                let classTime = x.time.split('-');
                let startTime = classTime[0]
                let endTime = classTime[1]

                let start = `${self.realday(x)}T${self.convertTime(String(startTime, true), true)}`;
                let end = `${self.realday(x)}T${self.convertTime(String(endTime))}`

                return (o.id === x.course + ':' + x.sessionType && o.title === `${x.course}: ${x.sessionType} ${x.section} - ${x.method} ${x.room}` && o.start === start && o.end === end)

              });

              if (find) {
                className = 'selected-item'
              }
              return (
                this.renderTile("tutGroup", x, className)
              )
            })} </div>)

      }

      let selfie = this;
      let findTitle = _.find(COURSES, function (o) {
        return (o.course === selfie.state.activeCourse.course && o.sessionType === "LEC")
      })


      return (
        <div>
          <div className="header-info">
          </div>
          <div>
            <div className='class-info'>
              <span><h1>{this.state.activeCourse.course}</h1> {buttons}</span>
              <p>{findTitle.notes}</p>
            </div>
            <hr></hr>
            {lecGroup}
            {tutGroup}
            {praGroup}
          </div>
        </div>
      )
    } else {
      return (
        <div className="welcome">
          <img src="/reading.svg" alt="" />
          <h2 style={{ marginTop: 12 }}>Build a</h2>
          <h2 style={{ fontWeight: 400, marginBottom: 12 }}>Winter Schedule</h2>
          <p> Use this tool to build your UofT Masters of Information course schedule for Winter 2023. You can build a Fall schedule above. <br /> <br /> Search for a course above with the course code or title. Then select lectures, practicums and tutorials.
            Once you add a class you can come back and delete it or edit it by searching for the class or clicking on the event in the calendar
          </p>
        </div>
      )
    }
  }


  handleEvent = (e) => {
    let classId = e.event.id;
    let code = classId.split(':')[0];
    this.setState({
      activeCourse: { course: code, sem: "S" },
      color: e.event.backgroundColor
    })

  }
  handleOnFocus = () => {
  }

  formatResult = (item) => {
    return (
      <div id={item.id} key={item.key}>{item.name}</div>
    );
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div>
            <div className="nav-bar">
              <img src="./logo.svg" height="25px" alt="logo" />
              <Button href="/"> Term: Winter</Button>

            </div>
            <div className="search">
              <div style={{ width: '100%' }}>
                <ReactSearchAutocomplete
                  items={items}
                  placeholder="Search for a winter 2023 class"
                  onSearch={this.handleOnSearch}
                  onHover={this.handleOnHover}
                  onSelect={this.handleOnSelect}
                  onFocus={this.handleOnFocus}
                  autoFocus
                  formatResult={this.formatResult}
                />
              </div>
            </div>
          </div>
          <div className="App-content">
            {this.renderCourseOptions()}
          </div>
          <div className="footer">
            {/* <div>Help</div> */}
            <div className="footer-content">
              <p>Last Edit: Aug 6</p>
              <p>Built by <a href="https://taamannae.dev/" target="_blank" rel="noreferrer">Tammy</a></p>
            </div>
          </div>
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
