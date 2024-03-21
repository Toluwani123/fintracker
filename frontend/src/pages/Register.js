import React from 'react'
import { withRouter, useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const createUser = async(e)=> {
        e.preventDefault()
        const response = await fetch('http://127.0.0.1:8000/api/register/', {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'

            },
            body: JSON.stringify({'username':e.target.username.value,'email':e.target.email.value,'first_name':e.target.first_name.value, 'last_name':e.target.last_name.value, 'password':e.target.password.value, 'confirm_password':e.target.password2.value})
        })
        let data = await response.json()
        console.log('data:', data)

        if(response.status === 201){
            alert('User successfully Created!!');
            let Minutes = 1000 * 20
            setInterval(() => {
                navigate('/login')
                
    
            }, Minutes)
           

        }else{
            alert('Something went wrong')
        }
        console.log('response:', response)
        
    }
  return (
    <form onSubmit={createUser}>
        <input type='text' name='username' placeholder='Enter username'/>
        <input type='email' name='email' placeholder='Enter email'/>
        <input type='text' name='first_name' placeholder='Enter Firstname'/>
        <input type='text' name='last_name' placeholder='Enter Lastname'/>
        <input type='password' name='password' placeholder='Enter password'/>
        <input type='password' name='password2' placeholder='Enter password again'/>
        <input type='submit' name='submit'/>

    </form>

    
  )
}

export default Register