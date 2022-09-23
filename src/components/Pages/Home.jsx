import React, { Component } from 'react'
import Speedometer from "react-d3-speedometer";
import Chart from 'react-apexcharts'
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import $ from 'jquery';
import { linkClicked } from "../sidebar/Leftsidebar";
import { Link } from 'react-router-dom';
import { SessionOut, chartOption } from "./Common";
import "./styles.css";
import "./mediastyle.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      message: '',
      temp: 0,
      humid: 0,
      energy: 0,
      ghost: 0,
      capacity: [0, 0],
      series: [0, 0],
      series1: [],
    }
  }

  chart_Option = async () => {
    let value = await chartOption(["#ff1a1a"], "yyyy-MM-dd");
    this.options = value;
  }

  componentDidMount() {
    linkClicked(0);
    this.chart_Option();
    this.getStatusData();
    this.getAlertHistory();
    this.interval = setInterval(() => {
      this.getStatusData();
      this.getAlertHistory();
    }, 15 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getStatusData = () => {
    this.setState({ temp: 0, humid: 0, energy: 0, ghost: 0 });
    this.setState({ capacity: [0, 0] })
    this.occ = 0
    axios({ method: 'GET', url: '/api/systemstatus' })
      .then((response) => {
        console.log("Status Response===>", response);
        let data = response.data;
        this.occupency = data.asset_count
        this.setState({
          temp: data.temp, humid: data.humidity,
          ghost: data.ghost,
          energy: parseFloat(data.energy.toFixed(2))
        });
        this.setState({ capacity: [this.occupency, data.rack_capacity - this.occupency] })
        this.totocc = this.occupency !== 0 ? (this.occupency / data.rack_capacity) * 100 : 0;
        this.occ = this.totocc.toFixed(2)
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        }
      })
  }

  getAlertHistory = () => {
    this.setState({ series1: [] })
    axios({ method: 'GET', url: '/api/alert/history' })
      .then((response) => {
        console.log("Alert Response===>", response);
        let data = response.data;
        let value = [];
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            let count = data[i].count === "" ? 0 : data[i].count;
            let time = data[i].date;
            var date = new Date(time);
            var milliseconds = date.getTime();
            value.push([milliseconds, count]);
          }
          this.setState({ series1: [{ name: "Alerts", data: value }] });
        } else {
          $("#historyMsg").text("No Alert Data Found!");
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        }
      })
  }
  render() {
    const { series1, temp, humid, energy, capacity, ghost } = this.state;
    return (
      <div className='parent-container'>
        <div className='card-container'>

          <Link className='cards'
            to="/cardtempdet" style={{
              textDecoration: "none",
              cursor: 'pointer'
            }}>
            <Speedometer
              width={202}
              height={138}
              labelFontSize="12"
              valueTextFontSize="15"
              needleHeightRatio={0.6}
              ringWidth={25}
              segments={450}
              value={temp}
              minValue={0}
              maxValue={100}
              startColor="green"
              endColor="red"
              maxSegmentLabels={5}
              needleColor="#cc0066"
            />
            <span className='card_text'>Max Temperature</span><br />
            <span style={{
              paddingTop: '8px', color: '#F15009',
              fontWeight: 600, fontSize: '21px'
            }}>{temp + '°C'}</span>
          </Link>


          <Link className='cards' to="/cardhumidet"
            style={{ textDecoration: "none", cursor: 'pointer' }}>
            <Speedometer
              width={202}
              height={138}
              labelFontSize="12"
              valueTextFontSize="15"
              needleHeightRatio={0.6}
              ringWidth={25}
              segments={450}
              value={humid}
              minValue={0}
              maxValue={200}
              startColor="#d9d9ff"
              endColor="#0000ff"
              maxSegmentLabels={5}
              needleColor="#0000ff"
            />
            <span className='card_text'>Max Humidity</span><br />
            <span style={{
              paddingTop: '8px', color: '#0000ff',
              fontWeight: 600, fontSize: '21px'
            }}>{humid + 'RH'}</span>
          </Link>

          <Link className='cards' to="/cardenergydet"
            style={{ textDecoration: "none", cursor: 'pointer' }}>
            <Speedometer
              width={202}
              height={138}
              labelFontSize="12"
              valueTextFontSize="15"
              needleHeightRatio={0.6}
              ringWidth={25}
              segments={450}
              value={energy}
              minValue={0}
              maxValue={500}
              startColor="#FCD9B2"
              endColor="#ff6600"
              maxSegmentLabels={5}
              needleColor="#ff6600"
            />
            <span className='card_text'>Energy Usage</span><br />
            <span style={{
              paddingTop: '8px', color: '#ff6600',
              fontWeight: 600, fontSize: '21px'
            }}>{energy + 'kWh'} </span>
          </Link>

          <div className='cards'>
            <div id="home-piechart">
              <Chart series={(capacity[0] !== 0 && capacity[1] !== 0) ? capacity : [0, 1]}
                options={{
                  legend: {
                    show: false,
                    position: 'bottom',
                    offsetX: 20
                  },

                  colors: [
                    '#a64dff', '#d9b3ff'
                  ],
                  dataLabels: {
                    enabled: false
                  },
                  labels: (capacity[0] !== 0 && capacity[1] !== 0) ? ['Occupied', 'Available'] : ["", ""],
                  tooltip: (capacity[0] !== 0 && capacity[1] !== 0) ? {
                    y: {
                      formatter: function (val) {
                        return val
                      },
                    }
                  } : (
                    {
                      y: {
                        formatter: function (val) {
                          return ""
                        },
                      }
                    }
                  ),
                  plotOptions: {
                    pie: {
                      donut: {
                        labels: {
                          show: false,
                          name: {
                            show: false,
                            offsetY: -6,
                          },
                          total: {
                            show: false,
                          },
                        }
                      }
                    }
                  },
                }}
                type="donut"
                width="200"
              />
            </div>
            <span className='card_text'>Server Occupancy</span><br />
            <span style={{ paddingTop: '8px', color: '#a64dff', fontWeight: 600, fontSize: '21px' }}>
              {this.occ + '%'}</span>
          </div>

          <Link className='cards' to="/ghosttools"
            style={{ textDecoration: "none", cursor: 'pointer' }}>
            <img src="/images/ghostserver.png" alt=""
              style={{ width: '105px', marginBottom: '13px', marginLeft: '25px' }} />
            <br />
            <span className='card_text'>Ghost Servers</span><br />
            <span style={{ paddingTop: '8px', color: '#FF7676', fontWeight: 600, fontSize: '21px' }}>{ghost}</span>
          </Link>
        </div>


        <div className="sensor-container">
          <div className='sensor-content'>
            <p style={{
              fontSize: '21px', marginTop: '10px', fontWeight: 600,
              color: '#5C5B5B', marginBottom: '14px',
              fontFamily: 'poppins-Regular'
            }}>Total Sensors Installed</p>

            <div className='sensors_div'>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)'
              }}>
                <img src="/images/asset.svg" alt="" style={{ width: '95px' }}
                  id="assetimg" />
                <span className='sensor_tagtext'>
                  Asset Tag</span>
                <span className='sensor_tagcount'>{this.occupency}</span>
              </div>
            </div>

            <div className='sensors_div'>
              <div style={{
                display: 'flex', justifyContent: 'space-between'
              }}>
                <img src="/images/energy.svg" alt="" style={{ width: '95px' }}
                  id="energyimg" />
                <span className='sensor_tagtext'>
                  Energy Tag</span>
                <span className='sensor_tagcount'>{this.occupency}</span>
              </div>
            </div>

            <div className='sensors_div'>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
              }}>
                <div style={{ width: '95px', overflow: 'hidden', }}>
                  <img src="/images/thsensor.svg" alt="" style={{ height: '90px' }}
                    id='thimg' />
                </div>
                <span className='sensor_tagtext' style={{ marginTop: "23px" }}>
                  T-H Sensors</span>
                <span className='sensor_tagcount' style={{ marginTop: "13px" }}>{this.occupency}</span>
              </div>
            </div>
          </div>

          <div className='alertHistoryChart'>
            <p style={{
              fontSize: '21px', marginTop: '10px',
              fontWeight: "600", color: '#5C5B5B',
              marginBottom: '14px',
              fontFamily: 'poppins-Regular'
            }}>Alerts History</p>
            <div style={{
              color: "red",
              fontSize: "20px",
              fontWeight: "600",
              marginLeft: '28px',
              textAlign: 'left'
            }}
              id="historyMsg" />
            <div>
              {this.options !== undefined && (
                <ApexCharts options={this.options}
                  series={series1}
                  type="area"
                  // width={680}
                  height={280}
                />
              )}
            </div>
          </div>
        </div>
        {/* SessionOut Component used here!  */}
        <SessionOut />
      </div>
    )
  }
}
