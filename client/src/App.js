
import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";



function App() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  async function refreshToken(){
    console.log("refresh token");
    try{
      const [, refreshToken] = fetchCookies();
      const res = await axios.post("/refresh", {token: refreshToken});
      setUser({
        ...user,accessToken: res.data.accessToken, refreshToken: res.data.refreshToken
      })
      document.cookie = "access=" + res.data.accessToken;
      document.cookie = "refresh=" + res.data.refreshToken;
      return res.data;
    }catch(err){
      console.log(err);
    }
  }

  const axiosJWT = axios.create();
  

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const [accessToken] = fetchCookies();
      const decodedToken = jwt_decode(accessToken);
      console.log(new Date(decodedToken.exp * 1000));
      if(decodedToken.exp * 1000 < currentDate.getTime()){
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken; 
      }
      return config
    }, (error)=>{return Promise.reject(error)}
  )

  useEffect(function(){
    logFromJWT();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  function fetchCookies(){
    let cookies = document.cookie;
    let response = [];
    if(cookies){
      cookies = cookies.split(";");
      let accessToken = cookies[0].split("=")[1];
      let refreshToken = cookies[1].split("=")[1];
      response = [accessToken, refreshToken]
    }
    return response;
  }

  async function logFromJWT(){
    const [accessToken, refreshToken] = fetchCookies();
    if(accessToken&&refreshToken){
      try {
        const config = {
          headers:{
            authorization: "Bearer " + accessToken,
          }
        };
        const data ={
          token: accessToken,
          refresh: refreshToken
        }
        const response = await axiosJWT.post("/loginJWT", data, config);
        console.log(response.data);
        setUser(response.data);
      } catch (error) {
        console.log(error);
      }
    }
  }

  function alertSuccess(){
    setSuccess(true);
    setTimeout(function(){
      setSuccess(false);
  }, 2000);
  }

  function alertError(){
    setError(true);
    setTimeout(function(){
      setError(false);
  }, 2000);
  }

  function handleTextChange(e){
    setUsername(e.target.value);
  }

  function handlePasswordChange(e){
    setPassword(e.target.value);
  }
  
  

  async function handleDelete(e, id){
    e.preventDefault();
    setSuccess(false);
    setError(false);
    console.log("delete");
    try{
      await axiosJWT.delete("/users/"+id, {
        headers: {authorization: "Bearer " + user.accessToken}
      });
      alertSuccess();
    } catch (err){
      alertError(true);
    }
  }

  async function login(e){
    e.preventDefault();
    try{
      const res = await axios.post("/login", {username, password});
      setUser(res.data);
      setUsername("");
      setPassword("");
      document.cookie = "access=" + res.data.accessToken;
      document.cookie = "refresh=" + res.data.refreshToken;
    } catch(err){
      console.log(err);
    }
  }

  async function handleLogout(e){
    e.preventDefault();
    try {
      const config = {
        headers:{
          authorization: "Bearer " + user.accessToken,
        }
      };
      const data ={
        token: user.refreshToken,
      }
      await axiosJWT.post("/logout", data, config);
      setUser(null);
      setPassword("");
      setUsername("");
      setSuccess("");
      setError("");
      document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
      console.log(error)
    }
  }

  if(user === null){
    return (
    
      <div className='login'>
        <form>
          <header><h2>Login</h2></header>
          <div className='input-group'>
            <div>
              <label htmlFor='username'>Username</label>
              <input required onChange={handleTextChange} value={username} name="username" type="text"/>
              
            </div>
            <div>
              <label htmlFor='password'>Password</label>
              <input value={password} required onChange={handlePasswordChange} type="password" name="password"/>
              
            </div>
          </div>
          
          <footer>
            <button onClick={login}>Login</button>
          </footer>
          
        </form>
      </div>
    );
  }

  return (
    <div className='content'>
      {success && (
            <div className='msg-success'>User deleted successfully</div>
          )}
          {error &&(
            <div className='msg-error'>You can not delete this user</div>
          )}
      <div className='dashboard'>
        <header><h2>Dashboard</h2></header>
        <div className="dashboard-body">
          <div><strong>User: </strong>{user.username}</div>
          <div><strong>Role: </strong>{user.isAdmin ? "Admin" : "User"}</div>
          
          {/* <div
          className={`msg-error ${error ? 'show' : 'hidden'}`}
          onTransitionEnd={() => setError(false)}
        >
          <strong>Error</strong>
          </div> */}
          {/* <div
          className={`msg-success ${success ? 'show' : 'hidden'}`}
          onTransitionEnd={() => setSuccess(false)}
        >
          <strong>Success!</strong>
        </div> */}
        </div>
        
        <footer>
          <button onClick={handleLogout}>Log out</button>
          <button onClick={(e)=>handleDelete(e,1)}>Delete John</button>
          <button onClick={(e)=>handleDelete(e,2)}>Delete Jane</button>
        </footer>
        
      </div>
      
    </div>
  )

  }


  

export default App;
