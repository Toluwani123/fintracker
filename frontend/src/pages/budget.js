import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Budget = () => {
    const { user, authTokens } = useContext(AuthContext);
    const [budget, setBudget] = useState([]);
    
  
    useEffect(() => {
      const fetchData = async () => {
        const token = authTokens.access;
        try {
          const response = await fetch('http://127.0.0.1:8000/api/budgets/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setBudget(data.budget);
            
          } else {
            alert('Failed to fetch Budget');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Something went wrong');
        }
      };
  
      fetchData();
    }, [authTokens.access]);
  
    const handlepress = async (id) => {
      const token = authTokens.access;
    
      try {
        const response = await fetch('http://127.0.0.1:8000/api/edit-budget/' + id + '/', {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${token}`,
            },
        });
    
        if (response.ok) {
          console.log('Budget deleted successfully.');
          // Optionally, you can remove the deleted expense from the local state (expenses)
          setBudget(budget.filter(item => item.id !== id));
          // You can also update highestExpense and lowestExpense based on the updated expenses state.
          // setHighestExpense(updatedHighestExpense);
          // setLowestExpense(updatedLowestExpense);
        } else {
          alert('Failed to delete the budget.');
        }
    
        // Reload the component after the deletion (optional)
        window.location.reload();
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
      }
    };
    const handleInputChange = async (e, id) => {
      e.preventDefault();
      const token = authTokens.access;
      const updatedAmount = parseInt(e.target.change.value);
      
      // Get the current description from the expenses state
      
    
      const data = {
        amount: updatedAmount,
        
      };
    
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/edit-budget/${id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
        if (response.ok) {
          console.log('Budget updated successfully.');
          // Optionally, you can update the local state (expenses) to reflect the updated expense.
          // setExpenses(updatedExpenses);
        } else {
          alert('Failed to update the Budget. Please check your input and try again.');
        }
    
        // Reload the component after the update (optional)
        window.location.reload();
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
      }
    };
    
    return (
      <div>
        <div>
          {budget.map(item => (
            <div className='catalog-product' key={item.id}>
              <h3>Amount: {item.amount}</h3>
              <h1>Id: {item.id}</h1>
              <h3>Start Date: {item.start_date}</h3>
              <h3>End Date: {item.end_date}</h3>
              <h3>Category: {item.category.name}</h3>
              <p onClick={() => handlepress(item.id)}>
                  <span>Remove</span>
              </p>
              <form onSubmit={(e) => handleInputChange(e, item.id)}>
                <input type="text" name="change" placeholder='Change Amount' />
                <input type='submit' name='submit' />
              </form>
              
            </div>
          ))}
        </div>
        
      </div>
    );
}

export default Budget;