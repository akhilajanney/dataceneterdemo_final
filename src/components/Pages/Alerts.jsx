import React, { Component } from "react";
import {
  alert_asset, alert_humi,
  alert_temp, alert_freefall,
  alert_energy,
} from "../urls/api";
import axios from "axios";
import $ from "jquery";
import "./mediastyle.css";
import { linkClicked } from "../sidebar/Leftsidebar";
import { getPagination, TableDetails, SessionOut, DataLoading } from "./Common";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default class Alerts extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      error: false,
      loading: false,
    };
  }
  componentDidMount() {
    linkClicked(4);
    this.getTableDetails("first");
    this.interval = setInterval(() => this.getTableDetails("repeat"), 15 * 1000)
  }
  getTableDetails = (callStatus) => {
    this.setState({ message: "", error: false });
    if (callStatus === "first") {
      this.setState({ loading: true });
    } else {
      this.setState({ loading: false });
    }
    if ($("#alerttype").val() === 'Asset') {
      axios({ method: "GET", url: alert_asset })
        .then((response) => {
          const data = response.data;
          console.log("Asset Response====>", response);
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
          } else {
            this.setState({ message: "No Asset Alert Data Found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log("ERROR====>", error);
          this.setState({ loading: false });
          if (error.response.status === 404) {
            this.setState({ message: "No Asset Alert Data Found!", error: true });
          } else if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }else if(error.response.status === 400){
            this.setState({error:true,message:'Bad Request'})
          }
        })
    }
    else if ($("#alerttype").val() === 'Temperature') {
      axios({ method: "GET", url: alert_temp })
        .then((response) => {
          const data = response.data;
          console.log('Temperature=====>', response);
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th>TEMPERATURE(°C)</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + data[i].temperature.toFixed(2) + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
              this.setState({ loading: true });
            }
            this.setState({ loading: false });
          } else {
            this.setState({ message: "No Temperature Alert Data Found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log('Health Slave gate Error====', error);
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          this.setState({ loading: false });
          if (error.response.status === 403) {
            this.setState({ loading: false });
            $("#displayModal").css("display", "block");
          }else if (error.response.status === 400) {
            this.setState({ error:true,message:'Bad Request' });
           
          }
        })
    } else if ($("#alerttype").val() === 'Humidity') {
      axios({ method: "GET", url: alert_humi })
        .then((response) => {
          console.log('Humidity=====>', response);
          const data = response.data;
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            this.setState({ message: "", error: false });
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th>HUMIDITY(RH)</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr><td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + data[i].humidity.toFixed(2) + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
          } else {
            this.setState({ message: "No Humidity Alert Data Found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log('Error====', error);
          this.setState({ loading: false });
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }else if(error.response.status === 400){
            this.setState({error:true,message:'Bad Request'})
          }
        })
    }
    else if ($("#alerttype").val() === 'Energy') {
      axios({ method: "GET", url: alert_energy })
        .then((response) => {
          console.log('Energy=====>', response);
          const data = response.data;
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            this.setState({ message: "", error: false });
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th style='text-transform:none;'>ENERGY(kWh)</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr><td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + (data[i].energy / 1000).toFixed(2) + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
          } else {
            this.setState({ message: "No Energy Alert Data Found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log('Error====', error);
          this.setState({ loading: false });
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }else if(error.response.status === 400){
            this.setState({error:true,message:'Bad Request'})
          }
        })
    }
    else if ($("#alerttype").val() === 'Free Fall') {
      axios({ method: "GET", url: alert_freefall })
        .then((response) => {
          console.log('FreeFall=====>', response);
          const data = response.data;
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            this.setState({ message: "", error: false });
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
          } else {
            this.setState({ message: "No Freefall Alert Data Found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          console.log('Error====', error);
          this.setState({ loading: false });
          
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }else if(error.response.status === 400){
            this.setState({error:true,message:'Bad Request'})
          }
        })
    } else if ($("#alerttype").val() === 'Images') {
      axios({ method: "GET", url: "/api/alert/asset" })
        .then((response) => {
          const data = response.data;
          console.log('image====>', response)
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            this.setState({ message: "", error: false });
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>PARENT RACK</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET CURRENT POSITION</th>" +
              "<th>ASSET LAST POSITION</th>" +
              "<th>LAST SEEN</th>" +
              "<th>IMAGE</th>" +
              "</tr>"
            );
            let count = 0;
            for (let i = 0; i < data.length; i++) {
              let time = data[i].lastseen.replace("T", " ").substr(0, 19);
              let currPos = data[i].placedIN === null ? "Outside" : data[i].placedIN.name;
              let lastPos = data[i].removedFrom === null ? "Outside" : data[i].removedFrom.name;
              if (currPos !== lastPos) {
                $("#table_alert tbody").append(
                  "<tr>" +
                  "<td>" + (count + 1) + "</td>" +
                  "<td>" + data[i].macid.rackno.name + "</td>" +
                  "<td>" + data[i].macid.name + "</td>" +
                  "<td>" + currPos + "</td>" +
                  "<td>" + lastPos + "</td>" +
                  "<td>" + time + "</td>" +
                  "<td><div class='imgdiv'><i id='imgClick" + i + "' class='fas fa-camera-alt'></i></div></td> " +
                  "</tr>"
                )
                // $('#divheight').css('overflow',)
                $("#imgClick" + i).on("click", () => {
                  this.showImage(time)
                })
                count += 1;
              }
            }
            if (count > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
            if (count === 0) {
              this.setState({ message: "No Image Alert Data Found!", error: true, loading: false });
            }
          } else {
            this.setState({ message: "No Image Alert Data Found!", error: true, loading: false });
          }
        })
        .catch((error) => {
          this.setState({ loading: false });
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          console.log('image Error====', error);
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }else if(error.response.status === 400){
            this.setState({error:true,message:'Bad Request'})
          }else if(error.response.status === 404){
            this.setState({error:true,message:'Images Not Found'})
          }
        })
    }
  };

  showImage = (time) => {
    this.setState({ message: "", error: false });
    $(".img-container").css("display", "none");
    window.scrollTo(0, 100)
    axios({ method: "GET", url: "/api/image?time=" + time })
      .then((response) => {
        $(".img_wrap").remove();
        const data = response.data;
        console.log("Image URLS=====>", response);
        var images = $(".img_wrap");
        var animationDuration = 500;
        $.each(images, function (index, item) {
          $(this).delay(animationDuration * index).fadeIn(animationDuration);
        })

        if (data.length !== 0 && response.status === 200) {
          this.setState({ message: "", error: false });
          $(".img-container").delay(150).fadeIn();
          $("#img_block").css({ "margin-top": "5px" });
          let length = data.length > 3 ? 3 : data.length;
          for (let i = 0; i < length; i++) {
            let div = document.createElement("div");
            $(div).attr("class", "img_wrap")
            let myImg = $('<img />', {
              id: 'img' + i,
              src: data[i].image,
              alt: 'img' + i,
              class: "img",
            });
            $(div).append(myImg);
            $("#img_block").append(div);
            if (data.length === 1) {
              $(".img-container").css({ "width": "45%", "height": "60vh", "left": "29%" })
              $("#img_block").css({ "margin-top": "0px" });
              $(".img_wrap").css({ "width": "83%", "margin-left": "60px" });
              $(".img0").css({ "width": "85%", "height": "58vh" });
            }
          }
          // $("html").animate({ scrollTop: 0 }, "slow");

        }
        else {
          $("html").animate({ scrollTop: 0 }, "slow");
          this.setState({ message: "No Image Alert Data Found!", error: true });
        }
      })
      .catch((error) => {
        $(".pagination").hide();
        $("#rangeDropdown").hide();
        console.log('image Error====', error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === "404") {
          // $("html").animate({ scrollTop: 0 }, "slow");
          $("#img-container").hide();
          this.setState({ message: "No Image Alert Data Found!", error: true });
        }else if(error.response.status === 400){
          this.setState({error:true,message:'Bad Request'})
        }
      })
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  };

  render() {
    const { error, message, loading } = this.state;
    return (
      <div id='divheight'
        style={{
          float: "right", width: "95%", background: '#E5EEF0',
          marginLeft: '60px', position: "relative",
          overflow: loading === true ? "hidden" : "visible",
          height: loading === true ? "100vh" : "auto",
        }}>
        <div style={{ marginTop: "30px", marginLeft: "60px" }}>
          <span className="main_header">ALERTS</span>
          <div className="underline"></div>

          <div style={{ marginTop: "30px" }}>
            <span className="label">Alert:</span>
            <select style={{ marginBottom: '30px' }}
              name="alerttype"
              id="alerttype"
              required="required"
              onChange={() => this.getTableDetails("first")}>
              <option>Images</option>
              <option>Temperature</option>
              <option>Humidity</option>
              <option>Energy</option>
              <option>Asset</option>
              <option>Free Fall</option>

            </select>
            {error && (
              <div
                style={{ color: "red" }}>
                <strong>{message}</strong>
              </div>
            )}
          </div>

          {/*<TableDetails /> */}

          <div id="common_table" style={{ paddingBottom: "100px" }}>
            <div className="table_det">
              <div
                id="rangeDropdown"
                style={{
                  float: "right",
                  position: "relative",
                  right: "6%",
                  marginBottom: "20px",
                  marginTop: "-3%",
                }}>
                <select name="state" style={{ width: "120px" }} id="maxRows">
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="75">75</option>
                  <option value="100">100</option>
                </select>
              </div>
              <table style={{ width: "95%", position: "relative" }} id="table_alert">
                <thead></thead>
                <tbody></tbody>
              </table>
            </div>
            <div className="pagination">
              <button
                id="prev1"
                className="moving"
                data-page="prev"
                style={{ marginRight: "30px" }}>
                Prev
              </button>
              <button className="moving" data-page="next" id="prev">
                Next
              </button>
            </div>
          </div>
        </div>


        <div className="img-container">
          <div className="hideimg">
            <span><i className="far fa-times-circle"
              onClick={() => {
                $(".img-container").delay(500).fadeOut();
              }}>
            </i></span>
          </div>

          <div style={{ display: 'flex' }} id="img_block">
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

