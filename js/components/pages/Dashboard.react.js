/*
 * HomePage
 *
 * The Dashboard is only visible to logged in users
 * Route: /dashboard
 *
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Chart } from 'react-d3-core';
import { BarChart } from 'react-d3-basic';

class Dashboard extends Component {
  render() {
    const { stat } = this.props.data;
      const { status } = this.props.data;
      const noStat = true;
      if (typeof stat != 'undefined'){
          this.noStat = false;
          for (var i = 0; i < stat.length; i++){
              if (stat[i].class == 0){
                  stat[i]._style = {color:'#FF0000'};
              }else{
                  stat[i]._style = {color:'#008000'}
              }
          }
      }else{
          this.noStat = true;
      }

    // load your general data
    var chartData = stat;

    var width = 700,
        height = 300,
        margins = {left: 100, right: 100, top: 50, bottom: 50},
        title = "Login Stats",
        // chart series,
        // field: is what field your data want to be selected
        // name: the name of the field that display in legend
        // color: what color is the line
        chartSeries = [
          {
            field: 'prob',
            name: 'Confidence'
          }
        ],
        // your x accessor
        x = function(d) {
          return d.index;
        },
        xScale = 'ordinal',
          xLabel = "Login Attempts",
          yLabel = "Confidence",
          yTicks = [10, "%"];

      const chartDOM = this.noStat ? (
          <article>
              <section className="text-section">
                  <h1>Keystroke pattern registered!</h1>
              </section>
              <p></p>
              <p>Login again to test your keystroke authentication. You will also see nice bar chart of auth confidence for every subsequent attempt.</p>
          </article>
      ) : (
          <article>
              <section className="text-section">
                  <h1>Keystroke pattern {status}!</h1>
              </section>
              <BarChart
                  showXGrid= {false}
                  showYGrid= {false}
                  margins= {margins}
                  title={title}
                  data={chartData}
                  width={width}
                  height={height}
                  chartSeries={chartSeries}
                  x={x}
                  xLabel= {xLabel}
                  xScale= {xScale}
                  yTicks= {yTicks}
                  yLabel = {yLabel}
              />
              <p></p>
              <p>Bar chart represents the percent confidence with which the keystroke pattern was authenticated. Red colored bars are the failed patterns. You can review the history of login attempts along X axis.</p>
          </article>
      );

    return (
        <div>
            {chartDOM}
        </div>
    );
  }
}

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(Dashboard);