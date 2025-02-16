import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { withRouter, useNavigate } from 'react-router-dom';

const AuthContext = createContext()



export default AuthContext;

export const AuthProvider = ({children}) => {

    
    const navigate = useNavigate();

    let [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')): null)
    let [authTokens, setauthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')): null)
    let [loading, setLoading] = useState(true)

    let loginUser = async(e)=> {
        e.preventDefault()
        let response = await fetch('http://127.0.0.1:8000/api/token/', {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'

            },
            body: JSON.stringify({'username':e.target.username.value, 'password':e.target.password.value})
        })
        let data = await response.json()
        console.log('data:', data)

        if(response.status === 200){
            setauthTokens(data)
            setUser(jwt_decode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            navigate('/')

        }else{
            alert('Something went wrong')
        }
        console.log('response:', response)
        
    }
    let logoutUser = () =>{
        setauthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate('/login')

    }

    let contextData = {
        user:user,
        authTokens:authTokens,
        loginUser:loginUser,
        logoutUser:logoutUser
        
    }

    let refreshToken = async () => {
        console.log("This actually works")
        let response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'

            },
            body: JSON.stringify({'refresh': authTokens?.refresh})
        })
        let data = await response.json()

        if (response.status === 200){
            setauthTokens(data)
            setUser(jwt_decode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            
        }else{
            logoutUser()

        }
        if(loading){
            setLoading(false)
        }

    }
    useEffect(()=>{
        if(loading){
            refreshToken()
        }

        let fourMinutes = 1000 * 60 *4

        let interval = setInterval(() => {
            if(authTokens){
                refreshToken()
            }

        }, fourMinutes)
        return ()=> clearInterval(interval)

    }, [authTokens, loading])


    return(
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    )
}