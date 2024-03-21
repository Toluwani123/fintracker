import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import { Container } from 'react-bootstrap'
import {Button, Stack } from 'react-bootstrap'

const Header = () => {

  let {user, logoutUser} = useContext(AuthContext)
  return (
    <Container className='my-4'>
      <Stack direction='horizontal' gap="3" className='mb-4'>
        <h1 className='me-auto'>Budgets</h1>
        <Button href="/"variant='secondary'>Home</Button>
        <Button href="/expenses" variant='primary'>Expenses</Button>
        <Button href="/income" variant='outline-primary'>Income</Button>

      </Stack>
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/createCat">CreateCategory</Link>
        <Link to="/createExp">CreateExpense</Link>
        <Link to="/createInc">CreateIncome</Link>
        <Link to="/createIncCat">CreateIncomeCategory</Link>
        
        
        <Link to="/createBudg">CreateBudget</Link>
        <Link to="/createGoal">CreateGoal</Link>
        <Link to="/budget">Budgets</Link>
        <Link to="/goal">Goal</Link>

        <span> | </span>

        {user ? (
            <p onClick={logoutUser}>Logout</p>
        ): (<Link to='/login'>Login</Link>)}
        
        
        {user && <p>Hello {user.username}</p>}
        

       
    </Container>
  )
}

export default Header