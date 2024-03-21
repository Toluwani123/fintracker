import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import PieChart from '../components/PieChart';
import '../App.css';
import { IconContext } from 'react-icons/lib';
import { Button, Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { GiPayMoney, GiReceiveMoney  } from "react-icons/gi";
import LineChart from "../components/LineChart"
import { GrCurrency } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import { MdProductionQuantityLimits } from "react-icons/md";
import { TbSum } from "react-icons/tb";
import { CiSettings } from "react-icons/ci";
import { FaHandsHelping } from "react-icons/fa";
import { usePlaidLink } from 'react-plaid-link';


const Homepage = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [totalExpenses, setTotalExpenses] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [monthly_expenses, setMonthly_Expenses] = useState({});
  const [finalTotal, setFinalTotal] = useState(null);
  const [topTwo, setTopTwo] = useState(null);
  const [recentExpenses, setRecentExpenses]= useState({});
  const [recentIncomes, setRecentIncomes]= useState({});
  const [recentGoals, setRecentGoals]= useState({});
  const [recentBudgets, setRecentBudgets]= useState({});
  const [linkToken, setLinkToken]= useState({});







  

  const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
  };
  const percentageOfTransactions = totalExpenses && finalTotal
    ? ((totalExpenses / finalTotal) * 100).toFixed(3)
    : 0;

  useEffect(()=>{
    const fetchData = async () => {
      const token = authTokens.access;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/recent-activity/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRecentExpenses(data.recent_expenses);
          setRecentIncomes(data.recent_incomes);
          setRecentGoals(data.recent_goals);
          setRecentBudgets(data.recent_budget);
          console.log(data.recent_budget);


          


        } else {
          alert('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
      }
    };

    fetchData();
    

  }, [authTokens.access])


  useEffect(() => {
    const fetchData = async () => {
      const token = authTokens.access;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/expenses/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTotalExpenses(data.total_expenses);
          setMonthly_Expenses(data.monthly_total_expenses);
          setTopTwo(data.weekly_top_two_expenses);
          console.log(data.weekly_top_two_expenses);
          


        } else {
          alert('Failed to fetch expenses');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
      }
    };

    fetchData();
  }, [authTokens.access]);
  useEffect(() => {
    const fetchData = async () => {
      const token = authTokens.access;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/income/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setTotalIncome(data.total_income);
        } else {
          alert('Failed to fetch income');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
      }
    };

    fetchData();
  }, [authTokens.access]);

  useEffect(()=>{
    setFinalTotal(totalExpenses + totalIncome);
    console.log(finalTotal);
  }, [authTokens.access])

  const getLinkToken = async() =>{
    const token = authTokens.access;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/create_link_token/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setLinkToken(data);
      } else {
        alert('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }



  }
  const getTransactions = async() =>{
    const token = authTokens.access;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/fetch_transactions/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        alert('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }



  }

  const renderMonthlyExpenses = () => {
    return Object.keys(monthly_expenses).map(month => (
      <div key={month} className="monthlyExpenseCard">
        <p>
          You had {monthly_expenses[month].expense_count} expenses in {month}
        </p>
      </div>
    ));
  };
  const formatDataForLineChart = (data) => {
    if (!data) return { labels: [], datasets: [] }; 
    const categories = Object.keys(data).reduce((acc, date) => {
      data[date].forEach(([category, value]) => {
        if (!acc.includes(category)) {
          acc.push(category);
        }
      });
      return acc;
    }, []);
  
    const datasets = categories.map((category) => {
      return {
        label: category,
        data: Object.keys(data).map((date) => {
          const value = data[date].find(([cat, _]) => cat === category);
          return value ? value[1] : 0;
        }),
        fill: false,
        borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
      };
    });
  
    return {
      labels: Object.keys(data),
      datasets: datasets,
    };
  };
  const lineChartData = formatDataForLineChart(topTwo)
  
  const { open, ready } = usePlaidLink({
    
    token: linkToken.link_token,
    onSuccess: (public_token, metadata) => {
      const auth = authTokens.access;
      const response = fetch('http://127.0.0.1:8000/api/receive_access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        body: JSON.stringify({
          'public_token': public_token,
          'user': user.user_id
        }),
      });
    },
  });
  
  

  return (
    <div className="homepageContainer">
     



      <div className="contentSection">
        <div className="left-Bar">
          <nav className="leftBar">
            <ul className='leftBar-items'>
              <li className='leftBar-text'><a><div className='icon'><TbSum /></div>Overview</a></li>
              <li className='leftBar-text'><a><div className='icon'><CiSettings /></div>Settings</a></li>
              <li className='leftBar-text'><a onClick={getTransactions}><div className='icon'><CiSettings /></div>Get Transactions</a></li>
              <li className='leftBar-text'><a onClick={getLinkToken}><div className='icon'><FaHandsHelping /></div>Get Help</a></li>
              
              <button onClick={() => open()} disabled={!ready}>
                Connect a bank account
              </button>
              


            </ul>


          </nav>
          

        </div>
        <div className="topcontainer">
          <div className='top_1'>
            Total Expense
            <div className="top_amount">
              ${totalExpenses}
            </div>
          </div>
          
          <div className='top_2'>
            Total Income
            <div className="top_amount">
              ${totalIncome}
            </div>
          </div>

          <div className='top_3'>
            Transaction Summary
            <div className="top_amount">
              <p>{percentageOfTransactions}% are expenses</p>
            </div>
          </div>
          <div className='top_4'>SpaceTaker</div>
        </div>
        <div className="chartSection">
          <LineChart chartdata={lineChartData} />






        </div>


        <div className="cardSection">
          <div className="dataSection">
          <div className='dataBoxHeader'>
            <h5><span className="icon"><GrCurrency /></span> Your Recent Activity</h5>
          </div>

          <div className="dataBox">
            <div className="activity-content">
                  
              <div className="activity-description">
                  <div className="icon">
                    <GiPayMoney />
                  </div>
                  <div className="description-text">{recentExpenses.description}</div>
              </div>

                <div className="activity-date">
                    {recentExpenses.date}
                </div>
            </div>
              <div className="activity-amount" id="expenses">
                  - {recentExpenses.amount}
              </div>
          </div>


          <div className="dataBox">
              <div className="activity-content">

                  {/* Activity Description */}
                  {recentIncomes && recentIncomes.description ? (
                      <div className="activity-description">
                          <div className="icon">
                              <GiReceiveMoney />
                          </div>
                          <div className="description-text">{recentExpenses.description}</div>
                      </div>
                  ) :                       
                  <div className="activity-description">
                    <div className="icon">
                        <GiReceiveMoney />
                    </div>
                    <div className="description-text">No Income Recorded</div>
                  </div>}

                  {/* Activity Date */}
                  {recentIncomes && recentIncomes.date ? (
                      <div className="activity-date">
                          {recentExpenses.date}
                      </div>
                  ) : 
                  <div className="activity-date">
                    for the past 7 days
                  </div>}

              </div>

              {/* Activity Amount */}
              {recentIncomes && recentIncomes.amount ? (
                  <div className="activity-amount" id="income">
                      +{recentExpenses.amount}
                  </div>
              ) : null}

          </div>



          <div className="dataBox">
              <div className="activity-content">

                  {/* Activity Description */}
                  {recentGoals && recentGoals.description ? (
                      <div className="activity-description">
                          <div className="icon">
                            <GoGoal />
                          </div>
                          <div className="description-text">{recentGoals.description}</div>
                      </div>
                  ) :                       
                  <div className="activity-description">
                    <div className="icon">
                        <GoGoal/>
                    </div>
                    <div className="description-text">No Goal Recorded</div>
                  </div>}

                  {/* Activity Date */}
                  {recentGoals && recentGoals.date ? (
                      <div className="activity-date">
                          {recentGoals.date}
                      </div>
                  ) : 
                  <div className="activity-date">
                    for the past 7 days
                  </div>}

              </div>

              {/* Activity Amount */}
              {recentGoals && recentGoals.amount ? (
                  <div className="activity-amount">
                      {recentExpenses.amount}
                  </div>
              ) : null}

          </div>
                
          <div className="dataBox">
              <div className="activity-content">

                  {/* Activity Description */}
                  {recentBudgets && recentBudgets.category ? (
                      <div className="activity-description">
                          <div className="icon">
                            <MdProductionQuantityLimits />
                          </div>
                          <div className="description-text">Budget for {recentBudgets.category.name}</div>
                      </div>
                  ) :                       
                  <div className="activity-description">
                    <div className="icon">
                      <MdProductionQuantityLimits />
                    </div>
                    <div className="description-text">No Goal Recorded</div>
                  </div>}

                  {/* Activity Date */}
                  {recentBudgets && recentBudgets.start_date ? (
                      <div className="activity-date">
                          {recentBudgets.start_date} to {recentBudgets.end_date}
                      </div>
                  ) : null}

              </div>

              {/* Activity Amount */}
              {recentBudgets && recentBudgets.amount ? (
                  <div className="activity-amount">
                      ${recentBudgets.amount}
                  </div>
              ) : null}

          </div>









        </div>

          
        </div>
      </div>
    </div>
  );
}

export default Homepage