import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const CreateExpense = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    // Fetch the list of categories when the component mounts
    const fetchCategories = async () => {
      const token = authTokens.access;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/categories/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          // Set the selectedCategory to the first category in the list
          if (data.length > 0) {
            setSelectedCategory(data[0].id);
          }
        } else {
          alert('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
      }
    };

    fetchCategories();
  }, [authTokens.access]);

  const expenseSubmit = async (e) => {
    e.preventDefault();
    const token = authTokens.access;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/create-expense/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          'amount': parseInt(e.target.amount.value),
          'description': e.target.description.value,
          'category': parseInt(selectedCategory), // Use the selected category ID
          'user': user.user_id
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
      <form onSubmit={expenseSubmit}>
        <input type='integer' name='amount' placeholder='Enter Amount' />
        <input type='text' name='description' placeholder='Enter description' />

        <select
          name='category'
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.name} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input type='submit' name='submit' />
      </form>
    </div>
  );
};

export default CreateExpense;
