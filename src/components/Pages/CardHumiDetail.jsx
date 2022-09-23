import React, { Component } from 'react';
import $ from "jquery";
import axios from 'axios';
import ApexCharts from 'react-apexcharts';
import TableScrollbar from 'react-table-scrollbar';
import './styles.css';
import { chartOption, DataLoading, SessionOut } from "./Common";
import { assettemp } from '../urls/api';
import { linkClicked } from '../sidebar/Leftsidebar';

export default class CardHumiDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      message: "",
      rackid: '',
      assetid: '',
      series: [],
      chartCheck: 0,
      loading: true,
    };
  }

  chart_Option = async () => {
    let value = await chartOption(["#1a75ff"], "yyyy-MM-dd HH:mm:ss");
    this.options = value;
  }

  componentDidMount() {
    linkClicked(0);
    this.chart_Option();
    this.humidDetails("first");
    this.interval = setInterval(() => this.humidDetails("repeat"), 20 * 1000);
  }
  humidDetails = (callStatus) => {
    this.setState({ error: false, message: "" });
    if (callStatus === "first") {
      this.setState({ loading: true });
    } else {
      this.setState({ loading: false });
    }
    if ($("#filter").val() === "Rack") {
      axios({ method: "GET", url: "/api/racktemp" })
        .then((response) => {
          const data = response.data;
          console.log("Humi Rack Response====>", response);
          $("#humi_table tbody").empty();
          $("#humi_table thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#temp_details").show();
            $("#humi_table thead").append(
              "<tr>" +
              "<th>S.No</th>" +
              "<th>Rack Name</th>" +
              "<th colspan='2'>Humidity(RH)</th>" +
              "<th>Chart</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              if (i === 0 && this.state.chartCheck === 0) {
                $("#chart_name").text("Rack Name : " + data[i].name);
                this.setState({ chartCheck: 1 });
                this.rackChartData(data[i].macid);
              }
              let humiddiffer = data[i].humiditydiff.toFixed(0);
              if (data[i].humiditydiff === null) {
                humiddiffer = 0;
              } else {
                humiddiffer = data[i].humiditydiff.toFixed(0);
              }
              let humid = data[i].humidity;
              if (data[i].humidity === null) {
                humid = 0;
              } else {
                humid = data[i].humidity;
              }
              let valNum = null, humidnum = null;
              if (humiddiffer > 0) {
                valNum = "<td style='color: #26df2c;'>+" + humiddiffer +
                  "  <span><i class='far fa-angle-up'></i></span></td>"
              } else if (humiddiffer < 0) {
                valNum = "<td style='color: #f00;'>" + humiddiffer +
                  "  <span><i class='far fa-angle-down'></i></span></td>";
              } else {
                valNum = "<td>--</td>";
              }

              humidnum =
                humiddiffer >= 0
                  ? "<td style='color: #26df2c;font-weight: 500'>" + humid + "</td>"
                  : "<td style='color: #f00;font-weight: 500;'>" + humid + "</td>";
              $("#humi_table tbody").append(
                "<tr><td>" +
                (i + 1) +
                "</td>" +
                "<td>" +
                data[i].name +
                "</td>" +
                valNum +
                humidnum +
                "<td id=" +
                data[i].macid +
                " style='font-size: 18px;cursor:pointer;color:#00629B'><span>" +
                "<i class='fas fa-info-circle'></i></span></td></tr>"
              );
              $("#" + data[i].macid).on("click", () => {
                $("#chart_name").text("Rack Name : " + data[i].name);
                // this.getChartData("rack", data[i].macid)
                this.rackChartData(data[i].macid);
              });
            }
            this.setState({ loading: false });
          }
          else {
            $("#temp_details").hide();
            this.setState({ message: "No Rack data found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log("ERROR====>", error);
          this.setState({ loading: false });
          if (error.response.status === 404) {
            $("#temp_details").hide();
            this.setState({ error: true, message: 'No Rack data found!' })
          } else if (error.response.status === 403) {
            $("#displayModal").css("display", "block");

          }
        })
    } else if ($("#filter").val() === "Asset") {
      axios({ method: "GET", url: assettemp })
        .then((response) => {
          const data = response.data;
          console.log("Asset Response====>", data);
          $("#humi_table tbody").empty();
          $("#humi_table thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#temp_details").show();
            $("#humi_table thead").append(
              "<tr>" +
              "<th>S.No</th>" +
              "<th>Asset Name</th>" +
              "<th colspan='2'>Humidity(RH)</th>" +
              "<th>Chart</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              if (i === 0 && this.state.chartCheck === 0) {
                $("#chart_name").text("Asset Name : " + data[i].name);
                this.setState({ chartCheck: 1 });
                this.assetChartData(data[i].tagid);
              }
              let humiddiffer = data[i].humidityDiff;
              if (data[i].humidityDiff === null || data[i].humidityDiff === "") {
                humiddiffer = 0;
              } else {
                humiddiffer = data[i].humidityDiff.toFixed(2);;
              }
              let humid = data[i].humidity;
              if (data[i].humidity === null || data[i].humidity === "") {
                humid = 0;
              } else {
                humid = data[i].humidity.toFixed(2);
              }
              let valNum = null, humidnum = null;
              if (humiddiffer > 0) {
                valNum = "<td style='color: #26df2c;'>+" + humiddiffer +
                  "  <span><i class='far fa-angle-up'></i></span></td>"
              } else if (humiddiffer < 0) {
                valNum = "<td style='color: #f00;'>" + humiddiffer +
                  "  <span><i class='far fa-angle-down'></i></span></td>";
              } else {
                valNum = "<td>--</td>";
              }

              humidnum =
                humiddiffer >= 0
                  ? "<td style='color: #26df2c;font-weight: 500'>" + humid + "</td>"
                  : "<td style='color: #f00;font-weight: 500;'>" + humid + "</td>";
              $("#humi_table tbody").append(
                "<tr><td>" +
                (i + 1) +
                "</td>" +
                "<td>" +
                data[i].name +
                "</td>" +
                valNum +
                humidnum +
                "<td id=" +
                data[i].tagid +
                " style='font-size: 18px;cursor:pointer;color:#00629B'><span>" +
                "<i class='fas fa-info-circle'></i></span></td></tr>"
              );
              $("#" + data[i].tagid).on("click", () => {
                $("#chart_name").text("Asset Name : " + data[i].name);
                this.assetChartData(data[i].tagid);
              });
            }
            this.setState({ loading: false });
          } else {
            $("#temp_details").hide();
            this.setState({ message: "No Asset Data Found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log("ERROR====>", error);
          this.setState({ loading: false });
          if (error.response.status === 404) {
            $("#temp_details").hide();
            this.setState({ error: true, message: 'No Asset Data Found!' })
          } else if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }
        })
    }
  }

  rackChartData = (macid) => {
    this.setState({
      error: false, message: '',
      message1: '', series: [], macId: macid
    })
    var date1 = new Date();
    var milliseconds1 = date1.getTime();
    let value = [];
    axios({ method: 'GET', url: '/api/rack/average?id=' + macid + "&key=rackhumimax" })
      .then((response) => {
        console.log("RackChartData response=====>", response)
        let data = response.data
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            let time = data[i].time;
            var date = new Date(time);
            var ms = date.getTime();
            value.push([ms, data[i].humidity]);
          }
          this.setState({ series: [{ name: "Humidity(RH)", data: value }] });
        }
        else {
          this.setState({
            macId: macid, message1: "No Humidity Data Found",
            error: false, series: [{ name: "Humidity(RH)", data: [[milliseconds1]] }]
          });
        }
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 404) {
          this.setState({
            macId: macid, message1: "No Humidity Data Found",
            error: false, series: [{ name: "Humidity(RH)", data: [[milliseconds1]] }]
          });
        }
        else if (error.response.status === 400) {
          this.setState({
            error: false,
            message: "Request Failed.",
          });
        } else {
          this.setState({
            error: true,
            message: "Error Occurred. Please try again.",
          });
        }
      })
  };
  assetChartData = (tagid) => {
    this.setState({
      macId: tagid, message: "", message1: '',
      error: false, series: []
    });
    let value = [];
    var date1 = new Date();
    var milliseconds1 = date1.getTime();
    axios({ method: "GET", url: "/api/track?id=" + tagid+"&key=assethumimax"  })
      .then((response) => {
        console.log(response,'assetgraph')
        let data = response.data

        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            let humid = data[i].humidity;
            let chartDet = [];
            let time = data[i].time;
            var date = new Date(time);
            var milliseconds = date.getTime();
            chartDet.push(milliseconds);
            chartDet.push(humid);
            value.push(chartDet);
          }
          this.setState({ series: [{ name: "Humidity(RH)", data: value }] });
        }
        else {
          this.setState({
            macId: tagid, message1: "No Humidity Data Found", error: false,
            series: [{ name: "Humidity(RH)", data: [[milliseconds1]] }]
          });
        }
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 404) {
          this.setState({
            error: false,
            message1: "No Humidity Data Found.", 
            series: [{ name: "Humidity(RH)", data: [[milliseconds1]] }]
          });
        }
        else if (error.response.status === 400) {
          this.setState({
            error: false,
            message: "Request Failed.",
          });
        } else {
          this.setState({
            error: true,
            message: "Error Occurred. Please try again.",
          });
        }
      })
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  };

  render() {
    const { series, message1,error, message, loading } = this.state;
    return (
      <div style={{
        float: "right",
        width: "95%",
        position: "relative",
        background: "#E5EEF0",
        overflow: loading === true ? "hidden" : "none",
        height: loading === true ? "100vh" : "auto",
      }}>

        <div style={
          { marginTop: '25px', marginLeft: '60px', }}>
          <span className='main_header'>HUMIDITY</span>
          <div className='underline'></div>

          <div style={{ display: "flex", marginTop: "30px" }}>
            <div className="inputdiv"
              style={{ marginLeft: "10px" }}>
              <select
                name="filter"
                id="filter"
                style={{ width: "175px", border: "1px solid #99d1dd" }}
                onChange={() => {
                  this.setState({ chartCheck: 0 });
                  clearInterval(this.interval);
                  this.componentDidMount()
                }}>
                <option >Rack</option>
                <option>Asset</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ color: 'red', margin: '20px 20px' }}>
              <strong>{message}</strong>
            </div>
          )}

          <div style={{ display: "flex" }} id="temp_details">
            <div className="box" style={{ height: "70vh",}}>
              <TableScrollbar>
                <table style={{ width: "95%" }} id="humi_table">
                  <thead></thead>
                  <tbody></tbody>
                </table>
              </TableScrollbar>
            </div>

            <div id="graphContainer" 
              style={{
                marginLeft: "30px",
                width: "44%", marginTop: "10px"
              }}>
              <div>
                <div
                  id="chart"
                  style={{
                    borderRadius: "10px",
                    backgroundColor: "#FFF",
                    height: "70vh",
                  }}>
                  <div
                    id="chart_name"
                    style={{
                      padding: "15px",
                      fontSize: "17px",
                      color: "#00629b",
                      fontWeight: "600",
                    }}>
                  </div>
                  <div
                    style={{
                      paddingLeft: "15px",
                      fontSize: "17px",
                      color: "#00629b",
                    }}>
                    <span style={{ fontWeight: 500, color: 'red' }}>{message1}</span>
                  </div>
                  {series.length ? (
                    <div id="chart-timeline">
                      {this.options !== undefined && (
                        <ApexCharts options={this.options}
                          series={series}
                          type="area"
                          height={380} />
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* SessionOut Component used here!  */}
        <SessionOut />

        {loading === true && (
          <div
            style={{
              top: "0%",
              left: "0%",
            }} className="frame">
            <DataLoading />
          </div>
        )}
      </div>
    )
  }
}
