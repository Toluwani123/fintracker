import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Container, Row, Col, Button, Modal, Form, Card, Stack, ButtonGroup } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlusCircle } from 'react-icons/fa';
import { currencyFormatter } from '../components/utils';
import { Bar } from 'react-chartjs-2';
import IncomeTable from '../components/incomeTable';


const Income = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [income, setIncome] = useState([]);
  const [highestIncome, setHighestIncome] = useState(null);
  const [lowestIncome, setLowestIncome] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [updatedAmount, setUpdatedAmount] = useState('');
  const [incomeIdToUpdate, setIncomeIdToUpdate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  const handleShowModal = (incomeId, currentAmount) => {
    setIncomeIdToUpdate(incomeId);
    setUpdatedAmount(currentAmount);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleShowModal2 = () => {
    setShowModal2(true);
    console.log(categories)
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
  const incomeChartData = {
    labels: income.map(item => item.category.name),
    datasets: [{
      label: 'Income by Category',
      data: income.map(item => item.amount),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };
  

  useEffect(() => {
    // Fetch the list of categories when the component mounts
    const fetchCategories = async () => {
      const token = authTokens.access;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/incomecategories/', {
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

  const incomeSubmit = async (e) => {
    e.preventDefault();
    const token = authTokens.access;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/create-income/', {
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
        const response = await fetch('http://127.0.0.1:8000/api/income/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setIncome(data.income);
          setHighestIncome(data.highest_income);
          setLowestIncome(data.lowest_income);
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

  const handlepress = async (id) => {
    const token = authTokens.access;
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/edit-income/' + id + '/', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
          },
      });
  
      if (response.ok) {
        console.log('Income deleted successfully.');
        // Optionally, you can remove the deleted expense from the local state (expenses)
        setIncome(income.filter(item => item.id !== id));
        // You can also update highestExpense and lowestExpense based on the updated expenses state.
        // setHighestExpense(updatedHighestExpense);
        // setLowestExpense(updatedLowestExpense);
      } else {
        alert('Failed to delete the Income.');
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
    const incomeToUpdate = income.find(item => item.id === id);
    const currentDescription = incomeToUpdate.description;
  
    const data = {
      amount: updatedAmount,
      description: currentDescription, // Include the description in the payload
    };
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/edit-income/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        console.log('Income updated successfully.');
        // Optionally, you can update the local state (expenses) to reflect the updated expense.
        // setExpenses(updatedExpenses);
      } else {
        alert('Failed to update the Income. Please check your input and try again.');
      }
  
      // Reload the component after the update (optional)
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
  };
  
  return (
    <Container className='my-4'>
      <h2 className='text-center mb-4'>Income</h2>

      

      <Row className='justify-content-center mb-4'>
        <Button variant='outline-primary' className='ms-auto' onClick={() => handleShowModal2()}><FaPlusCircle /> Create Income</Button>
        <Button variant='outline-primary' className='ms-auto' onClick={() => handleShowModal3()}> =<FaPlusCircle />Create Income Category</Button>

      </Row>




      {viewMode === 'cards' && (
       
        <Row className='income-list justify-content-center income-cards'>
          {income.map(item => (
            <Col md={6} key={item.id}>
              <Card className='mb-3 shadow'>
                <Card.Body>
                  <Card.Title className='d-flex justify-content-between align-items-baseline fw-normal mb-3'>
                    <div className='me-2'>{item.description} in {item.category.name}</div>
                    <div className='d-flex align-items-baseline'>{currencyFormatter.format(item.amount)}</div>
                  </Card.Title>
                  
                  <Stack direction='horizontal' gap='2' className='mt-4'>
                    <Button variant='outline-primary' className='ms-auto' onClick={() => handleShowModal(item.id, item.amount)}>Edit Income</Button>
                    <Button variant='danger' onClick={() => handlepress(item.id)}>Delete Income</Button>
                  </Stack>
                  <Stack direction='horizontal' gap='2' className='mt-4'>
                    <h4>Date: {item.date}</h4>
                  </Stack>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {viewMode === 'table' && (
        <IncomeTable data={income} />
      )}
      <ButtonGroup className="toggle-view mb-4 centered-button-group">
        <Button onClick={() => setViewMode('cards')}>Card View</Button>
        <Button onClick={() => setViewMode('table')}>Table View</Button>
      </ButtonGroup>
      <Row className='my-4 chart-section'>
        <Col>
          <Bar data={incomeChartData} />
        </Col>
      </Row>

      <Row className='income-cards'>
        <Col md={4}>
          <Card className='shadow-lg mb-4'>
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <h3>{currencyFormatter.format(totalIncome)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          {highestIncome && (
            
            <Card className='shadow-lg mb-4'>
              <Card.Body>
                <Card.Title>Highest Income</Card.Title>
                <h3>{currencyFormatter.format(highestIncome)}</h3>
              </Card.Body>
            </Card>
            
          )}
        </Col>
        <Col md={4}>
          {lowestIncome && (
            
            <Card className='shadow-lg mb-4'>
              <Card.Body>
                <Card.Title>Highest Income</Card.Title>
                <h3>{currencyFormatter.format(lowestIncome)}</h3>
              </Card.Body>
            </Card>
            
          )}
        </Col>
      </Row>

   



      


      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Income</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleInputChange(e, incomeIdToUpdate)}>
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
          <Modal.Title>Add Income</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={incomeSubmit}>
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
              <Form.Select size="sm" name='category' value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
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
          <Modal.Title>Add Income Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={categoryIncomeSubmit}>
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

export default Income;
