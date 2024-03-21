import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const CreateIncomeCategory = () => {
  const { user, authTokens } = useContext(AuthContext);

  const categoryIncomeSubmit = async (e) => {
    e.preventDefault();
    const token = authTokens.access; // Access the JWT token from the authTokens object
    try {
      const response = await fetch('http://127.0.0.1:8000/api/create-incomecategory/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
        body: JSON.stringify({ 'name': e.target.name.value, 'slug': e.target.slug.value, 'user': user.user_id }),
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
      <form onSubmit={categoryIncomeSubmit}>
        <input type='text' name='name' placeholder='Enter Name' />
        <input type='text' name='slug' placeholder='Enter slug' />
        <input type='submit' name='submit' />
      </form>
    </div>
  );
};

export default CreateIncomeCategory;
