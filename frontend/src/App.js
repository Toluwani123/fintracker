import Homepage from './pages/Homepage';
import Login from './pages/Login';
import './App.css';
import {Routes, Route} from "react-router-dom";
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute'
import React, {Fragment} from 'react';
import CreateCategory from './pages/createCategory';
import CreateExpense from './pages/createExpense';
import CreateIncomeCategory from './pages/createIncomeCategory';
import CreateIncome from './pages/createIncome';
import Expenses from './pages/expenses';
import Income from './pages/income';
import CreateBudget from './pages/createBudget';
import CreateGoal from './pages/createGoal';
import Budget from './pages/budget';
import Goal from './pages/goal';
import Register from './pages/Register';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <Fragment>
      
        <Navbar/>
        
        
        <Routes>
          
          <Route path="/login" element={<Login/>}/>
          <Route path="/createCat" element={<CreateCategory/>}/>
          <Route path="/createExp" element={<CreateExpense/>}/>
          <Route path="/createIncCat" element={<CreateIncomeCategory/>}/>
          <Route path="/createInc" element={<CreateIncome/>}/>
          <Route path="/expenses" element={<Expenses/>}/>
          <Route path="/income" element={<Income/>}/>
          <Route path="/createBudg" element={<CreateBudget/>}/>
          <Route path="/createGoal" element={<CreateGoal/>}/>
          <Route path="/budget" element={<Budget/>}/>
          <Route path="/goal" element={<Goal/>}/>
          <Route path="/register" element={<Register/>}/>
          

          <Route exact path='/' element={<PrivateRoute/>}>
            <Route exact path='/' element={<Homepage/>}/>
          </Route>
          
        </Routes>
      </Fragment>
      
    </div>
  );
}

export default App;
