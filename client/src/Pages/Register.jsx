import { useState } from "react"
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function Register(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    function handleUsernameChange(e){
        setUsername(e.target.value);
    }

    function handlePasswordChange(e){
        setPassword(e.target.value);
    }

    async function register(e){
        e.preventDefault();
        try {
            const res = await axios.post("/user", {username: username, password:password});
            if(res.status === 201){
                navigate('/')   
            }

        } catch (error) {
            console.log(error);
        }
        
    }


    function isButttonDisabled(){
        if(!password || !username){
            return true;
        }
        if(password.length < 8){
            return true;
        }
        return false;
    }



    return(
        <div className='login'>
            <form>
            <header><h2>Register</h2></header>
            <div className='input-group'>
                <div>
                <label htmlFor='username'>Username</label>
                <input required name="username" type="text" value={username} onChange={handleUsernameChange}/>
                
                </div>
                <div>
                <label htmlFor='password'>Password</label>
                <input required type="password" name="password" value={password} onChange={handlePasswordChange}/>
                
                </div>
            </div>
            
            <footer>  
                <button disabled={isButttonDisabled() ? true : false} type="submit" onClick={register}>Register</button>
            </footer>
            
            </form>
        </div>
    )
}