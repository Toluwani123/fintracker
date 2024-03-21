import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Container, Row, Col, ProgressBar, Button, Modal, Form } from 'react-bootstrap';
import { Card, Stack } from 'react-bootstrap';
import { currencyFormatter } from '../components/utils';

import PieChart from '../components/PieChart';

const Expenses = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [highestExpense, setHighestExpense] = useState(null);
  const [lowestExpense, setLowestExpense] = useState(null);
  const [final, setFinal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [updatedAmount, setUpdatedAmount] = useState('');
  const [expenseIdToUpdate, setExpenseIdToUpdate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [percentages, setPercentages] = useState([]);

  const stat = (amount, max) => {
    if (amount > max) {
      return 'bg-danger bg-opacity-10';
    }
    return '';
  };
  const categorySubmit = async (e) => {
    e.preventDefault();
    const token = authTokens.access; // Access the JWT token from the authTokens object
    try {
      const response = await fetch('http://127.0.0.1:8000/api/create-category/', {
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
        window.location.reload()
      } else {
        alert('Something went wrong');
      }

      console.log('response:', response);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
  };
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
        window.location.reload()
      } else {
        alert('Something went wrong');
      }

      console.log('response:', response);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
  };

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
          setExpenses(data.expenses);
          setHighestExpense(data.highest_expense);
          setLowestExpense(data.lowest_expense);
          setFinal(data.final);
          setPercentages(data.category_percentages);
          console.log(data.weekly_top_two_expenses);
          console.log(data.total_expenses);
          console.log(data.final);
         

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

  const handleShowModal2 = () => {
    setShowModal2(true);
  };

  const handleCloseModal2 = () => {
    setShowModal2(false);
  };
  const handleShowModal3 = () => {
    setShowModal3(true);
  };

  const handleCloseModal3 = () => {
    setShowModal3(false);
  };

  const handleShowModal = (expenseId, currentAmount) => {
    setExpenseIdToUpdate(expenseId);
    setUpdatedAmount(currentAmount);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlepress = async (id) => {
    const token = authTokens.access;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/edit-expenses/' + id + '/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Expense deleted successfully.');
        setExpenses(expenses.filter(item => item.id !== id));
      } else {
        alert('Failed to delete the expense.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
    window.location.reload();
  };

  const handleInputChange = async (e, id) => {
    e.preventDefault();
    const token = authTokens.access;
    const updatedAmount = parseInt(e.target.change.value);

    const expenseToUpdate = expenses.find(item => item.id === id);
    const currentDescription = expenseToUpdate.description;

    const data = {
      amount: updatedAmount,
      description: currentDescription,
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/edit-expenses/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Expense updated successfully.');
      } else {
        alert('Failed to update the expense. Please check your input and try again.');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
  };

  function getProgressBarVariant(amount, max) {
    const ratio = amount / max;
    if (ratio < 0.5) return 'primary';
    if (ratio < 0.75) return 'warning';
    return 'danger';
  }

  function getFinalAmount(categoryName) {
 
    
    const categoryIndex = final.findIndex(item => item[1] === categoryName);
    return categoryIndex !== -1 ? final[categoryIndex] : null;
  }

  return (
    <Container className='my-4'>
      <h2 className='text-center mb-4'>Expenses</h2> 
      
      <Row>
        <Button variant='outline-primary' className='ms-auto' onClick={() => handleShowModal2()}>Create Expense</Button>
        <Button variant='outline-primary' className='ms-auto' onClick={() => handleShowModal3()}>Create Expense Category</Button>
        <Col md={{ span: 6, offset: 3 }}>
          {highestExpense && (
            <Card className='mb-4 shadow'>
              <Card.Body>
                <Card.Title className='text-center'>
                  <h4>Highest Expense</h4>
                  <h3 className='fw-bold'>{currencyFormatter.format(highestExpense)}</h3>
                </Card.Title>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          {lowestExpense && (
            <Card className='mb-4 shadow'>
              <Card.Body>
                <Card.Title className='text-center'>
                  <h4>Lowest Expense</h4>
                  <h3 className='fw-bold'>{currencyFormatter.format(lowestExpense)}</h3>
                </Card.Title>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Row className='justify-content-center mt-4'>
        <Col md={10} className='d-flex justify-content-center'>
          <div style={{ width: '500px', height: '500px' }}> {/* Set a specific width and height for the PieChart container */}
            <PieChart chartdata={{
              labels: percentages.map((item) => item.category),
              datasets: [
                {
                  label: "Percentages",
                  data: percentages.map((item) => item.percentage),
                  backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                  ],
                  hoverOffset: 4
                },
              ]
            }} />
          </div>
        </Col>
      </Row>



       

      

      

      <Row className='justify-content-center'>
        {expenses.map(item => (
          <Col md={6} key={item.id}>
            <Card className={stat(item.amount, parseInt(getFinalAmount(item.category.name)))}>
              <Card.Body>
                <Card.Title className='d-flex justify-content-between align-items-baseline fw-normal mb-3'>
                  <div className='me-2'>{item.description} in {item.category.name}</div>
                  <div className='d-flex align-items-baseline'>
                    {currencyFormatter.format(item.amount)}
                    <span className='text-muted fs-6 ms-1'>/{currencyFormatter.format(parseInt(getFinalAmount(item.category.name)))}</span>
                  </div>
                </Card.Title>
                <ProgressBar className='rounded-pill' variant={getProgressBarVariant(item.amount, parseInt(getFinalAmount(item.category.name)))} now={item.amount} min={0} max={parseInt(getFinalAmount(item.category.name))} />
                <Stack direction='horizontal' gap='2' className='mt-4'>
                  <Button variant='outline-primary' className='ms-auto' onClick={() => handleShowModal(item.id, item.amount)}>Edit Expense</Button>
                  <Button variant='danger' onClick={() => handlepress(item.id)}>Delete Expense</Button>
                  
                </Stack>
                <Stack direction='horizontal' gap='2' className='mt-4'>
                  <h4>Date: {item.date}</h4>
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleInputChange(e, expenseIdToUpdate)}>
            <Form.Group controlId="amount">
              <Form.Label>Amount:</Form.Label>
              <Form.Control type="text" name="change" placeholder='Change Amount' value={updatedAmount} onChange={(e) => setUpdatedAmount(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showModal2} onHide={handleCloseModal2}>
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={expenseSubmit}>
            <Form.Group controlId='amount'>
              <Form.Label>Amount:</Form.Label>
              <Form.Control type='integer' name='amount' placeholder='Enter Amount'/>
            </Form.Group>
            <Form.Group controlId='description'>
              <Form.Label>Description:</Form.Label>
              <Form.Control type='text' name='description' placeholder='Description'/>
            </Form.Group>
            <Form.Group controlId='category'>
              <Form.Label>Category:</Form.Label>
              <Form.Select size="sm"  name='category' value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((category) => (
                    <option key={category.name} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            
            <Button variant="primary" type="submit">
              Submit
            </Button>

          </Form>
          
        </Modal.Body>
      </Modal>

      <Modal show={showModal3} onHide={handleCloseModal3}>
        <Modal.Header closeButton>
          <Modal.Title>Add Expense Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={categorySubmit}>
            <Form.Group controlId='name'>
              <Form.Label>Name:</Form.Label>
              <Form.Control type='text' name='name' placeholder='Enter Name'/>
            </Form.Group>
            <Form.Group controlId='slug'>
              <Form.Label>Confirm Name:</Form.Label>
              <Form.Control type='text' name='slug' placeholder='Please confirm the category name'/>
            </Form.Group>
            
            <Button variant="primary" type="submit">
              Submit
            </Button>

          </Form>
          
        </Modal.Body>
      </Modal>

      
    </Container>
  );
};

export default Expenses;
