import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const CreateBudget = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStartDate, setStartSelectedDate] = useState('');
  const [selectedEndDate, setEndSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

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
          console.log(data)
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
      } finally {
        setLoading(false); // Set loading to false when the fetch completes
      }
    };

    fetchCategories();
  }, [authTokens.access]);

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
      const response = await fetch('http://127.0.0.1:8000/api/create-budget/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          'amount': parseInt(e.target.amount.value),
          'category': parseInt(selectedCategory),
          'user': user.user_id,
          'start_date': selectedStartDate,
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
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={budgetSubmit}>
          <input type='integer' name='amount' placeholder='Enter Amount' />

          <input
            type='date'
            name='start_date'
            value={selectedStartDate}
            min={formatDate(new Date())}
            onChange={(e) => setStartSelectedDate(e.target.value)}
          />
          <input
            type='date'
            name='end_date'
            value={selectedEndDate}
            min={formatDate(new Date())}
            onChange={(e) => setEndSelectedDate(e.target.value)}
          />


          <select
            name='category'
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input type='submit' name='submit' />
        </form>
      )}
    </div>
  );
};

export default CreateBudget;
