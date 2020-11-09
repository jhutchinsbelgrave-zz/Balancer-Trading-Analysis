import React, { Component } from 'react';
import StartDate from './startdate.component';
import EndDate from './enddate.component';
import Axios from "axios"; 
const Chart = require('chart.js');

export default class DateBar extends Component {
    constructor() {
      super();
      this.getTransactions = this.getTransactions.bind(this);
      this.submitTime = this.submitTime.bind(this);
      this.getOrganizedTransactions = this.getOrganizedTransactions.bind(this);
      this.makeChart = this.makeChart.bind(this);
      this.state = {
        series: [],
        options: {}
      }
    }

    async submitTime () {
        var times = document.getElementsByName('datetime');
        if (times.length !== 2) {
            alert("One of your inputs is invalid. Please try again :)");
        } else {
            const start = new Date(times[0].value);
            const end = new Date(times[1].value);
            console.log(start);
            console.log(end)
            const transactions = await this.getTransactions(start, end);
            console.log("The transactions");
            console.log(transactions);
            const [usageStats, priceStats] = await this.getOrganizedTransactions(transactions);
            console.log(usageStats[0]);
            console.log(priceStats[0]);
            console.log('we hit');
            console.log(transactions);
            var unit = 'hour';
            await this.makeChart(usageStats[0], 'gasUsageChart', 'Gas Usage', 'line', unit);
            await this.makeChart(priceStats[0], 'gasPriceChart', 'Gas Price', 'line', unit);
        }
    }

    async getTransactions(start, end) {
        return(
            Axios({
                method: "GET",
                url: "http://localhost:9000/getTransactions",
                headers: {
                "Content-Type": "application/json"
                },
                params: {
                    'start' : start,
                    'end' : end
                }
            }).then(res => {
                return res.data.transactions;
            })
        );
    }

    async getOrganizedTransactions(trx) {
        const trxLength = trx.length;
        var maxTx = null;
        var max = Number.MIN_VALUE;
        var minTx = null;
        var min = Number.MAX_VALUE;
        var avg = 0;

        var maxTxP = null;
        var maxP = Number.MIN_VALUE;
        var minTxP = null;
        var minP = Number.MAX_VALUE;
        var avgP = 0;

        var gasUsage = [];
        var gasPrices = [];

        for (var idx = 0; idx < trxLength; idx++) {
            const tx = trx[idx];
            const time = Number(tx.timeStamp);
            const gas = Number(tx.gasUsed);
            const gasPr = Number(tx.gasPrice);
            
            const theTime = time * 1000;
            
            gasUsage.push({
                x: theTime,
                y: gas
            });
            gasPrices.push({
                x: theTime,
                y: gasPr
            });


            if (gas > max) {
                maxTx = tx;
                max = gas;
            }

            if (gas < min) {
                minTx = tx;
                min = gas;
            }

            avg += gas;
            
            //Gas pricing collection

            if (gasPr > maxP) {
                maxTxP = tx;
                maxP = gasPr;
            }
      
            if (gasPr < minP) {
                minTxP = tx;
                minP = gasPr;
            }
      
            avgP += gasPr;
        }

        avg = avg / trxLength;
        avgP = avgP / trxLength;

        var usageStats = [gasUsage, max, min, avg];
        var priceStats = [gasPrices, maxP, minP, avgP];
        return [usageStats, priceStats];
    }

    async makeChart(data, id, label, graphType, unit) {
        
        var ctx = document.getElementById(id);
        new Chart(ctx, {
            type: graphType,
            data: {
                datasets: [{
                    label: label,
                    data: data
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: unit
                        },
                        distribution: 'linear'
                    }]
                }
            }
        });
    }

    render() {
    return (
        <div>
            <div className = "bar">
                <StartDate/>
                <EndDate/>
                <button onClick={this.submitTime}>
                    Submit
                </button>
            </div>
            <canvas id="gasUsageChart" width="400" height="100"></canvas>
            <canvas id="gasPriceChart" width="400" height="100"></canvas>
        </div>
    );
    }
}

//<EndDate/>