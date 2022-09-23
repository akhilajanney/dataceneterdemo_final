import React, { Component } from "react";
import $ from "jquery";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import TableScrollbar from 'react-table-scrollbar';
import './styles.css';
import { chartOption, DataLoading, SessionOut } from "./Common";
import { linkClicked } from "../sidebar/Leftsidebar";

export default class CardTempDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      message1: '',
      message: "",
      rackid: '',
      assetid: '',
      macId: "",
      series: [],
      chartCheck: 0,
      loading: true,
    };
  }

  chart_Option = async () => {
    let value = await chartOption(["#F44336"], "yyyy-MM-dd HH:mm:ss");
    this.options = value;
  }

  componentDidMount() {
    linkClicked(0);
    this.chart_Option();
    this.tempDetails("first");
    this.interval = setInterval(() => this.tempDetails("repeat"), 20 * 1000);
  }

  tempDetails = (callStatus) => {
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
          console.log("Max Rack Response====>", response);
          $("#temp_table tbody").empty();
          $("#temp_table thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#temp_details").show();
            $("#temp_table thead").append(
              "<tr>" +
              "<th>S.No</th>" +
              "<th>Rack Name</th>" +
              "<th colspan='2'>Temperature(°C)</th>" +
              "<th>Chart</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              if (i === 0 && this.state.chartCheck === 0) {
                $("#chart_name").text("Rack Name : " + data[i].name);
                this.setState({ chartCheck: 1 });
                this.rackChartData(data[i].macid);
              }
              let tempdiffer = data[i].tempdiff;
              if (data[i].tempdiff === null || data[i].tempdiff === "") {
                tempdiffer = 0;
              } else {
                tempdiffer = data[i].tempdiff.toFixed(0);
              }
              let temp = data[i].temp;
              if (data[i].temp === null || data[i].temp === "") {
                temp = 0;
              } else {
                temp = data[i].temp.toFixed(2);
              }
              let valNum = null, tempNum = null;
              if (tempdiffer > 0) {
                valNum = "<td style='color: #26df2c;'>+" + tempdiffer +
                  "  <span><i class='far fa-angle-up'></i></span></td>"
              } else if (tempdiffer < 0) {
                valNum = "<td style='color: #f00;'>" + tempdiffer +
                  "  <span><i class='far fa-angle-down'></i></span></td>";
              } else {
                valNum = "<td>--</td>";
              }
              tempNum =
                tempdiffer >= 0
                  ? "<td style='color: #26df2c;font-weight: 500'>" + temp + "</td>"
                  : "<td style='color: #f00;font-weight: 500;'>" + temp + "</td>";

              $("#temp_table tbody").append(
                "<tr><td>" +
                (i + 1) +
                "</td>" +
                "<td>" +
                data[i].name +
                "</td>" +
                valNum +
                tempNum +
                "<td id=" +
                data[i].macid +
                " style='font-size: 18px;cursor:pointer;color:#00629B'><span>" +
                "<i class='fas fa-info-circle'></i></span></td></tr>"
              );
              $("#" + data[i].macid).on("click", () => {
                $("#chart_name").text("Rack Name : " + data[i].name);
                this.rackChartData(data[i].macid);
              });
            }
            this.setState({ loading: false });
          } else {
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
      axios({ method: "GET", url: "/api/assetemp" })
        .then((response) => {
          const data = response.data;
          console.log("Asset Response====>", response);
          $("#temp_table tbody").empty();
          $("#temp_table thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#temp_details").show();
            $("#temp_table thead").append(
              "<tr>" +
              "<th>S.No</th>" +
              "<th>Asset Name</th>" +
              "<th colspan='2'>Temperature(°C)</th>" +
              "<th>Chart</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              if (i === 0 && this.state.chartCheck === 0) {
                $("#chart_name").text("Asset Name : " + data[i].name);
                this.setState({ chartCheck: 1 });
                this.assetChartData(data[i].tagid);
              }
              let tempdiffer = data[i].tempdiff;
              if (data[i].tempdiff === null || data[i].tempdiff === "") {
                tempdiffer = 0;
              } else {
                tempdiffer = data[i].tempdiff.toFixed(2);
              }
              let temp = data[i].temp;
              if (data[i].temp === null || data[i].temp === "") {
                temp = 0;
              } else {
                temp = data[i].temp;
              }

              let valNum = null, tempNum = null;
              if (tempdiffer > 0) {
                valNum = "<td style='color: #26df2c;'>+" + tempdiffer +
                  "  <span><i class='far fa-angle-up'></i></span></td>"
              } else if (tempdiffer < 0) {
                valNum = "<td style='color: #f00;'>" + tempdiffer +
                  "  <span><i class='far fa-angle-down'></i></span></td>";
              } else {
                valNum = "<td>--</td>";
              }

              tempNum =
                tempdiffer >= 0
                  ? "<td style='color: #26df2c;font-weight: 500'>" + temp + "</td>"
                  : "<td style='color: #f00;font-weight: 500;'>" + temp + "</td>";
              $("#temp_table tbody").append(
                "<tr><td>" +
                (i + 1) +
                "</td>" +
                "<td>" +
                data[i].name +
                "</td>" +
                valNum +
                tempNum +
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
            this.setState({ message: "No Asset data found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log("ERROR====>", error);
          this.setState({ loading: false });
          if (error.response.status === 404) {
            $("#temp_details").hide();
            this.setState({ error: true, message: 'No Asset data found!' })
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
    axios({ method: 'GET', url: '/api/rack/average?id=' + macid + "&key=racktempmax" })
      .then((response) => {
        console.log("RackChartData====>", response)
        let data = response.data
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            let time = data[i].time;
            var date = new Date(time);
            var ms = date.getTime();
            value.push([ms, data[i].temp]);
          }
          this.setState({ series: [{ name: "Temperature(°C)", data: value }] });
        } else {
          this.setState({
            macId: macid, message1: "No Temperature Data Found", error: false,
            series: [{ name: "Temperature(°C)", data: [[milliseconds1]] }]
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
            message1: "No Temperature Data Found",
          });
        }
        else if (error.response.status === 400) {
          this.setState({
            error: true,
            message: "Request Failed.",
          });
        } else {
          this.setState({
            error: true,
            message: "Error occurred. Please try again.",
          });
        }
      })
  };

  assetChartData = (tagid) => {
    this.setState({
      macId: tagid, message: "",
      message1: '', error: false, series: []
    });
    let value = [];
    var date1 = new Date();
    var milliseconds1 = date1.getTime();
    axios({ method: "GET", url: "/api/track?id=" + tagid+ "&key=assettempmax" })
      .then((response) => {
        console.log("AssetChartData response====>", response);
        let data = response.data
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            let temp = data[i].temp;
            let chartDet = [];
            let time = data[i].time;
            var date = new Date(time);
            var milliseconds = date.getTime();
            chartDet.push(milliseconds);
            chartDet.push(temp);
            value.push(chartDet);
          }
          this.setState({ series: [{ name: "Temperature(°C)", data: value }] });
        }
        else {
          this.setState({
            macId: tagid, message1: "No Temperature Data Found", error: false,
            series: [{ name: "Temperature(°C)", data: [[milliseconds1]] }]
          });
        }
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 404) {
          this.setState({
            macId: tagid, message1: "No Temperature Data Found", error: false,
            series: [{ name: "Temperature(°C)", data: [[milliseconds1]] }]
          });
        }
        else if (error.response.status === 400) {
          this.setState({
            error: true,
            message: "Request Failed.",
          });
        } else {
          this.setState({
            error: true,
            message: "Error occurred. Please try again.",
          });
        }
      })
  };


  componentWillUnmount() {
    clearInterval(this.interval);
  };

  render() {
    const { series, error, message1, message, loading } = this.state;
    return (
      <div
        style={{
          float: "right",
          width: "95%",
          position: "relative",
          background: "#E5EEF0",
          overflow: loading === true ? "hidden" : "none",
          height: loading === true ? "100vh" : "auto",
        }}>
        <div style={{ marginTop: "25px", marginLeft: "60px" }}>
          <span className="main_header">TEMPERATURE</span>
          <div className="underline"></div>

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
                  this.componentDidMount();
                }}>
                <option>Rack</option>
                <option>Asset</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ color: 'red', margin: '20px 20px' }}>
              <strong>{message}</strong>
            </div>
          )}

          <div style={{ display: "flex" }} id='temp_details'>
            <div className="box" style={{ height: "70vh"}}>
              <TableScrollbar>
                <table style={{ width: "95%" }} id="temp_table">
                  <thead></thead>
                  <tbody></tbody>
                </table>
              </TableScrollbar>
            </div>
            <div id="graphContainer" style={{
              marginLeft: "30px",
              width: "44%", marginTop: "10px"
            }}>
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
                        height={370} />
                    )}
                  </div>
                ) : null}
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
    );
  }
}
