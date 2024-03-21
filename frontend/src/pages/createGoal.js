import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';


const CreateGoal = () => {
    const { user, authTokens } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [selectedEndDate, setEndSelectedDate] = useState('');
    const [loading, setLoading] = useState(true);
    
  
    
    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
  
    const budgetSubmit = async (e) => {
      e.preventDefault();
      const token = authTokens.access;
  
      try {
        const response = await fetch('http://127.0.0.1:8000/api/create-goal/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            'amount': parseInt(e.target.amount.value),
            'description': e.target.description.value,
            'title': e.target.title.value,
            'user': user.user_id,
            'end_date': selectedEndDate,
          }),
        });
  
        const data = await response.json();
        console.log('data:', data);
  
        if (response.status === 201) { // 201 indicates successful resource creation
          console.log("Worked");
        } else {
          alert('Something went wrong');
        }
  
        console.log('response:', response);
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
      }
    };
  
    return (
      <div>
        
        <form onSubmit={budgetSubmit}>
            <input type='text' name='title' placeholder='Enter Title' />
            <input type='integer' name='amount' placeholder='Enter Amount' />

            <input type='text' name='description' placeholder='Enter description' />


            <input
                type='date'
                name='end_date'
                value={selectedEndDate}
                min={formatDate(new Date())}
                onChange={(e) => setEndSelectedDate(e.target.value)}
            />


            

            <input type='submit' name='submit' />
        </form>
      
      </div>
    );
}

export default CreateGoal