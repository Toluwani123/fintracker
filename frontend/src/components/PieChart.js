import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Pie, Doughnut } from 'react-chartjs-2';
import {Chart as Chartjs} from 'chart.js/auto'

const PieChart = ({chartdata}) => {
    

    
  return (
    <div style={{ width: '500px', height: '500px' }}>
        <Doughnut data={chartdata} options={{
            layout: {
                padding: 20
            },
            plugins: {
                
                title: {
                    display: true,
                    text: 'How much you spend on each category'
                },
                legend: {
                    display: true,
                    labels:{
                        font: {
                            size: 14
                        }
                    }
                }
            

            },
            

        }}/>
    </div>
    
  )
}

export default PieChart